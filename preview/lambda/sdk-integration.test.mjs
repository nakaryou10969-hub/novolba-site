import assert from "node:assert/strict";
import test from "node:test";
import http from "node:http";
import { once } from "node:events";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deployPreview } from "./deploy.mjs";
import { awsRunner, SafeError } from "./aws-sdk.mjs";
import { SITE } from "../site-config.mjs";

const ACCOUNT = "305678528731";
const NAME = SITE.name === "KSC" ? "ksc-microcms-preview" : "novolba-microcms-preview";
const ROLE = `arn:aws:iam::${ACCOUNT}:role/${NAME}-execution`;
const STACK = `arn:aws:cloudformation:us-east-1:${ACCOUNT}:stack/${NAME}/dummy-stack-id`;
const FUNCTION_URL = "https://integrationtest.lambda-url.us-east-1.on.aws/";
const ORIGIN = FUNCTION_URL.slice(0, -1);
const PRIVATE = "dummy-microcms-key-opaque-value";
const ZIP = Buffer.from([0x50, 0x4b, 1, 2, 3, 255, 10]);
const CODE_HASH = createHash("sha256").update(ZIP).digest("base64");
const PREVIOUS_CODE_HASH = createHash("sha256").update("previous public fixture ZIP").digest("base64");
const MANAGED_BY = "microcms-preview-lambda";
const ENV = Object.freeze({ AWS_ACCESS_KEY_ID: "dummy-preview-access", AWS_SECRET_ACCESS_KEY: "dummy-preview-secret",
  AWS_REGION: "us-east-1", EXPECTED_AWS_ACCOUNT_ID: ACCOUNT, PREVIEW_FUNCTION_NAME: NAME, PREVIEW_STACK_NAME: NAME,
  MICROCMS_SERVICE_DOMAIN: "dummy-preview-service", MICROCMS_API_KEY: PRIVATE });

function escape(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function xml(action, contents) { return `<${action}Response xmlns="http://cloudformation.amazonaws.com/doc/2010-05-15/"><${action}Result>${contents}</${action}Result><ResponseMetadata><RequestId>dummy-request</RequestId></ResponseMetadata></${action}Response>`; }
function xmlError(message) { return `<ErrorResponse xmlns="http://cloudformation.amazonaws.com/doc/2010-05-15/"><Error><Type>Sender</Type><Code>ValidationError</Code><Message>${escape(message)}</Message></Error><RequestId>dummy-request</RequestId></ErrorResponse>`; }
function respond(response, value, xmlBody = false, status = 200, headers = {}) {
  response.writeHead(status, { "content-type": xmlBody ? "text/xml" : "application/json", ...headers });
  response.end(xmlBody ? value : JSON.stringify(value));
}

async function removeFixture(root) {
  assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
  assert.match(path.basename(root), /^preview-sdk-integration-[A-Za-z0-9]{6}$/);
  await rm(root, { recursive: true, force: true });
}

async function fixtureRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), "preview-sdk-integration-"));
  try {
    const output = path.join(root, ".preview-lambda-build");
    await mkdir(output);
    await mkdir(path.join(root, "preview/lambda"), { recursive: true });
    const template = await readFile(fileURLToPath(new URL("./template.json", import.meta.url)), "utf8");
    await writeFile(path.join(root, "preview/lambda/template.json"), template, "utf8");
    const zipPath = path.join(output, "preview.zip");
    await writeFile(zipPath, ZIP);
    await writeFile(`${zipPath}.manifest.json`, JSON.stringify({ format: 1, zipBytes: ZIP.length, expandedBytes: 20,
      sha256: createHash("sha256").update(ZIP).digest("hex"), files: [{ name: "out/preview/index.html" }] }), "utf8");
    return root;
  } catch (error) { await removeFixture(root); throw error; }
}

function stackDescription(model) {
  const outputs = [["FunctionName", NAME], ["RoleArn", ROLE], ...(model.urlExists ? [["FunctionUrl", FUNCTION_URL]] : [])];
  return xml("DescribeStacks", `<Stacks><member><StackId>${STACK}</StackId><StackName>${NAME}</StackName><CreationTime>2026-10-03T00:00:00Z</CreationTime><StackStatus>${model.stackStatus}</StackStatus><Outputs>${outputs.map(([key, value]) => `<member><OutputKey>${key}</OutputKey><OutputValue>${escape(value)}</OutputValue></member>`).join("")}</Outputs><Tags><member><Key>ManagedBy</Key><Value>${MANAGED_BY}</Value></member><member><Key>PreviewSite</Key><Value>${SITE.name}</Value></member></Tags></member></Stacks>`);
}

