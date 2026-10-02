import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { deployPreview } from "./deploy.mjs";
import { SITE } from "../site-config.mjs";

const TEMPLATE = JSON.parse(await readFile(new globalThis.URL("./template.json", import.meta.url), "utf8"));
const NAME = { KSC: "ksc-microcms-preview", NovolBa: "novolba-microcms-preview" }[SITE.name];
const URL = "https://abcdefgh12345678.lambda-url.us-east-1.on.aws/";
const ROLE = `arn:aws:iam::111122223333:role/${NAME}-execution`;
const TAGS = { ManagedBy: "microcms-preview-lambda", PreviewSite: SITE.name };
const BYTES = Buffer.from("public test package fixture");
const HASH = createHash("sha256").update(BYTES).digest("base64");
const ENV = {
  AWS_REGION: "us-east-1", PREVIEW_STACK_NAME: NAME, PREVIEW_FUNCTION_NAME: NAME,
  EXPECTED_AWS_ACCOUNT_ID: "111122223333", MICROCMS_SERVICE_DOMAIN: "public-test-fixture",
  MICROCMS_API_KEY: "public-test-only-api-key"
};
async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "preview-deploy-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, ".preview-lambda-build"), { recursive: true });
  await mkdir(path.join(root, "preview/lambda"), { recursive: true });
  await writeFile(path.join(root, ".preview-lambda-build/preview.zip"), BYTES);
  await writeFile(path.join(root, ".preview-lambda-build/preview.zip.manifest.json"), JSON.stringify({
    format: 1, zipBytes: BYTES.length, expandedBytes: BYTES.length,
    sha256: createHash("sha256").update(BYTES).digest("hex"), files: [{ name: "out/preview/index.html" }]
  }));
  await writeFile(path.join(root, "preview/lambda/template.json"), JSON.stringify(TEMPLATE));
  return root;
}
function stack(prepared = true) {
  return { StackStatus: "CREATE_COMPLETE", Outputs: [
    { OutputKey: "FunctionName", OutputValue: NAME }, { OutputKey: "RoleArn", OutputValue: ROLE },
    ...(prepared ? [{ OutputKey: "FunctionUrl", OutputValue: URL }] : [])
  ], Tags: Object.entries(TAGS).map(([Key, Value]) => ({ Key, Value })) };
}
function fn() {
  return { FunctionName: NAME, Role: ROLE, Runtime: "nodejs22.x", Architectures: ["x86_64"],
    Tags: { ...TAGS }, State: "Active", LastUpdateStatus: "Successful", RevisionId: "revision-1",
    MemorySize: 512, Timeout: 30, LayerArns: ["arn:aws:lambda:us-east-1:753240598075:layer:LambdaAdapterLayerX86:30"], LoggingConfig: { LogFormat: "JSON", ApplicationLogLevel: "WARN", SystemLogLevel: "WARN" }, CodeSha256: HASH, Handler: "run.sh", PublicOrigin: new globalThis.URL(URL).origin, ExecWrapper: "/opt/bootstrap" };
}
function fakeAws({ account = ENV.EXPECTED_AWS_ACCOUNT_ID, initialStack = null, initialFunction = null, mutate } = {}) {
  const calls = []; let actualStack = initialStack; let actualFunction = initialFunction;
  const run = async (args, options = {}) => {
    const call = { args, ...options }; calls.push(call);
    if (mutate) {
      const response = await mutate(call, { stack: actualStack, function: actualFunction });
      if (response?.stop) throw new Error("public fixture operation stopped");
      if (response?.override) return response.value;
    }
    if (args[0] === "sts") return account;
    if (args[1] === "describe-stacks") return actualStack;
    if (args[1] === "get-function") return actualFunction && structuredClone(actualFunction);
    if (["create-stack", "update-stack"].includes(args[1])) {
      const input = JSON.parse(options.input);
      actualStack = stack(input.Parameters.find((p) => p.ParameterKey === "FunctionPrepared").ParameterValue === "true");
      return "public-test-stack-id";
    }
    if (args[1] === "create-function") {
      const input = JSON.parse(options.input);
      assert.equal(Buffer.compare(await readFile(options.zipPath), BYTES), 0);
      actualFunction = { ...fn(), PublicOrigin: input.Environment.Variables.PREVIEW_PUBLIC_ORIGIN };
      return {};
    }
    if (args[1] === "update-function-code") {
      assert.equal(JSON.parse(options.input).RevisionId, actualFunction.RevisionId);
      actualFunction.CodeSha256 = HASH; actualFunction.RevisionId += "-code"; return {};
    }
    if (args[1] === "update-function-configuration") {
      const input = JSON.parse(options.input);
      assert.equal(input.RevisionId, actualFunction.RevisionId);
      actualFunction.PublicOrigin = input.Environment.Variables.PREVIEW_PUBLIC_ORIGIN;
      actualFunction.RevisionId += "-config"; return {};
    }
    if (args[1] === "invoke") {
      const api = JSON.parse(options.input).rawPath === "/api/preview";
      return { metadata: { StatusCode: 200 }, payload: { statusCode: api ? 400 : 200,
        headers: { "Content-Type": api ? "application/json" : "text/html; charset=utf-8", "Cache-Control": "private, no-store" },
        body: api ? JSON.stringify({ error: "Invalid preview request." }) : "<html>Preview shell</html>" } };
    }
    return null;
  };
  return { calls, run };
}
function writes(calls) { return calls.filter(({ args }) => /^(create|update)-/.test(args[1])); }
function isPublic(call) { return ["create-stack", "update-stack"].includes(call.args[1]) && JSON.parse(call.input).Parameters.some((p) => p.ParameterKey === "EnablePublicAccess" && p.ParameterValue === "true"); }

