import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { CloudFormationClient, DescribeStacksCommand, CreateStackCommand, UpdateStackCommand } from "@aws-sdk/client-cloudformation";
import { LambdaClient, GetFunctionCommand, CreateFunctionCommand, UpdateFunctionCodeCommand, UpdateFunctionConfigurationCommand, InvokeCommand } from "@aws-sdk/client-lambda";
import { NodeHttpHandler } from "@smithy/node-http-handler";

export class SafeError extends Error {}

const REGION = "us-east-1";
const RESPONSE_LIMIT = 2 * 1024 * 1024;
const INVOKE_LIMIT = 256 * 1024;
const NO_LOG = Object.freeze({ trace() {}, debug() {}, info() {}, warn() {}, error() {} });
const ENDPOINTS = Object.freeze({
  sts: "https://sts.us-east-1.amazonaws.com",
  cloudformation: "https://cloudformation.us-east-1.amazonaws.com",
  lambda: "https://lambda.us-east-1.amazonaws.com"
});

function transportError(name) { return Object.assign(new Error("Preview transport stopped. Details suppressed."), { name }); }

export function classifyAwsFailure(error) {
  // Raw names/messages can contain secrets. Only literal labels leave this boundary.
  const text = typeof error === "string" ? error : `${error?.name || ""} ${error?.message || ""}`;
  if (/PreviewResponseLimitError/.test(text)) return "response-limit";
  if (/AbortError|TimeoutError|PreviewDeadlineError|PreviewStoppedError/.test(text)) return "timeout";
  if (/AccessDenied|not authorized to perform/.test(text)) return "access-denied";
  if (/Invalid JSON/.test(text)) return "cli-input-json";
  if (/Unable to load paramfile|Error parsing parameter.*cli-input-json/.test(text)) return "cli-input-file";
  if (/Parameter validation failed/.test(text)) return "cli-parameter-validation";
  if (/Unknown options/.test(text)) return "cli-options";
  if (/ValidationError|InvalidParameterValueException|InvalidRequestContentException|SerializationException/.test(text)) return "aws-validation";
  if (/TooManyRequests|Throttl/.test(text)) return "throttled";
  if (/ResourceConflict|PreconditionFailed/.test(text)) return "conflict";
  if (/ECONN|ENOTFOUND|EAI_AGAIN|Could not connect|Connect timeout|Read timeout/.test(text)) return "network";
  return "unclassified";
}

function testEndpoint(value) {
  let url;
  try { url = new URL(value); } catch { throw new SafeError("Test endpoint is invalid."); }
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new SafeError("Test endpoint must be an explicit loopback HTTP origin.");
  }
  return url.origin;
}

function positiveInteger(value, fallback, maximum) {
  if (value === undefined) return fallback;
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new SafeError("SDK test timing option is invalid.");
  return value;
}

function argument(args, key) {
  const index = args.indexOf(key);
  if (index < 0 || typeof args[index + 1] !== "string" || !args[index + 1]) throw new SafeError("AWS operation is missing a required argument.");
  return args[index + 1];
}

function requestInput(value) {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch { throw new SafeError("AWS operation input is invalid. No input contents were logged."); }
}

function updateResult(value) {
  return { State: value.State, LastUpdateStatus: value.LastUpdateStatus, RevisionId: value.RevisionId, CodeSha256: value.CodeSha256 };
}

function configuration(value) {
  const config = value?.Configuration;
  if (!config || typeof config !== "object") throw new SafeError("AWS returned an unexpected function response. No response contents were logged.");
  const variables = config.Environment?.Variables || {};
  const logging = config.LoggingConfig || {};
  return {
    FunctionName: config.FunctionName, Role: config.Role, Runtime: config.Runtime,
    Architectures: config.Architectures, State: config.State, LastUpdateStatus: config.LastUpdateStatus,
    RevisionId: config.RevisionId, CodeSha256: config.CodeSha256, Handler: config.Handler,
    LayerArns: config.Layers?.map((layer) => layer.Arn), MemorySize: config.MemorySize, Timeout: config.Timeout,
    LoggingConfig: Object.fromEntries(["LogFormat", "ApplicationLogLevel", "SystemLogLevel", "LogGroup"].filter((key) => typeof logging[key] === "string").map((key) => [key, logging[key]])),
    PublicOrigin: variables.PREVIEW_PUBLIC_ORIGIN, ExecWrapper: variables.AWS_LAMBDA_EXEC_WRAPPER,
    Tags: Object.fromEntries(["ManagedBy", "PreviewSite"].filter((key) => typeof value.Tags?.[key] === "string").map((key) => [key, value.Tags[key]]))
  };
}

async function zipBytes(zipPath) {
  if (typeof zipPath !== "string" || !zipPath) throw new SafeError("AWS operation is missing the preview package path.");
  try {
    const bytes = await readFile(zipPath);
    if (bytes.length === 0 || bytes.length > 50 * 1024 * 1024) throw new Error();
    return bytes;
  } catch { throw new SafeError("Preview package could not be read or its size is invalid."); }
}