function existingFunction() {
  return { FunctionName: NAME, Role: ROLE, Runtime: "nodejs22.x", Handler: "run.sh", Architectures: ["x86_64"],
    Environment: { Variables: { PREVIEW_PUBLIC_ORIGIN: ORIGIN, AWS_LAMBDA_EXEC_WRAPPER: "/opt/bootstrap", MICROCMS_API_KEY: PRIVATE } },
    MemorySize: 512, Timeout: 30, LoggingConfig: { LogFormat: "JSON", ApplicationLogLevel: "WARN", SystemLogLevel: "WARN" },
    Layers: [{ Arn: "arn:aws:lambda:us-east-1:753240598075:layer:LambdaAdapterLayerX86:30" }],
    RevisionId: "revision-before-preparation", CodeSha256: PREVIOUS_CODE_HASH, State: "Active", LastUpdateStatus: "Successful" };
}

async function fakeAws(request, response, model, privateFailure) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  const query = new URLSearchParams(body);
  const action = query.get("Action");
  if (action === "GetCallerIdentity") {
    model.calls.push("sts");
    return respond(response, xml(action, `<Account>${ACCOUNT}</Account><UserId>dummy-user</UserId><Arn>arn:aws:iam::${ACCOUNT}:user/dummy-user</Arn>`), true);
  }
  if (action === "DescribeStacks") {
    model.calls.push("describe-stack");
    assert.equal(query.get("StackName"), NAME);
    return model.stackStatus ? respond(response, stackDescription(model), true) : respond(response, xmlError(`Stack with id ${NAME} does not exist`), true, 400);
  }
  if (action === "CreateStack" || action === "UpdateStack") {
    const parameters = {};
    for (let index = 1; query.has(`Parameters.member.${index}.ParameterKey`); index++) {
      parameters[query.get(`Parameters.member.${index}.ParameterKey`)] = query.get(`Parameters.member.${index}.ParameterValue`);
    }
    assert.deepEqual(Object.keys(parameters).sort(), ["EnablePublicAccess", "FunctionName", "FunctionPrepared"]);
    assert.equal(parameters.FunctionName, NAME);
    assert.equal(body.includes(PRIVATE), false);
    assert.equal(body.includes(ENV.MICROCMS_SERVICE_DOMAIN), false);
    const template = JSON.parse(query.get("TemplateBody"));
    assert.equal(template.Resources.PreviewFunction, undefined);
    assert.equal(template.Parameters.MicrocmsApiKey, undefined);
    assert.equal(template.Parameters.ServiceDomain, undefined);
    assert.equal(template.Parameters.PublicOrigin, undefined);
    assert.equal(query.get("Capabilities.member.1"), "CAPABILITY_NAMED_IAM");
    assert.equal(query.get("StackName"), NAME);
    const prepared = parameters.FunctionPrepared === "true";
    const publicAccess = parameters.EnablePublicAccess === "true";
    if (action === "CreateStack") {
      assert.equal(model.fn, null);
      assert.equal(prepared, false);
      assert.equal(publicAccess, false);
    }
    if (prepared) assert.ok(model.fn);
    if (publicAccess) {
      assert.equal(model.shellChecked, true);
      assert.equal(model.keylessChecked, true);
      assert.equal(model.fn.Environment.Variables.PREVIEW_PUBLIC_ORIGIN, ORIGIN);
      assert.equal(model.fn.CodeSha256, CODE_HASH);
    }
    model.calls.push(`cf-${action}-${prepared}-${publicAccess}`);
    if (model.afterPreparation && model.publicAccess && !publicAccess) {
      model.fn.RevisionId = "revision-after-preparation";
      if (model.afterPreparation === "code") model.fn.CodeSha256 = "parallel-code-hash";
      if (model.afterPreparation === "missing") model.fn = null;
      if (model.afterPreparation === "ownership") model.tags.ManagedBy = "other-owner";
      if (model.afterPreparation === "updating") model.fn.LastUpdateStatus = "InProgress";
    }
    model.urlExists = prepared;
    model.publicAccess = publicAccess;
    model.stackStatus = action === "CreateStack" ? "CREATE_COMPLETE" : "UPDATE_COMPLETE";
    return respond(response, xml(action, `<StackId>${STACK}</StackId>`), true);
  }
  if (request.method === "GET" && request.url === `/2015-03-31/functions/${NAME}`) {
    model.calls.push("get-function");
    if (!model.fn) return respond(response, { message: "Function not found" }, false, 404, { "x-amzn-errortype": "ResourceNotFoundException" });
    return respond(response, { Configuration: model.fn, Tags: model.tags });
  }
  if (request.method === "POST" && request.url === "/2015-03-31/functions") {
    const input = JSON.parse(body);
    assert.equal(model.fn, null);
    assert.equal(model.stackStatus, "CREATE_COMPLETE");
    assert.equal(model.publicAccess, false);
    assert.equal(model.roleWaited, true);
    assert.equal(input.FunctionName, NAME);
    assert.equal(input.Role, ROLE);
    assert.equal(input.Runtime, "nodejs22.x");
    assert.equal(input.Handler, "run.sh");
    assert.deepEqual(input.Architectures, ["x86_64"]);
    assert.equal(input.Environment.Variables.MICROCMS_API_KEY, PRIVATE);
    assert.equal(input.Environment.Variables.PREVIEW_PUBLIC_ORIGIN, "https://unconfigured.invalid");
    assert.deepEqual(Buffer.from(input.Code.ZipFile, "base64"), ZIP);
    model.tags = input.Tags;
    model.fn = { FunctionName: input.FunctionName, Role: input.Role, Runtime: input.Runtime, Handler: input.Handler,
      Architectures: input.Architectures, Environment: input.Environment, MemorySize: input.MemorySize, Timeout: input.Timeout,
      LoggingConfig: { ...input.LoggingConfig, LogGroup: `/aws/lambda/${NAME}` }, Layers: input.Layers.map((Arn) => ({ Arn })),
      RevisionId: "created-revision", CodeSha256: CODE_HASH, State: "Active", LastUpdateStatus: "Successful" };
    model.calls.push("create-real-zip");
    return respond(response, model.fn, false, 201);
  }
  if (request.method === "PUT" && request.url === `/2015-03-31/functions/${NAME}/code`) {
    const input = JSON.parse(body);
    assert.equal(model.publicAccess, false);
    model.calls.push("update-real-zip");
    if (model.afterPreparation === "race") model.fn.RevisionId = "revision-changed-after-fresh-read";
    if (input.RevisionId !== model.fn.RevisionId) {
      model.calls.push("code-revision-rejected");
      return respond(response, { message: "Local fixture revision does not match the current function revision" }, false, 412,
        { "x-amzn-errortype": "PreconditionFailedException" });
    }
    assert.equal(input.RevisionId, "revision-after-preparation");
    assert.deepEqual(Buffer.from(input.ZipFile, "base64"), ZIP);
    model.fn = { ...model.fn, CodeSha256: CODE_HASH, RevisionId: "code-updated-revision" };
    return respond(response, model.fn);
  }
  if (request.method === "PUT" && request.url === `/2015-03-31/functions/${NAME}/configuration`) {
    const input = JSON.parse(body);
    assert.equal(input.RevisionId, model.fn.RevisionId);
    assert.equal(model.urlExists, true);
    assert.equal(model.publicAccess, false);
    assert.equal(input.Environment.Variables.PREVIEW_PUBLIC_ORIGIN, ORIGIN);
    model.fn = { ...model.fn, ...input, Layers: input.Layers.map((Arn) => ({ Arn })), RevisionId: "configured-revision" };
    model.calls.push("configure-origin");
    return respond(response, model.fn);
  }
  if (request.method === "POST" && request.url === `/2015-03-31/functions/${NAME}/invocations`) {
    const event = JSON.parse(body);
    assert.equal(model.publicAccess, false);
    assert.equal(model.fn.Environment.Variables.PREVIEW_PUBLIC_ORIGIN, ORIGIN);
    assert.equal(model.fn.CodeSha256, CODE_HASH);
    assert.equal(event.headers.host, new URL(ORIGIN).host);
    assert.equal(request.headers["x-amz-invocation-type"], "RequestResponse");
    assert.equal(request.headers["x-amz-log-type"], "None");
    if (event.rawPath === "/preview/") {
      model.calls.push("private-shell");
      model.shellChecked = true;
      return respond(response, { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }, body: "<!doctype html><html><body>Preview</body></html>" });
    }
    assert.equal(event.rawPath, "/api/preview");
    assert.equal(event.headers.origin, ORIGIN);
    assert.equal(event.headers["x-preview-request"], "1");
    assert.equal(event.requestContext.http.method, "POST");
    assert.equal(event.body, "{}");
    model.calls.push("private-keyless");
    model.keylessChecked = !privateFailure;
    return respond(response, { statusCode: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ error: privateFailure ? "Unexpected local fixture response" : "Invalid preview request." }) });
  }
  throw new Error("Local integration model received an unexpected AWS operation");
}

