import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readConfig } from "../server.mjs";
import { SITE } from "../site-config.mjs";
import { LIMITS } from "../package-lambda.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const APPLICATION_SECRETS = ["MICROCMS_API_KEY", "PREVIEW_BASIC_USERNAME", "PREVIEW_BASIC_PASSWORD"];
const MANAGED_BY = "microcms-preview-lambda";
class SafeError extends Error {}

// This entrypoint is intended for a manually approved Linux CI job. Secrets enter
// CloudFormation via stdin only; no temporary parameter file or secret argv exists.
function parseProbeOutput(text) {
  const objects = []; let start = 0; let depth = 0; let quoted = false; let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (depth === 0) { if (/\s/.test(character)) continue; if (character !== "{") throw new Error("Invalid CLI output"); start = i; }
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') quoted = true;
    else if (character === "{" || character === "[") depth++;
    else if (character === "}" || character === "]") {
      depth--;
      if (depth === 0) objects.push(JSON.parse(text.slice(start, i + 1)));
    }
  }
  if (depth !== 0 || quoted || objects.length !== 2) throw new Error("Invalid CLI output");
  return { payload: objects[0], metadata: objects[1] };
}
export function awsRunner(env, spawnChild = spawn) {
  return (args, { input, payloadOutput = false, allowMissing = false, allowNoUpdates = false } = {}) => new Promise((resolve, reject) => {
    const childEnv = { ...env, AWS_PAGER: "", AWS_CLI_AUTO_PROMPT: "off" };
    for (const key of APPLICATION_SECRETS) delete childEnv[key];
    // Node's IPC descriptors can be sockets, which Python cannot open using
    // /dev/stdin or /dev/stdout. Bash creates ordinary OS pipes for the AWS CLI.
    // The shell script is fixed; every dynamic argument is a positional argument.
    const child = spawnChild("bash", ["-o", "pipefail", "-c", 'cat | aws "$@" | cat', "preview-aws", ...args, "--region", "us-east-1", "--no-cli-pager", "--output", "json"], {
      env: childEnv, stdio: ["pipe", "pipe", "pipe"]
    });
    const stdout = []; const stderr = []; let size = 0;
    const capture = (chunks) => (bytes) => {
      size += bytes.length;
      if (size > 256 * 1024) { child.kill(); return; }
      chunks.push(bytes);
    };
    child.stdout.on("data", capture(stdout)); child.stderr.on("data", capture(stderr));
    child.on("error", () => reject(new SafeError("AWS CLI could not start. Bash and AWS CLI v2 are required in the approved Linux CI environment.")));
    child.stdin.on("error", () => {});
    child.on("close", (code) => {
      const errorText = Buffer.concat(stderr).toString("utf8");
      if (code !== 0) {
        if (allowMissing && /ValidationError/.test(errorText) && /does not exist/.test(errorText)) return resolve(null);
        if (allowNoUpdates && /No updates are to be performed/.test(errorText)) return resolve({ noUpdates: true });
        return reject(new SafeError(`AWS ${args[0]} ${args[1]} failed. Inspect the approved AWS console; CLI details were suppressed.`));
      }
      try {
        const text = Buffer.concat(stdout).toString("utf8").trim();
        resolve(payloadOutput ? parseProbeOutput(text) : text ? JSON.parse(text) : null);
      } catch { reject(new SafeError("AWS CLI returned an unexpected response. No response contents were logged.")); }
    });
    child.stdin.end(input ?? "");
  });
}
function outputValue(stack, key) { return stack?.Outputs?.find((item) => item.OutputKey === key)?.OutputValue; }
function validateStack(stack, name) {
  if (!stack) return;
  if (stack.Tags?.find((tag) => tag.Key === "ManagedBy")?.Value !== MANAGED_BY ||
      stack.Tags?.find((tag) => tag.Key === "PreviewSite")?.Value !== SITE.name || outputValue(stack, "FunctionName") !== name) {
    throw new SafeError("Existing stack is not this site's managed preview stack. No changes were made.");
  }
  if (!/^(CREATE_COMPLETE|UPDATE_COMPLETE|UPDATE_ROLLBACK_COMPLETE)$/.test(stack.StackStatus)) {
    throw new SafeError("Preview stack is not ready for an update. Review its status in AWS first.");
  }
}
function functionOrigin(value) {
  let url;
  try { url = new URL(value); } catch { throw new SafeError("Preview stack has no valid Function URL."); }
  if (!/^https:\/\/[a-z0-9]+\.lambda-url\.us-east-1\.on\.aws\/$/.test(url.href)) throw new SafeError("Function URL must belong to us-east-1.");
  return url.origin;
}
export async function deployPreview({ env = process.env, platform = process.platform, runAws = awsRunner(env), root = ROOT, log = console.info } = {}) {
  if (platform !== "linux") throw new SafeError("Deployment is supported only in the approved Linux CI job; local validation does not deploy AWS resources.");
  const name = env.PREVIEW_FUNCTION_NAME; const stackName = env.PREVIEW_STACK_NAME;
  const expectedName = { KSC: "ksc-microcms-preview", NovolBa: "novolba-microcms-preview" }[SITE.name];
  if (!expectedName || name !== expectedName) throw new SafeError("PREVIEW_FUNCTION_NAME does not match this site's dedicated preview function.");
  if (!/^[a-zA-Z][a-zA-Z0-9-]{0,127}$/.test(stackName || "")) throw new SafeError("PREVIEW_STACK_NAME is missing or invalid.");
  if (!/^\d{12}$/.test(env.EXPECTED_AWS_ACCOUNT_ID || "")) throw new SafeError("EXPECTED_AWS_ACCOUNT_ID is required.");
  if (env.AWS_REGION !== "us-east-1" || (env.AWS_DEFAULT_REGION && env.AWS_DEFAULT_REGION !== "us-east-1")) throw new SafeError("Deployment region must be us-east-1.");
  try { readConfig({ ...env, PREVIEW_PUBLIC_ORIGIN: "https://unconfigured.invalid", PREVIEW_HOST: "127.0.0.1", PREVIEW_PORT: "3001" }); }
  catch { throw new SafeError("Runtime configuration is missing or invalid. Enter the approved microCMS values in CI secrets."); }
  const packagePath = path.resolve(root, env.PREVIEW_PACKAGE_PATH || ".preview-lambda-build/preview.zip");
  const manifest = JSON.parse(await readFile(`${packagePath}.manifest.json`, "utf8"));
  const info = await stat(packagePath);
  if (info.size > LIMITS.zip || manifest.zipBytes !== info.size || manifest.expandedBytes > LIMITS.expanded || manifest.format !== 1) throw new SafeError("Preview package manifest or size is invalid.");
  const hash = createHash("sha256").update(await readFile(packagePath)).digest("hex");
  if (hash !== manifest.sha256 || !manifest.files?.some((file) => file.name === "out/preview/index.html")) throw new SafeError("Preview package integrity check failed.");
  const template = await readFile(path.join(root, "preview/lambda/template.json"), "utf8");
  JSON.parse(template);
  const account = await runAws(["sts", "get-caller-identity", "--query", "Account"]);
  if (account !== env.EXPECTED_AWS_ACCOUNT_ID) throw new SafeError("AWS account does not match EXPECTED_AWS_ACCOUNT_ID. No changes were made.");
  const describe = () => runAws(["cloudformation", "describe-stacks", "--stack-name", stackName, "--query", "Stacks[0].{Outputs:Outputs,Tags:Tags,StackStatus:StackStatus}"], { allowMissing: true });
  const existing = await describe(); validateStack(existing, name);
  const previousOrigin = existing ? functionOrigin(outputValue(existing, "FunctionUrl")) : "https://unconfigured.invalid";
  const tags = [{ Key: "ManagedBy", Value: MANAGED_BY }, { Key: "PreviewSite", Value: SITE.name }];
  const parameters = (origin, enabled) => [
    ["FunctionName", name], ["ServiceDomain", env.MICROCMS_SERVICE_DOMAIN], ["MicrocmsApiKey", env.MICROCMS_API_KEY],
    ["PublicOrigin", origin], ["EnablePublicAccess", String(enabled)]
  ].map(([ParameterKey, ParameterValue]) => ({ ParameterKey, ParameterValue }));
  const apply = async (origin, enabled, create = false) => {
    const action = create ? "create-stack" : "update-stack";
    const result = await runAws(["cloudformation", action, "--cli-input-json", "file:///dev/stdin", "--query", "StackId"], {
      input: JSON.stringify({ StackName: stackName, TemplateBody: template, Parameters: parameters(origin, enabled), Capabilities: ["CAPABILITY_IAM"], Tags: tags }),
      allowNoUpdates: !create
    });
    if (!result?.noUpdates) await runAws(["cloudformation", "wait", create ? "stack-create-complete" : "stack-update-complete", "--stack-name", stackName]);
  };
  log("Preparing the dedicated preview stack with public invocation disabled.");
  await apply(previousOrigin, false, !existing);
  const prepared = await describe(); validateStack(prepared, name);
  const origin = functionOrigin(outputValue(prepared, "FunctionUrl"));
  // For new stacks the URL was unknown during creation. Keep public invocation
  // disabled while configuring the exact Host/Origin expected by the application.
  if (previousOrigin !== origin) await apply(origin, false);
  await runAws(["lambda", "update-function-code", "--function-name", name, "--zip-file", `fileb://${packagePath}`, "--query", "LastUpdateStatus"]);
  await runAws(["lambda", "wait", "function-updated-v2", "--function-name", name]);
  const host = new URL(origin).host;
  const probe = {
    version: "2.0", routeKey: "$default", rawPath: "/preview/", rawQueryString: "",
    headers: { host }, requestContext: { accountId: account, apiId: "preview-check", domainName: host, domainPrefix: host.split(".")[0],
      http: { method: "GET", path: "/preview/", protocol: "HTTP/1.1", sourceIp: "127.0.0.1", userAgent: "preview-deploy-check" },
      requestId: "preview-deploy-check", routeKey: "$default", stage: "$default", time: "01/Jan/2000:00:00:00 +0000", timeEpoch: 946684800000 },
    isBase64Encoded: false
  };
  const invoke = (event) => runAws(["lambda", "invoke", "--function-name", name, "--cli-binary-format", "raw-in-base64-out", "--payload", "fileb:///dev/stdin", "/dev/stdout", "--query", "{StatusCode:StatusCode,FunctionError:FunctionError}"], {
    input: JSON.stringify(event), payloadOutput: true
  });
  const check = async (event, status) => {
    const result = await invoke(event);
    const headers = Object.fromEntries(Object.entries(result.payload?.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
    if (result.metadata?.StatusCode !== 200 || result.metadata.FunctionError || result.payload?.statusCode !== status ||
        headers["www-authenticate"] || !/\bno-store\b/i.test(headers["cache-control"] || "")) {
      throw new SafeError("Private pre-publication preview check failed. Public invocation remains disabled.");
    }
    return result.payload;
  };
  const shell = await check(probe, 200);
  if (!/^text\/html(?:\s*;|$)/i.test(shell.headers?.["content-type"] || shell.headers?.["Content-Type"] || "")) {
    throw new SafeError("Preview shell check failed. Public invocation remains disabled.");
  }
  const keyless = await check({ ...probe, rawPath: "/api/preview",
    headers: { host, origin, "content-type": "application/json", "x-preview-request": "1" }, body: "{}",
    requestContext: { ...probe.requestContext, http: { ...probe.requestContext.http, method: "POST", path: "/api/preview" } }
  }, 400);
  let errorBody;
  try { errorBody = JSON.parse(keyless.isBase64Encoded ? Buffer.from(keyless.body, "base64").toString("utf8") : keyless.body); } catch {}
  if (errorBody?.error !== "Invalid preview request.") throw new SafeError("Keyless article check failed. Public invocation remains disabled.");
  log("Preview shell and keyless rejection checks passed. Enabling the approved Function URL permissions.");
  await apply(origin, true);
  log(`Preview deployed at ${origin}/preview/. microCMS draft substitution and real article checks remain separate steps.`);
  return { origin, functionName: name, stackName };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  deployPreview().catch((error) => {
    console.error(error instanceof SafeError ? error.message : "Preview deployment failed. No credentials or AWS response details were logged.");
    process.exitCode = 1;
  });
}