class BoundedHttpHandler {
  constructor() {
    this.inner = new NodeHttpHandler({ connectionTimeout: 10_000, socketTimeout: 60_000, logger: NO_LOG });
    this.metadata = this.inner.metadata;
  }
  async handle(request, options) {
    const result = await this.inner.handle(request, options);
    const stream = result.response.body;
    const declared = result.response.headers["content-length"];
    if (declared !== undefined && (!/^\d+$/.test(declared) || Number(declared) > RESPONSE_LIMIT)) {
      stream.destroy();
      throw transportError("PreviewResponseLimitError");
    }
    const signal = options?.abortSignal;
    const stop = () => stream.destroy(transportError("PreviewDeadlineError"));
    signal?.addEventListener("abort", stop, { once: true });
    const chunks = []; let bytes = 0;
    try {
      if (signal?.aborted) throw transportError("PreviewDeadlineError");
      for await (const chunk of stream) {
        bytes += chunk.length;
        if (bytes > RESPONSE_LIMIT) throw transportError("PreviewResponseLimitError");
        chunks.push(chunk);
      }
      result.response.body = Readable.from([Buffer.concat(chunks, bytes)]);
      return result;
    } catch (error) {
      stream.destroy();
      throw error;
    } finally {
      signal?.removeEventListener("abort", stop);
    }
  }
  destroy() { this.inner.destroy(); }
  updateHttpClientConfig(...args) { this.inner.updateHttpClientConfig(...args); }
  httpHandlerConfigs() { return this.inner.httpHandlerConfigs(); }
}