async function integration(privateFailure, afterPreparation) {
  const root = await fixtureRoot();
  const existing = afterPreparation !== undefined;
  const expectedStop = existing && afterPreparation !== "revision";
  const model = { stackStatus: existing ? "UPDATE_COMPLETE" : null, fn: existing ? existingFunction() : null,
    tags: existing ? { ManagedBy: MANAGED_BY, PreviewSite: SITE.name } : {}, urlExists: existing, publicAccess: existing,
    shellChecked: false, keylessChecked: false, roleWaited: false, calls: [], errors: [], afterPreparation };
  const server = http.createServer((request, response) => {
    fakeAws(request, response, model, privateFailure).catch((error) => {
      model.errors.push(error);
      if (!response.headersSent) respond(response, { message: "Local model assertion failed" }, false, 500);
      else response.destroy();
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const endpoint = `http://127.0.0.1:${server.address().port}`;
  const runner = awsRunner(ENV, { endpoints: { sts: endpoint, cloudformation: endpoint, lambda: endpoint }, requestTimeoutMs: 2_000, pollMs: 1, stackWaitMs: 1_000 });
  const logs = [];
  try {
    const work = deployPreview({ env: ENV, platform: "linux", runAws: runner, root, log: (value) => logs.push(value), waitForRole: async () => {
      assert.equal(model.stackStatus, "CREATE_COMPLETE"); assert.equal(model.fn, null);
      model.roleWaited = true; model.calls.push("role-stabilized");
    } });
    if (expectedStop) await assert.rejects(work, (error) => error instanceof SafeError);
    else if (privateFailure) await assert.rejects(work, (error) => error instanceof SafeError && error.message.includes("Keyless article check failed"));
    else assert.deepEqual(await work, { origin: ORIGIN, functionName: NAME, stackName: NAME });
    assert.deepEqual(model.errors, []);
    assert.equal(logs.some((value) => value.includes(PRIVATE)), false);
    if (expectedStop) {
      assert.equal(model.publicAccess, false);
      assert.deepEqual(model.calls.filter((item) => !["sts", "describe-stack", "get-function"].includes(item)), [
        "cf-UpdateStack-true-false", ...(afterPreparation === "race" ? ["update-real-zip", "code-revision-rejected"] : [])
      ]);
      return;
    }
    assert.equal(model.fn.CodeSha256, CODE_HASH);
    assert.equal(model.publicAccess, !privateFailure);
    assert.deepEqual(model.calls.filter((item) => !["sts", "describe-stack", "get-function"].includes(item)), [
      ...(existing ? ["cf-UpdateStack-true-false", "update-real-zip"] : ["cf-CreateStack-false-false", "role-stabilized", "create-real-zip", "cf-UpdateStack-true-false"]),
      "configure-origin", "private-shell", "private-keyless", ...(privateFailure ? [] : ["cf-UpdateStack-true-true"])
    ]);
  } finally {
    runner.destroy();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await removeFixture(root);
  }
}

test("full real-SDK deployment validates real ZIP/origin privately before two URL permissions; CF receives no CMS secrets", async () => { await integration(false); });
test("full real-SDK deployment stops before public permissions when the private article check fails", async () => { await integration(true); });
test("full real-SDK redeployment refreshes the revision changed during infrastructure preparation before one ZIP update", async () => { await integration(false, "revision"); });
test("full real-SDK redeployment stops after preparation if code, function existence, ownership or update state changed", async (t) => {
  for (const change of ["code", "missing", "ownership", "updating"]) await t.test(change, async () => { await integration(false, change); });
});
test("full real-SDK redeployment sends one guarded update and stops on a revision race after its fresh read", async () => { await integration(false, "race"); });
