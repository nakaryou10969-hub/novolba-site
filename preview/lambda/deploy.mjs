import { setTimeout as delay } from "node:timers/promises";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readConfig } from "../server.mjs";
import { SITE } from "../site-config.mjs";
import { LIMITS } from "../package-lambda.mjs";
import { awsRunner, SafeError } from "./aws-sdk.mjs";
export { awsRunner, classifyAwsFailure } from "./aws-sdk.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const MANAGED_BY = "microcms-preview-lambda";
const ADAPTER = "arn:aws:lambda:us-east-1:753240598075:layer:LambdaAdapterLayerX86:30";
function outputValue(stack, key) { return stack?.Outputs?.find((item) => item.OutputKey === key)?.OutputValue; }
function validateStack(stack, name, role) {
  if (!stack) return;
  const tags = Object.fromEntries((stack.Tags || []).map(({ Key, Value }) => [Key, Value]));
  if (tags.ManagedBy !== MANAGED_BY || tags.PreviewSite !== SITE.name ||
      outputValue(stack, "FunctionName") !== name || outputValue(stack, "RoleArn") !== role) {
    throw new SafeError("Existing stack ownership does not match this dedicated preview. No further changes were made.");
  }
  if (!["CREATE_COMPLETE", "UPDATE_COMPLETE", "UPDATE_ROLLBACK_COMPLETE"].includes(stack.StackStatus)) {
    throw new SafeError("Existing preview stack is not in a stable supported state. Inspect its actual state before any retry.");
  }
}
function validateFunction(fn, name, role, expectedHash, origin) {
  if (!fn) {
    if (expectedHash || origin) throw new SafeError("Expected preview Lambda is missing. Public access will not be enabled.");
    return;
  }
  if (fn.FunctionName !== name || fn.Role !== role || fn.Runtime !== "nodejs22.x" ||
      fn.Architectures?.length !== 1 || fn.Architectures[0] !== "x86_64" ||
      fn.Tags?.ManagedBy !== MANAGED_BY || fn.Tags?.PreviewSite !== SITE.name || !fn.RevisionId) {
    throw new SafeError("Existing Lambda ownership or runtime does not match this dedicated preview. No further changes were made.");
  }
  if (fn.State !== "Active" || fn.LastUpdateStatus !== "Successful") {
    throw new SafeError("Preview Lambda is not ready. Inspect its actual state before any retry.");
  }
  if (expectedHash && fn.CodeSha256 !== expectedHash) throw new SafeError("Preview Lambda code integrity check failed. Public access will not be enabled.");
  if (origin && (fn.PublicOrigin !== origin || fn.Handler !== "run.sh" || fn.ExecWrapper !== "/opt/bootstrap" || fn.MemorySize !== 512 || fn.Timeout !== 30 ||
      fn.LayerArns?.length !== 1 || fn.LayerArns[0] !== ADAPTER || fn.LoggingConfig?.LogFormat !== "JSON" ||
      fn.LoggingConfig.ApplicationLogLevel !== "WARN" || fn.LoggingConfig.SystemLogLevel !== "WARN")) {
    throw new SafeError("Preview Lambda runtime configuration check failed. Public access will not be enabled.");
  }
}
function functionOrigin(value) {
  if (!/^https:\/\/[a-z0-9]+\.lambda-url\.us-east-1\.on\.aws\/$/.test(value || "")) throw new SafeError("Preview Function URL is missing or outside the approved region.");
  return new URL(value).origin;
}
function environment(env, origin) {
  return {
    AWS_LAMBDA_EXEC_WRAPPER: "/opt/bootstrap", AWS_LWA_PORT: "3001",
    AWS_LWA_READINESS_CHECK_PROTOCOL: "tcp", AWS_LWA_READINESS_CHECK_TIMEOUT_SECONDS: "5",
    AWS_LWA_INVOKE_MODE: "buffered", RUST_LOG: "warn", PREVIEW_HOST: "127.0.0.1", PREVIEW_PORT: "3001",
    MICROCMS_SERVICE_DOMAIN: env.MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY: env.MICROCMS_API_KEY,
    PREVIEW_PUBLIC_ORIGIN: origin
  };
}
const LOGGING = { LogFormat: "JSON", ApplicationLogLevel: "WARN", SystemLogLevel: "WARN" };
export async function deployPreview({ env = process.env, platform = process.platform, runAws, root = ROOT, log = console.info, waitForRole = () => delay(15000) } = {}) {
  if (platform !== "linux") throw new SafeError("Deployment is supported only in the approved Linux CI job; local validation does not deploy AWS resources.");
  const name = env.PREVIEW_FUNCTION_NAME; const stackName = env.PREVIEW_STACK_NAME;
  const expectedName = { KSC: "ksc-microcms-preview", NovolBa: "novolba-microcms-preview" }[SITE.name];
  if (!expectedName || name !== expectedName || stackName !== expectedName) throw new SafeError("Function and stack names must match this site's dedicated preview.");
  if (!/^\d{12}$/.test(env.EXPECTED_AWS_ACCOUNT_ID || "")) throw new SafeError("EXPECTED_AWS_ACCOUNT_ID is required.");
  if (env.AWS_REGION !== "us-east-1" || (env.AWS_DEFAULT_REGION && env.AWS_DEFAULT_REGION !== "us-east-1")) throw new SafeError("Deployment region must be us-east-1.");
  try { readConfig({ ...env, PREVIEW_PUBLIC_ORIGIN: "https://unconfigured.invalid", PREVIEW_HOST: "127.0.0.1", PREVIEW_PORT: "3001" }); }
  catch { throw new SafeError("Runtime configuration is missing or invalid. Enter the approved microCMS values in CI secrets."); }
  const packagePath = path.resolve(root, env.PREVIEW_PACKAGE_PATH || ".preview-lambda-build/preview.zip");
  const manifest = JSON.parse(await readFile(`${packagePath}.manifest.json`, "utf8"));
  const info = await stat(packagePath);
  if (info.size > LIMITS.zip || manifest.zipBytes !== info.size || !Number.isSafeInteger(manifest.expandedBytes) ||
      manifest.expandedBytes > LIMITS.expanded || manifest.format !== 1) throw new SafeError("Preview package manifest or size is invalid.");
  const bytes = await readFile(packagePath);
  if (createHash("sha256").update(bytes).digest("hex") !== manifest.sha256 || !manifest.files?.some((file) => file.name === "out/preview/index.html")) throw new SafeError("Preview package integrity check failed.");
  const expectedCodeHash = createHash("sha256").update(bytes).digest("base64");
  const template = await readFile(path.join(root, "preview/lambda/template.json"), "utf8");
  const schema = JSON.parse(template);
  if (schema.Resources?.PreviewFunction || schema.Parameters?.MicrocmsApiKey || !schema.Parameters?.FunctionPrepared) throw new SafeError("Preview infrastructure template is incompatible with real ZIP deployment.");
  const ownRunner = !runAws;
  runAws ??= awsRunner(env);
  try {
    const account = await runAws(["sts", "get-caller-identity"]);
    if (account !== env.EXPECTED_AWS_ACCOUNT_ID) throw new SafeError("AWS account does not match EXPECTED_AWS_ACCOUNT_ID. No changes were made.");
    const role = `arn:aws:iam::${account}:role/${name}-execution`;
    const describe = () => runAws(["cloudformation", "describe-stacks", "--stack-name", stackName], { allowMissing: true });
    const getFunction = () => runAws(["lambda", "get-function", "--function-name", name], { allowMissing: true });
    const existing = await describe(); validateStack(existing, name, role);
    let fn = await getFunction(); validateFunction(fn, name, role);
    if (fn && !existing) throw new SafeError("Preview Lambda exists without its managed stack. Inspect actual state before changing anything.");
    const previousUrl = outputValue(existing, "FunctionUrl");
    if (previousUrl && !fn) throw new SafeError("Preview stack URL exists but its Lambda is missing. Inspect actual state before changing anything.");
    const previousOrigin = previousUrl ? functionOrigin(previousUrl) : "https://unconfigured.invalid";
    const tags = [{ Key: "ManagedBy", Value: MANAGED_BY }, { Key: "PreviewSite", Value: SITE.name }];
    const apply = async (prepared, enabled, create = false) => {
      const action = create ? "create-stack" : "update-stack";
      const result = await runAws(["cloudformation", action], {
        input: JSON.stringify({ StackName: stackName, TemplateBody: template,
          Parameters: [["FunctionName", name], ["FunctionPrepared", String(prepared)], ["EnablePublicAccess", String(enabled)]]
            .map(([ParameterKey, ParameterValue]) => ({ ParameterKey, ParameterValue })),
          Capabilities: ["CAPABILITY_NAMED_IAM"], Tags: tags }),
        allowNoUpdates: !create
      });
      if (!result?.noUpdates) await runAws(["cloudformation", "wait", create ? "stack-create-complete" : "stack-update-complete", "--stack-name", stackName]);
    };
    log("Preparing dedicated preview infrastructure with public invocation disabled.");
    await apply(Boolean(previousUrl), false, !existing);
    let prepared = await describe(); validateStack(prepared, name, role);
    if (!prepared) throw new SafeError("Expected preview stack is missing. Inspect its actual state before any retry.");
    const creating = !fn;
    if (!existing && creating) await waitForRole();
    if (fn) {
      await runAws(["lambda", "update-function-code", "--function-name", name], { zipPath: packagePath, input: JSON.stringify({ RevisionId: fn.RevisionId }) });
    } else {
      await runAws(["lambda", "create-function"], { zipPath: packagePath, input: JSON.stringify({
        FunctionName: name, Role: role, Description: "Article preview requiring a matching microCMS draftKey",
        Runtime: "nodejs22.x", Architectures: ["x86_64"], Handler: "run.sh", MemorySize: 512, Timeout: 30,
        Layers: [ADAPTER], Environment: { Variables: environment(env, previousOrigin) }, LoggingConfig: LOGGING,
        Tags: Object.fromEntries(tags.map(({ Key, Value }) => [Key, Value]))
      }) });
    }
    await runAws(["lambda", "wait", "function-updated-v2", "--function-name", name], { expectedCodeHash, creating });
    fn = await getFunction(); validateFunction(fn, name, role, expectedCodeHash);
    if (!previousUrl) {
      await apply(true, false); prepared = await describe(); validateStack(prepared, name, role);
    }
    const origin = functionOrigin(outputValue(prepared, "FunctionUrl"));
    await runAws(["lambda", "update-function-configuration", "--function-name", name], { input: JSON.stringify({
      RevisionId: fn.RevisionId, Handler: "run.sh", Environment: { Variables: environment(env, origin) },
      MemorySize: 512, Timeout: 30, Layers: [ADAPTER], LoggingConfig: LOGGING
    }) });
    await runAws(["lambda", "wait", "function-updated-v2", "--function-name", name], { expectedCodeHash });
    fn = await getFunction(); validateFunction(fn, name, role, expectedCodeHash, origin);
    const host = new URL(origin).host;
    const probe = {
      version: "2.0", routeKey: "$default", rawPath: "/preview/", rawQueryString: "",
      headers: { host }, requestContext: { accountId: account, apiId: "preview-check", domainName: host, domainPrefix: host.split(".")[0],
        http: { method: "GET", path: "/preview/", protocol: "HTTP/1.1", sourceIp: "127.0.0.1", userAgent: "preview-deploy-check" },
        requestId: "preview-deploy-check", routeKey: "$default", stage: "$default", time: "01/Jan/2000:00:00:00 +0000", timeEpoch: 946684800000 },
      isBase64Encoded: false
    };
    const check = async (event, status) => {
      const result = await runAws(["lambda", "invoke", "--function-name", name], { input: JSON.stringify(event) });
      const headers = Object.fromEntries(Object.entries(result.payload?.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
      if (result.metadata?.StatusCode !== 200 || result.metadata.FunctionError || result.payload?.statusCode !== status ||
          headers["www-authenticate"] || !/\bno-store\b/i.test(headers["cache-control"] || "")) throw new SafeError("Private preview check failed. Public invocation remains disabled.");
      return { ...result.payload, headers };
    };
    const shell = await check(probe, 200);
    if (!/^text\/html(?:\s*;|$)/i.test(shell.headers["content-type"] || "")) throw new SafeError("Preview shell check failed. Public invocation remains disabled.");
    const keyless = await check({ ...probe, rawPath: "/api/preview",
      headers: { host, origin, "content-type": "application/json", "x-preview-request": "1" }, body: "{}",
      requestContext: { ...probe.requestContext, http: { ...probe.requestContext.http, method: "POST", path: "/api/preview" } }
    }, 400);
    let errorBody;
    try { errorBody = JSON.parse(keyless.isBase64Encoded ? Buffer.from(keyless.body, "base64").toString("utf8") : keyless.body); } catch {}
    if (errorBody?.error !== "Invalid preview request.") throw new SafeError("Keyless article check failed. Public invocation remains disabled.");
    log("Code integrity, preview shell and keyless rejection checks passed. Enabling the approved Function URL permissions.");
    await apply(true, true);
    fn = await getFunction(); validateFunction(fn, name, role, expectedCodeHash, origin);
    log(`Preview deployed at ${origin}/preview/. Real microCMS draft checks remain separate steps.`);
    return { origin, functionName: name, stackName };
  } finally { if (ownRunner) runAws.destroy(); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  deployPreview().catch((error) => {
    console.error(error instanceof SafeError ? error.message : "Preview deployment failed. No credentials or AWS response details were logged.");
    process.exitCode = 1;
  });
}