export function awsRunner(env, options = {}) {
  const requestTimeoutMs = positiveInteger(options.requestTimeoutMs, 60_000, 180_000);
  const stackWaitMs = positiveInteger(options.stackWaitMs, 15 * 60_000, 15 * 60_000);
  const pollMs = positiveInteger(options.pollMs, 3_000, 30_000);
  const endpoints = { ...ENDPOINTS };
  for (const [key, value] of Object.entries(options.endpoints || {})) {
    if (!(key in endpoints)) throw new SafeError("Test endpoint service is invalid.");
    endpoints[key] = testEndpoint(value);
  }
  const clients = new Map();
  const controllers = new Set();
  const shutdown = new AbortController();
  let closed = false;

  function client(service) {
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) throw new SafeError("Approved CI AWS credentials are missing. No credential discovery was attempted.");
    if (!clients.has(service)) {
      const Constructor = { sts: STSClient, cloudformation: CloudFormationClient, lambda: LambdaClient }[service];
      clients.set(service, options.clients?.[service] || new Constructor({
        region: REGION, endpoint: endpoints[service], maxAttempts: 1, logger: NO_LOG,
        credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          ...(env.AWS_SESSION_TOKEN ? { sessionToken: env.AWS_SESSION_TOKEN } : {}) },
        requestHandler: new BoundedHttpHandler()
      }));
    }
    return clients.get(service);
  }

  async function send(service, command, { allowMissing = false, allowNoUpdates = false, stackName, deadline } = {}) {
    if (closed) throw new SafeError("AWS runner is closed. No request was sent.");
    const controller = new AbortController();
    controllers.add(controller);
    const timeout = Math.min(requestTimeoutMs, deadline === undefined ? requestTimeoutMs : Math.max(1, deadline - performance.now()));
    const timer = setTimeout(() => controller.abort(transportError("PreviewDeadlineError")), timeout);
    try {
      return await client(service).send(command, { abortSignal: controller.signal });
    } catch (error) {
      if (error instanceof SafeError) throw error;
      if (allowMissing && service === "lambda" && error?.name === "ResourceNotFoundException") return null;
      if (allowMissing && service === "cloudformation" && error?.name === "ValidationError" &&
          error?.message === `Stack with id ${stackName} does not exist`) return null;
      if (allowNoUpdates && error?.name === "ValidationError" && error?.message === "No updates are to be performed.") return { noUpdates: true };
      throw new SafeError(`AWS ${service} operation failed (${classifyAwsFailure(error)}). Details were suppressed; do not retry before checking AWS state.`);
    } finally {
      clearTimeout(timer);
      controllers.delete(controller);
    }
  }

  async function pause(deadline) {
    try { await delay(Math.min(pollMs, Math.max(1, deadline - performance.now())), undefined, { signal: shutdown.signal }); }
    catch { throw new SafeError("AWS wait stopped. Check AWS state before any further deployment."); }
  }

  async function waitStack(name, creating) {
    const deadline = performance.now() + stackWaitMs;
    const complete = creating ? "CREATE_COMPLETE" : "UPDATE_COMPLETE";
    const pending = creating ? ["CREATE_IN_PROGRESS"] : ["UPDATE_IN_PROGRESS", "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS"];
    while (performance.now() < deadline) {
      const result = await send("cloudformation", new DescribeStacksCommand({ StackName: name }), { deadline });
      const stacks = result.Stacks;
      if (!Array.isArray(stacks) || stacks.length !== 1) throw new SafeError("Preview stack wait returned an unexpected response. Check AWS state before any further deployment.");
      if (stacks[0].StackStatus === complete) return null;
      if (!pending.includes(stacks[0].StackStatus)) throw new SafeError("Preview stack did not reach the expected completion state. No further deployment was attempted.");
      await pause(deadline);
    }
    throw new SafeError("Preview stack wait timed out. Check AWS state before any further deployment.");
  }

  async function waitFunction(name, expectedCodeHash, creating) {
    const deadline = performance.now() + stackWaitMs;
    while (performance.now() < deadline) {
      const value = configuration(await send("lambda", new GetFunctionCommand({ FunctionName: name }), { deadline }));
      if (value.State === "Active" && value.LastUpdateStatus === "Successful" && (!expectedCodeHash || value.CodeSha256 === expectedCodeHash)) return null;
      const knownUpdate = ["Successful", "InProgress"].includes(value.LastUpdateStatus) || (creating && value.LastUpdateStatus === undefined);
      if (!["Active", "Pending"].includes(value.State) || !knownUpdate) {
        throw new SafeError("Preview function did not reach the expected completion state. No further deployment was attempted.");
      }
      await pause(deadline);
    }
    throw new SafeError("Preview function wait timed out. Check AWS state before any further deployment.");
  }

  const runner = async (args, settings = {}) => {
    if (!Array.isArray(args)) throw new SafeError("AWS operation is invalid.");
    const [service, action] = args;
    if (service === "sts" && action === "get-caller-identity") return (await send(service, new GetCallerIdentityCommand({}))).Account;
    if (service === "cloudformation" && action === "describe-stacks") {
      const stackName = argument(args, "--stack-name");
      const value = await send(service, new DescribeStacksCommand({ StackName: stackName }), { allowMissing: settings.allowMissing, stackName });
      if (value === null) return null;
      if (!Array.isArray(value.Stacks) || value.Stacks.length !== 1) throw new SafeError("AWS returned an unexpected stack response. No response contents were logged.");
      const stack = value.Stacks[0];
      return { Outputs: stack.Outputs, Tags: stack.Tags, StackStatus: stack.StackStatus };
    }
    if (service === "cloudformation" && ["create-stack", "update-stack"].includes(action)) {
      const input = { ...requestInput(settings.input), ClientRequestToken: randomUUID() };
      const Command = action === "create-stack" ? CreateStackCommand : UpdateStackCommand;
      const value = await send(service, new Command(input), { allowNoUpdates: settings.allowNoUpdates });
      return value.noUpdates ? value : value.StackId;
    }
    if (service === "cloudformation" && action === "wait" && ["stack-create-complete", "stack-update-complete"].includes(args[2])) {
      return waitStack(argument(args, "--stack-name"), args[2] === "stack-create-complete");
    }
    if (service === "lambda" && action === "get-function") {
      const value = await send(service, new GetFunctionCommand({ FunctionName: argument(args, "--function-name") }), { allowMissing: settings.allowMissing });
      return value === null ? null : configuration(value);
    }
    if (service === "lambda" && action === "create-function") {
      const input = requestInput(settings.input);
      const value = await send(service, new CreateFunctionCommand({ ...input, Code: { ZipFile: await zipBytes(settings.zipPath) } }));
      return updateResult(value);
    }
    if (service === "lambda" && action === "update-function-code") {
      const input = settings.input === undefined ? {} : requestInput(settings.input);
      const value = await send(service, new UpdateFunctionCodeCommand({ ...input, FunctionName: argument(args, "--function-name"), ZipFile: await zipBytes(settings.zipPath) }));
      return updateResult(value);
    }
    if (service === "lambda" && action === "update-function-configuration") {
      const input = requestInput(settings.input);
      const value = await send(service, new UpdateFunctionConfigurationCommand({ ...input, FunctionName: argument(args, "--function-name") }));
      return updateResult(value);
    }
    if (service === "lambda" && action === "wait" && args[2] === "function-updated-v2") return waitFunction(argument(args, "--function-name"), settings.expectedCodeHash, settings.creating === true);
    if (service === "lambda" && action === "invoke") {
      const input = requestInput(settings.input);
      const value = await send(service, new InvokeCommand({ FunctionName: argument(args, "--function-name"), InvocationType: "RequestResponse", LogType: "None", Payload: Buffer.from(JSON.stringify(input)) }));
      if (!value.Payload || value.Payload.byteLength > INVOKE_LIMIT) throw new SafeError("AWS returned an invalid preview invocation payload. No payload contents were logged.");
      let payload;
      try {
        payload = JSON.parse(Buffer.from(value.Payload).toString("utf8"));
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error();
      } catch { throw new SafeError("AWS returned an invalid preview invocation payload. No payload contents were logged."); }
      return { payload, metadata: { StatusCode: value.StatusCode, FunctionError: value.FunctionError } };
    }
    throw new SafeError("Unsupported AWS preview operation. No request was sent.");
  };
  runner.destroy = () => {
    closed = true;
    shutdown.abort();
    for (const controller of controllers) controller.abort(transportError("PreviewStoppedError"));
    for (const value of clients.values()) value.destroy();
  };
  return runner;
}