test("infrastructure excludes placeholder Lambda and secrets, defaults closed, bounds log role", () => {
  assert.equal(TEMPLATE.Resources.PreviewFunction, undefined);
  assert.equal(TEMPLATE.Parameters.MicrocmsApiKey, undefined);
  assert.equal(TEMPLATE.Parameters.ServiceDomain, undefined);
  assert.equal(TEMPLATE.Parameters.PublicOrigin, undefined);
  assert.equal(TEMPLATE.Parameters.FunctionPrepared.Default, "false");
  assert.equal(TEMPLATE.Parameters.EnablePublicAccess.Default, "false");
  assert.equal(TEMPLATE.Resources.PreviewUrl.Condition, "FunctionExists");
  for (const name of ["AllowFunctionUrl", "AllowInvokeViaFunctionUrl"]) assert.equal(TEMPLATE.Resources[name].Condition, "PublicAccessEnabled");
  assert.equal(TEMPLATE.Resources.AllowFunctionUrl.Properties.FunctionUrlAuthType, "NONE");
  assert.equal(TEMPLATE.Resources.AllowInvokeViaFunctionUrl.Properties.InvokedViaFunctionUrl, true);
  assert.equal(TEMPLATE.Resources.PreviewLogGroup.Properties.RetentionInDays, 14);
  const statements = TEMPLATE.Resources.PreviewRole.Properties.Policies[0].PolicyDocument.Statement;
  assert.deepEqual(statements.map((s) => s.Action), [["logs:CreateLogStream", "logs:PutLogEvents"]]);
  assert.match(TEMPLATE.Resources.PreviewRole.Properties.PermissionsBoundary["Fn::Sub"], /:policy\/microcms-preview-logs-boundary$/);
});
test("new deployment creates real ZIP closed, verifies hash and both private probes before enabling", async (t) => {
  const aws = fakeAws(); const logs = [];
  const result = await deployPreview({ env: ENV, platform: "linux", waitForRole: async () => {}, root: await fixture(t), runAws: aws.run, log: (line) => logs.push(line) });
  assert.equal(result.origin, new globalThis.URL(URL).origin);
  assert.deepEqual(writes(aws.calls).map((c) => c.args[1]), ["create-stack", "create-function", "update-stack", "update-function-configuration", "update-stack"]);
  const cf = writes(aws.calls).filter((c) => c.args[0] === "cloudformation");
  assert.deepEqual(cf.map((c) => JSON.parse(c.input).Parameters.map((p) => p.ParameterValue)), [
    [NAME, "false", "false"], [NAME, "true", "false"], [NAME, "true", "true"]
  ]);
  for (const call of cf) assert.equal(call.input.includes(ENV.MICROCMS_API_KEY), false);
  for (const call of aws.calls) assert.equal(JSON.stringify(call.args).includes(ENV.MICROCMS_API_KEY), false);
  assert.equal(logs.join("\n").includes(ENV.MICROCMS_API_KEY), false);
  const pub = aws.calls.findIndex(isPublic);
  const probes = aws.calls.map((c, i) => c.args[1] === "invoke" ? i : -1).filter((i) => i >= 0);
  assert.equal(probes.length, 2); assert.ok(probes.every((i) => i < pub));
  const create = JSON.parse(aws.calls.find((c) => c.args[1] === "create-function").input);
  assert.equal(create.Handler, "run.sh"); assert.equal(create.Environment.Variables.MICROCMS_API_KEY, ENV.MICROCMS_API_KEY);
  assert.equal(create.Environment.Variables.PREVIEW_BASIC_PASSWORD, undefined);
});
test("existing deployment disables public permissions before revision-guarded code/config updates", async (t) => {
  const aws = fakeAws({ initialStack: stack(), initialFunction: fn() });
  await deployPreview({ env: ENV, platform: "linux", waitForRole: async () => {}, root: await fixture(t), runAws: aws.run, log() {} });
  assert.deepEqual(writes(aws.calls).map((c) => c.args[1]), ["update-stack", "update-function-code", "update-function-configuration", "update-stack"]);
  assert.equal(isPublic(writes(aws.calls)[0]), false);
});
test("wrong account, stack ownership, function ownership and unstable function are refused before writes", async (t) => {
  const root = await fixture(t);
  const foreignStack = stack(); foreignStack.Tags[0].Value = "other-owner";
  for (const config of [
    { account: "999900001111" }, { initialStack: foreignStack },
    { initialStack: stack(), initialFunction: { ...fn(), Tags: { ManagedBy: "other-owner" } } },
    { initialStack: stack(), initialFunction: { ...fn(), State: "Pending" } },
    { initialStack: null, initialFunction: fn() }
  ]) {
    const aws = fakeAws(config);
    await assert.rejects(deployPreview({ env: ENV, platform: "linux", waitForRole: async () => {}, root, runAws: aws.run, log() {} }));
    assert.equal(writes(aws.calls).length, 0);
  }
});
test("invalid region/name/platform/manifest is refused before any AWS request", async (t) => {
  const root = await fixture(t);
  for (const options of [
    { env: { ...ENV, AWS_REGION: "ap-northeast-1" } }, { env: { ...ENV, PREVIEW_STACK_NAME: "unrelated-stack" } }, { platform: "win32" }
  ]) {
    const aws = fakeAws();
    await assert.rejects(deployPreview({ env: ENV, platform: "linux", waitForRole: async () => {}, root, runAws: aws.run, log() {}, ...options }));
    assert.equal(aws.calls.length, 0);
  }
  await writeFile(path.join(root, ".preview-lambda-build/preview.zip"), "corrupt public fixture");
  const aws = fakeAws();
  await assert.rejects(deployPreview({ env: ENV, platform: "linux", waitForRole: async () => {}, root, runAws: aws.run, log() {} }));
  assert.equal(aws.calls.length, 0);
});
test("failed code/config/probes stop without enabling public access or retrying writes", async (t) => {
  const root = await fixture(t);
  for (const failedAction of ["create-function", "update-function-configuration", "invoke"]) {
    const aws = fakeAws({ mutate: (c) => c.args[1] === failedAction ? { stop: true } : undefined });
    await assert.rejects(deployPreview({ env: ENV, platform: "linux", waitForRole: async () => {}, root, runAws: aws.run, log() {} }));
    assert.equal(aws.calls.some(isPublic), false);
    assert.equal(aws.calls.filter((c) => c.args[1] === failedAction).length, 1);
  }
});
test("missing or mismatching ready function and unsafe invocation response stay closed", async (t) => {
  const root = await fixture(t);
  for (const mismatch of [null, { ...fn(), CodeSha256: "wrong" }, { ...fn(), RevisionId: "" }]) {
    let reads = 0;
    const aws = fakeAws({ mutate: (c) => c.args[1] === "get-function" && ++reads > 1 ? { override: true, value: mismatch } : undefined });
    await assert.rejects(deployPreview({ env: ENV, platform: "linux", waitForRole: async () => {}, root, runAws: aws.run, log() {} }));
    assert.equal(aws.calls.some(isPublic), false);
  }
  for (const bad of [
    { metadata: { StatusCode: 200, FunctionError: "Unhandled" }, payload: { statusCode: 200 } },
    { metadata: { StatusCode: 200 }, payload: { statusCode: 200, headers: { "Cache-Control": "max-age=60" } } },
    { metadata: { StatusCode: 200 }, payload: { statusCode: 200, headers: { "Cache-Control": "no-store", "WWW-Authenticate": "Basic" } } }
  ]) {
    const aws = fakeAws({ mutate: (c) => c.args[1] === "invoke" ? { override: true, value: bad } : undefined });
    await assert.rejects(deployPreview({ env: ENV, platform: "linux", waitForRole: async () => {}, root, runAws: aws.run, log() {} }));
    assert.equal(aws.calls.some(isPublic), false);
  }
});
