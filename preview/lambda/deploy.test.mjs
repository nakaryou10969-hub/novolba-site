import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";
import { awsRunner, deployPreview } from "./deploy.mjs";
import { SITE } from "../site-config.mjs";

const TEMPLATE = JSON.parse(await readFile(new URL("./template.json", import.meta.url), "utf8"));
const FUNCTION_NAME = { KSC: "ksc-microcms-preview", NovolBa: "novolba-microcms-preview" }[SITE.name];
const FUNCTION_URL = "https://abcdefgh12345678.lambda-url.us-east-1.on.aws/";
const ENV = {
  AWS_REGION: "us-east-1", PREVIEW_STACK_NAME: `${FUNCTION_NAME}-stack`, PREVIEW_FUNCTION_NAME: FUNCTION_NAME,
  EXPECTED_AWS_ACCOUNT_ID: "111122223333", MICROCMS_SERVICE_DOMAIN: "public-test-fixture",
  MICROCMS_API_KEY: "public-test-only-api-key", PREVIEW_BASIC_USERNAME: "public-test-preview-user", PREVIEW_BASIC_PASSWORD: "public-test-only-password"
};
async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "preview-deploy-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, ".preview-lambda-build"), { recursive: true });
  await mkdir(path.join(root, "preview/lambda"), { recursive: true });
  const bytes = Buffer.from("public test package fixture");
  await writeFile(path.join(root, ".preview-lambda-build/preview.zip"), bytes);
  await writeFile(path.join(root, ".preview-lambda-build/preview.zip.manifest.json"), JSON.stringify({ format: 1, zipBytes: bytes.length, expandedBytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), files: [{ name: "out/preview/index.html" }] }));
  await writeFile(path.join(root, "preview/lambda/template.json"), JSON.stringify(TEMPLATE));
  return root;
}
function managedStack() {
  return { StackStatus: "CREATE_COMPLETE", Outputs: [{ OutputKey: "FunctionName", OutputValue: FUNCTION_NAME }, { OutputKey: "FunctionUrl", OutputValue: FUNCTION_URL }],
    Tags: [{ Key: "ManagedBy", Value: "microcms-preview-lambda" }, { Key: "PreviewSite", Value: SITE.name }] };
}
function fakeAws({ account = ENV.EXPECTED_AWS_ACCOUNT_ID, probeStatus = 200, initialStack = null } = {}) {
  const calls = []; let stack = initialStack;
  const run = async (args, options = {}) => {
    calls.push({ args, ...options });
    if (args[0] === "sts") return account;
    if (args[1] === "describe-stacks") return stack;
    if (["create-stack", "update-stack"].includes(args[1])) { stack = managedStack(); return "public-test-stack-id"; }
    if (args[1] === "invoke") {
      const event = JSON.parse(options.input); const api = event.rawPath === "/api/preview";
      return { metadata: { StatusCode: 200 }, payload: { statusCode: probeStatus === 200 && api ? 400 : probeStatus,
        headers: { "Content-Type": api ? "application/json" : "text/html; charset=utf-8", "Cache-Control": "private, no-store" },
        body: api ? JSON.stringify({ error: "Invalid preview request." }) : "<html>Preview shell</html>" } };
    }
    return null;
  };
  return { calls, run };
}
test("template defaults closed, grants both URL permissions only conditionally, and limits execution role", () => {
  assert.equal(TEMPLATE.Parameters.EnablePublicAccess.Default, "false");
  for (const key of ["MicrocmsApiKey"]) {
    assert.equal(TEMPLATE.Parameters[key].NoEcho, true); assert.equal(TEMPLATE.Parameters[key].Default, "");
  }
  assert.equal(TEMPLATE.Parameters.BasicUsername, undefined);
  assert.equal(TEMPLATE.Parameters.BasicPassword, undefined);
  assert.equal(TEMPLATE.Resources.PreviewFunction.Properties.Environment.Variables.PREVIEW_BASIC_PASSWORD, undefined);
  assert.equal(TEMPLATE.Resources.AllowFunctionUrl.Condition, "PublicAccessEnabled");
  assert.equal(TEMPLATE.Resources.AllowFunctionUrl.Properties.FunctionUrlAuthType, "NONE");
  assert.equal(TEMPLATE.Resources.AllowInvokeViaFunctionUrl.Properties.InvokedViaFunctionUrl, true);
  const roleStatement = TEMPLATE.Resources.PreviewRole.Properties.Policies[0].PolicyDocument.Statement;
  assert.equal(roleStatement.length, 1);
  assert.deepEqual(roleStatement[0].Action, ["logs:CreateLogStream", "logs:PutLogEvents"]);
  assert.match(roleStatement[0].Resource["Fn::Sub"], /\$\{FunctionName\}/);
  const fn = TEMPLATE.Resources.PreviewFunction.Properties;
  assert.equal(fn.Runtime, "nodejs22.x"); assert.equal(fn.MemorySize, 512); assert.equal(fn.Timeout, 30);
  assert.equal(fn.ReservedConcurrentExecutions, undefined);
  assert.equal(fn.VpcConfig, undefined); assert.equal(fn.ProvisionedConcurrencyConfig, undefined);
  assert.equal(fn.Environment.Variables.AWS_LWA_READINESS_CHECK_PROTOCOL, "tcp");
  assert.equal(fn.LoggingConfig.ApplicationLogLevel, "WARN"); assert.equal(TEMPLATE.Resources.PreviewLogGroup.Properties.RetentionInDays, 14);
});
test("new deployment configures origin and checks shell and keyless rejection before enabling public invocation", async (t) => {
  const root = await fixture(t); const aws = fakeAws(); const logs = [];
  const result = await deployPreview({ root, platform: "linux", env: ENV, runAws: aws.run, log: (line) => logs.push(line) });
  assert.equal(result.origin, FUNCTION_URL.slice(0, -1));
  const probes = aws.calls.filter((call) => call.args[1] === "invoke").map((call) => JSON.parse(call.input));
  assert.deepEqual(probes.map((event) => event.rawPath), ["/preview/", "/api/preview"]);
  assert.equal(probes[1].body, "{}");
  assert.equal(probes[1].headers.authorization, undefined);
  const changes = aws.calls.filter((call) => ["create-stack", "update-stack"].includes(call.args[1]));
  const parameter = (call, key) => JSON.parse(call.input).Parameters.find((item) => item.ParameterKey === key).ParameterValue;
  assert.deepEqual(changes.map((call) => parameter(call, "EnablePublicAccess")), ["false", "false", "true"]);
  assert.equal(parameter(changes[0], "PublicOrigin"), "https://unconfigured.invalid");
  assert.equal(parameter(changes[1], "PublicOrigin"), result.origin);
  assert.ok(aws.calls.indexOf(changes[2]) > aws.calls.findIndex((call) => call.args[1] === "invoke"));
  const published = JSON.stringify({ args: aws.calls.map((call) => call.args), logs });
  for (const secret of [ENV.MICROCMS_API_KEY, ENV.PREVIEW_BASIC_USERNAME, ENV.PREVIEW_BASIC_PASSWORD]) assert.equal(published.includes(secret), false);
  assert.ok(changes.every((call) => call.args.includes("file:///dev/stdin")));
});
test("preview check failure leaves public invocation disabled", async (t) => {
  const root = await fixture(t); const aws = fakeAws({ probeStatus: 500 });
  await assert.rejects(deployPreview({ root, platform: "linux", env: ENV, runAws: aws.run, log: () => {} }), /remains disabled/);
  assert.equal(aws.calls.filter((call) => ["create-stack", "update-stack"].includes(call.args[1])).some((call) => JSON.parse(call.input).Parameters.find((item) => item.ParameterKey === "EnablePublicAccess").ParameterValue === "true"), false);
});
test("wrong account, unmanaged stack, invalid credentials, or non-Linux deployment refuses mutations", async (t) => {
  const root = await fixture(t);
  for (const options of [{ account: "999900001111" }, { initialStack: { ...managedStack(), Tags: [] } }]) {
    const aws = fakeAws(options);
    await assert.rejects(deployPreview({ root, platform: "linux", env: ENV, runAws: aws.run, log: () => {} }));
    assert.equal(aws.calls.some((call) => ["create-stack", "update-stack", "update-function-code"].includes(call.args[1])), false);
  }
  const aws = fakeAws();
  await assert.rejects(deployPreview({ root, platform: "linux", env: { ...ENV, MICROCMS_API_KEY: "" }, runAws: aws.run }));
  await assert.rejects(deployPreview({ root, platform: "win32", env: ENV, runAws: aws.run }));
  assert.equal(aws.calls.length, 0);
});
test("AWS runner isolates application secrets from child environment and suppresses secret-bearing CLI errors", async () => {
  let childOptions; let childArgs;
  const runner = awsRunner(ENV, (_command, args, options) => {
    childOptions = options; childArgs = args;
    const child = new EventEmitter(); child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.kill = () => {};
    child.stdin.on("finish", () => { child.stderr.write(`Input parsing error: ${ENV.PREVIEW_BASIC_PASSWORD}`); child.emit("close", 1); });
    return child;
  });
  await assert.rejects(runner(["cloudformation", "create-stack", "--cli-input-json", "file:///dev/stdin"], { input: JSON.stringify({ secret: ENV.PREVIEW_BASIC_PASSWORD }) }), (error) => !error.message.includes(ENV.PREVIEW_BASIC_PASSWORD) && /details were suppressed/.test(error.message));
  for (const key of ["MICROCMS_API_KEY", "PREVIEW_BASIC_USERNAME", "PREVIEW_BASIC_PASSWORD"]) assert.equal(childOptions.env[key], undefined);
  assert.equal(childArgs.includes("--debug"), false); assert.equal(childArgs.includes(ENV.PREVIEW_BASIC_PASSWORD), false);
  assert.equal(childArgs.includes('cat | aws "$@" | cat'), true);
});
test("AWS runner parses response payload and CLI metadata from the in-memory stdout pipe", async () => {
  const runner = awsRunner(ENV, () => {
    const child = new EventEmitter(); child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.kill = () => {};
    child.stdin.on("finish", () => {
      child.stdout.write(JSON.stringify({ statusCode: 401, body: JSON.stringify({ error: "public fixture with } braces and a quote \"" }) }));
      child.stdout.write(JSON.stringify({ StatusCode: 200, FunctionError: null }));
      child.emit("close", 0);
    });
    return child;
  });
  const result = await runner(["lambda", "invoke", "/dev/stdout"], { input: "public test fixture", payloadOutput: true });
  assert.equal(result.payload.statusCode, 401); assert.equal(result.metadata.StatusCode, 200);
});


test("no Basic secret is needed and a broken keyless rejection never publishes the URL", async (t) => {
  const root = await fixture(t); const env = { ...ENV };
  delete env.PREVIEW_BASIC_USERNAME; delete env.PREVIEW_BASIC_PASSWORD;
  const aws = fakeAws(); await deployPreview({ root, platform: "linux", env, runAws: aws.run, log: () => {} });
  const bad = fakeAws();
  const run = async (args, options) => {
    const result = await bad.run(args, options);
    if (args[1] === "invoke" && JSON.parse(options.input).rawPath === "/api/preview") result.payload.statusCode = 200;
    return result;
  };
  await assert.rejects(deployPreview({ root, platform: "linux", env, runAws: run, log: () => {} }), /remains disabled/);
  const changes = bad.calls.filter((call) => ["create-stack", "update-stack"].includes(call.args[1]));
  assert.equal(changes.some((call) => JSON.parse(call.input).Parameters.some((item) => item.ParameterKey === "EnablePublicAccess" && item.ParameterValue === "true")), false);
});
