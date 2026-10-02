import assert from "node:assert/strict";
import test from "node:test";
import http from "node:http";
import { once } from "node:events";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { awsRunner, SafeError, classifyAwsFailure } from "./aws-sdk.mjs";

const ENV = Object.freeze({ AWS_ACCESS_KEY_ID: "preview-dummy-access-id", AWS_SECRET_ACCESS_KEY: "preview-dummy-secret", AWS_SESSION_TOKEN: "preview-dummy-session" });
const NAME = "ksc-microcms-preview";
const STACK_ID = `arn:aws:cloudformation:us-east-1:305678528731:stack/${NAME}/dummy-id`;
const MARKER = "dummy-private-value-do-not-log";

function xmlEscape(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function xml(action, body) { return `<${action}Response xmlns="http://cloudformation.amazonaws.com/doc/2010-05-15/"><${action}Result>${body}</${action}Result><ResponseMetadata><RequestId>dummy-request-id</RequestId></ResponseMetadata></${action}Response>`; }
function xmlError(code, message) { return `<ErrorResponse xmlns="http://cloudformation.amazonaws.com/doc/2010-05-15/"><Error><Type>Sender</Type><Code>${code}</Code><Message>${xmlEscape(message)}</Message></Error><RequestId>dummy-request-id</RequestId></ErrorResponse>`; }
function jsonResponse(response, value, status = 200, headers = {}) { response.writeHead(status, { "content-type": "application/json", ...headers }); response.end(JSON.stringify(value)); }
function xmlResponse(response, value, status = 200) { response.writeHead(status, { "content-type": "text/xml" }); response.end(value); }
function stackResponse(status) { return xml("DescribeStacks", `<Stacks><member><StackId>${STACK_ID}</StackId><StackName>${NAME}</StackName><CreationTime>2026-10-03T00:00:00Z</CreationTime><StackStatus>${status}</StackStatus><Outputs><member><OutputKey>FunctionName</OutputKey><OutputValue>${NAME}</OutputValue></member></Outputs><Tags><member><Key>ManagedBy</Key><Value>microcms-preview-lambda</Value></member></Tags></member></Stacks>`); }
function functionResponse(state = "Active", update = "Successful", hash = "expected-hash") {
  return { Configuration: {
    FunctionName: NAME, Runtime: "nodejs22.x", Role: `arn:aws:iam::305678528731:role/${NAME}-execution`,
    Architectures: ["x86_64"], Handler: "run.sh", State: state, LastUpdateStatus: update,
    RevisionId: "new-revision", CodeSha256: hash, Environment: { Variables: {
      MICROCMS_API_KEY: MARKER, PREVIEW_PUBLIC_ORIGIN: "https://dummy.lambda-url.us-east-1.on.aws", AWS_LAMBDA_EXEC_WRAPPER: "/opt/bootstrap",
      UNRELATED_PRIVATE_KEY: MARKER
    } }, Layers: [{ Arn: "arn:aws:lambda:us-east-1:753240598075:layer:LambdaAdapterLayerX86:30", UnrelatedValue: MARKER }],
    MemorySize: 512, Timeout: 30, LoggingConfig: { LogFormat: "JSON", ApplicationLogLevel: "WARN", SystemLogLevel: "WARN", LogGroup: `/aws/lambda/${NAME}` }
  }, Tags: { ManagedBy: "microcms-preview-lambda", PreviewSite: "KSC", PrivateTag: MARKER }, Code: { Location: `https://unrelated.invalid/${MARKER}` } };
}

async function withServer(callback, handle) {
  const requests = [];
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    const item = { method: request.method, url: request.url, headers: request.headers, body, query: new URLSearchParams(body) };
    requests.push(item);
    try { await handle(item, response); }
    catch { response.destroy(); }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const endpoint = `http://127.0.0.1:${server.address().port}`;
  const runner = awsRunner(ENV, { endpoints: { sts: endpoint, cloudformation: endpoint, lambda: endpoint }, requestTimeoutMs: 2_000, pollMs: 1, stackWaitMs: 1_000 });
  try { await callback({ runner, requests, endpoint }); }
  finally {
    runner.destroy();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

test("actual SDK serializes STS/CloudFormation query requests and filters stack responses", async () => {
  await withServer(async ({ runner, requests }) => {
    assert.equal(await runner(["sts", "get-caller-identity"]), "305678528731");
    const stack = await runner(["cloudformation", "describe-stacks", "--stack-name", NAME]);
    assert.deepEqual(stack, { Outputs: [{ OutputKey: "FunctionName", OutputValue: NAME }], Tags: [{ Key: "ManagedBy", Value: "microcms-preview-lambda" }], StackStatus: "CREATE_COMPLETE" });
    const input = { StackName: NAME, TemplateBody: JSON.stringify({ Resources: { Dummy: { Type: "Test::Dummy" } } }), Parameters: [{ ParameterKey: "FunctionPrepared", ParameterValue: "false" }], Capabilities: ["CAPABILITY_NAMED_IAM"], Tags: [{ Key: "ManagedBy", Value: "microcms-preview-lambda" }] };
    assert.equal(await runner(["cloudformation", "create-stack"], { input: JSON.stringify(input) }), STACK_ID);
    assert.equal(await runner(["cloudformation", "update-stack"], { input: JSON.stringify(input) }), STACK_ID);
    assert.equal(requests.length, 4);
    assert.equal(requests[0].query.get("Action"), "GetCallerIdentity");
    assert.equal(requests[1].query.get("StackName"), NAME);
    const create = requests[2].query;
    assert.equal(create.get("TemplateBody"), input.TemplateBody);
    assert.equal(create.get("Parameters.member.1.ParameterValue"), "false");
    assert.equal(create.get("Capabilities.member.1"), "CAPABILITY_NAMED_IAM");
    assert.equal(create.get("Tags.member.1.Value"), "microcms-preview-lambda");
    assert.match(create.get("ClientRequestToken"), /^[a-f0-9-]{36}$/);
    assert.notEqual(create.get("ClientRequestToken"), requests[3].query.get("ClientRequestToken"));
    for (const request of requests) {
      assert.equal(request.method, "POST");
      assert.match(request.headers.authorization, /Credential=preview-dummy-access-id\/.+\/us-east-1\//);
      assert.equal(request.headers["x-amz-security-token"], ENV.AWS_SESSION_TOKEN);
    }
  }, (request, response) => {
    const action = request.query.get("Action");
    if (action === "GetCallerIdentity") return xmlResponse(response, xml(action, "<Account>305678528731</Account><UserId>dummy-user</UserId><Arn>arn:aws:iam::305678528731:user/dummy-user</Arn>"));
    if (action === "DescribeStacks") return xmlResponse(response, stackResponse("CREATE_COMPLETE"));
    return xmlResponse(response, xml(action, `<StackId>${STACK_ID}</StackId>`));
  });
});

test("actual Lambda SDK sends real ZIP bytes, revisions, environment and invocation payload exactly", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "preview-sdk-test-"));
  const zipPath = path.join(directory, "dummy.zip");
  const bytes = Buffer.from([0x50, 0x4b, 0, 1, 255, 42]);
  await writeFile(zipPath, bytes);
  try {
    await withServer(async ({ runner, requests }) => {
      const config = await runner(["lambda", "get-function", "--function-name", NAME]);
      assert.deepEqual(config.Tags, { ManagedBy: "microcms-preview-lambda", PreviewSite: "KSC" });
      assert.equal(config.PublicOrigin, "https://dummy.lambda-url.us-east-1.on.aws");
      assert.equal(config.ExecWrapper, "/opt/bootstrap");
      assert.deepEqual(config.LayerArns, ["arn:aws:lambda:us-east-1:753240598075:layer:LambdaAdapterLayerX86:30"]);
      assert.equal(config.MemorySize, 512);
      assert.equal(config.Timeout, 30);
      assert.equal(config.LoggingConfig.LogFormat, "JSON");
      assert.equal(JSON.stringify(config).includes(MARKER), false);
      assert.equal("Environment" in config, false);
      assert.equal("Code" in config, false);
      const input = { FunctionName: NAME, Role: config.Role, Runtime: "nodejs22.x", Handler: "run.sh", Architectures: ["x86_64"], Tags: config.Tags, Environment: { Variables: { MICROCMS_API_KEY: MARKER } } };
      const created = await runner(["lambda", "create-function"], { input: JSON.stringify(input), zipPath });
      assert.deepEqual(created, { State: "Active", LastUpdateStatus: "Successful", RevisionId: "new-revision", CodeSha256: "expected-hash" });
      await runner(["lambda", "update-function-code", "--function-name", NAME], { input: JSON.stringify({ RevisionId: "previous-revision" }), zipPath });
      await runner(["lambda", "update-function-configuration", "--function-name", NAME], { input: JSON.stringify({ RevisionId: "code-revision", Handler: "run.sh", Environment: input.Environment }) });
      const event = { version: "2.0", rawPath: "/api/preview", body: "{}" };
      const invoked = await runner(["lambda", "invoke", "--function-name", NAME], { input: JSON.stringify(event), payloadOutput: true });
      assert.deepEqual(invoked, { payload: { statusCode: 400, body: "{\"error\":\"Invalid preview request.\"}" }, metadata: { StatusCode: 200, FunctionError: undefined } });
      assert.equal(requests[0].url, `/2015-03-31/functions/${NAME}`);
      assert.equal(requests[1].method, "POST");
      assert.equal(requests[1].url, "/2015-03-31/functions");
      assert.deepEqual(JSON.parse(requests[1].body), { ...input, Code: { ZipFile: bytes.toString("base64") } });
      assert.deepEqual(JSON.parse(requests[2].body), { RevisionId: "previous-revision", ZipFile: bytes.toString("base64") });
      assert.equal(requests[2].method, "PUT");
      assert.equal(requests[2].url, `/2015-03-31/functions/${NAME}/code`);
      assert.deepEqual(JSON.parse(requests[3].body), { RevisionId: "code-revision", Handler: "run.sh", Environment: input.Environment });
      assert.equal(requests[3].url, `/2015-03-31/functions/${NAME}/configuration`);
      assert.deepEqual(JSON.parse(requests[4].body), event);
      assert.equal(requests[4].headers["x-amz-invocation-type"], "RequestResponse");
      assert.equal(requests[4].headers["x-amz-log-type"], "None");
    }, (request, response) => {
      if (request.url.endsWith("/invocations")) return jsonResponse(response, { statusCode: 400, body: "{\"error\":\"Invalid preview request.\"}" });
      return jsonResponse(response, request.method === "GET" ? functionResponse() : functionResponse().Configuration, request.method === "POST" ? 201 : 200);
    });
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
    assert.match(path.basename(directory), /^preview-sdk-test-[A-Za-z0-9]{6}$/);
    await rm(directory, { recursive: true, force: true });
  }
});

test("AWS raw errors never leave the fixed-label boundary and a failed write is sent only once", async () => {
  for (const [status, code, label] of [[403, "AccessDenied", "access-denied"], [500, "InternalFailure", "unclassified"], [429, "Throttling", "throttled"]]) {
    await withServer(async ({ runner, requests }) => {
      await assert.rejects(runner(["cloudformation", "create-stack"], { input: JSON.stringify({ StackName: NAME, TemplateBody: "{}" }) }), (error) => {
        assert.ok(error instanceof SafeError);
        assert.equal(error.message.includes(MARKER), false);
        assert.ok(error.message.includes(`(${label})`));
        return true;
      });
      assert.equal(requests.length, 1);
    }, (_request, response) => xmlResponse(response, xmlError(code, MARKER), status));
  }
});

test("Lambda REST errors are not retried and SDK logging does not expose dummy secrets", async () => {
  for (const [status, code, label] of [[500, "ServiceException", "unclassified"], [429, "TooManyRequestsException", "throttled"]]) {
    await withServer(async ({ runner, requests }) => {
      const captured = [];
      const originals = Object.fromEntries(["log", "info", "warn", "error", "debug", "trace"].map((key) => [key, console[key]]));
      let caught;
      try {
        for (const key of Object.keys(originals)) console[key] = (...values) => captured.push(values);
        await runner(["lambda", "update-function-configuration", "--function-name", NAME], { input: JSON.stringify({ RevisionId: "dummy-revision", Environment: { Variables: { MICROCMS_API_KEY: MARKER } } }) });
      } catch (error) { caught = error; }
      finally { for (const [key, value] of Object.entries(originals)) console[key] = value; }
      assert.ok(caught instanceof SafeError);
      assert.ok(caught.message.includes(`(${label})`));
      assert.equal(caught.message.includes(MARKER), false);
      assert.equal(requests.length, 1);
      assert.deepEqual(captured, []);
    }, (_request, response) => jsonResponse(response, { message: MARKER }, status, { "x-amzn-errortype": code }));
  }
});

test("only exact known missing/no-update errors may be handled without failure", async () => {
  await withServer(async ({ runner, requests }) => {
    assert.equal(await runner(["cloudformation", "describe-stacks", "--stack-name", NAME], { allowMissing: true }), null);
    await assert.rejects(runner(["cloudformation", "describe-stacks", "--stack-name", "wrong-stack"], { allowMissing: true }), SafeError);
    assert.deepEqual(await runner(["cloudformation", "update-stack"], { input: JSON.stringify({ StackName: NAME }), allowNoUpdates: true }), { noUpdates: true });
    assert.equal(await runner(["lambda", "get-function", "--function-name", NAME], { allowMissing: true }), null);
    assert.equal(requests.length, 4);
  }, (request, response) => {
    if (request.method === "GET") return jsonResponse(response, { message: MARKER }, 404, { "x-amzn-errortype": "ResourceNotFoundException" });
    const message = request.query.get("Action") === "UpdateStack" ? "No updates are to be performed." : `Stack with id ${NAME} does not exist`;
    return xmlResponse(response, xmlError("ValidationError", message), 400);
  });
});

test("oversized declared and chunked bodies are stopped before SDK deserialization", async () => {
  for (const declared of [true, false]) {
    await withServer(async ({ runner, requests }) => {
      await assert.rejects(runner(["sts", "get-caller-identity"]), (error) => error instanceof SafeError && error.message.includes("(response-limit)"));
      assert.equal(requests.length, 1);
    }, (_request, response) => {
      response.writeHead(200, { "content-type": "text/xml", ...(declared ? { "content-length": 2 * 1024 * 1024 + 1 } : {}) });
      response.end(declared ? "short" : Buffer.alloc(2 * 1024 * 1024 + 1, 65));
    });
  }
});

test("deadline aborts a stalled response body and closes its socket", async () => {
  let closed;
  const closing = new Promise((resolve) => { closed = resolve; });
  await withServer(async ({ endpoint, requests }) => {
    const runner = awsRunner(ENV, { endpoints: { sts: endpoint }, requestTimeoutMs: 100 });
    try {
      await assert.rejects(runner(["sts", "get-caller-identity"]), (error) => error instanceof SafeError && error.message.includes("(timeout)"));
      assert.equal(requests.length, 1);
      await Promise.race([closing, new Promise((_resolve, reject) => setTimeout(() => reject(new Error("Local test socket did not close")), 1_000).unref())]);
    } finally { runner.destroy(); }
  }, (_request, response) => {
    response.on("close", closed);
    response.writeHead(200, { "content-type": "text/xml" });
    response.write("<GetCallerIdentityResponse>");
  });
});

test("Invoke preserves FunctionError and rejects invalid/oversized payloads without contents", async () => {
  for (const body of ["not-json", JSON.stringify({ body: "A".repeat(256 * 1024) }), "[]"]) {
    await withServer(async ({ runner }) => {
      await assert.rejects(runner(["lambda", "invoke", "--function-name", NAME], { input: "{}" }), (error) => error instanceof SafeError && error.message.includes("invalid preview invocation payload"));
    }, (_request, response) => response.end(body));
  }
  await withServer(async ({ runner }) => {
    const result = await runner(["lambda", "invoke", "--function-name", NAME], { input: "{}" });
    assert.equal(result.metadata.FunctionError, "Unhandled");
    assert.equal(result.metadata.StatusCode, 200);
  }, (_request, response) => jsonResponse(response, { errorMessage: MARKER }, 200, { "x-amz-function-error": "Unhandled" }));
});

test("CloudFormation waits accept only expected success and expected progress states", async () => {
  for (const [kind, states] of [["stack-create-complete", ["CREATE_IN_PROGRESS", "CREATE_COMPLETE"]], ["stack-update-complete", ["UPDATE_IN_PROGRESS", "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS", "UPDATE_COMPLETE"]]]) {
    let index = 0;
    await withServer(async ({ runner, requests }) => {
      assert.equal(await runner(["cloudformation", "wait", kind, "--stack-name", NAME]), null);
      assert.equal(requests.length, states.length);
      assert.ok(requests.every((request) => request.query.get("Action") === "DescribeStacks"));
    }, (_request, response) => xmlResponse(response, stackResponse(states[index++])));
  }
  for (const state of ["ROLLBACK_COMPLETE", "UPDATE_ROLLBACK_IN_PROGRESS", "UPDATE_FAILED", "UNRECOGNIZED", "UPDATE_COMPLETE"]) {
    await withServer(async ({ runner, requests }) => {
      await assert.rejects(runner(["cloudformation", "wait", "stack-create-complete", "--stack-name", NAME]), SafeError);
      assert.equal(requests.length, 1);
    }, (_request, response) => xmlResponse(response, stackResponse(state)));
  }
});

test("Lambda waits require Active/Successful and the expected code hash", async () => {
  const values = [functionResponse("Pending", "Successful"), functionResponse("Active", "InProgress"), functionResponse("Active", "Successful", "old-hash"), functionResponse()];
  let index = 0;
  await withServer(async ({ runner, requests }) => {
    assert.equal(await runner(["lambda", "wait", "function-updated-v2", "--function-name", NAME], { expectedCodeHash: "expected-hash" }), null);
    assert.equal(requests.length, 4);
  }, (_request, response) => jsonResponse(response, values[index++]));
  for (const [state, update] of [["Failed", "Successful"], ["Inactive", "Successful"], ["Active", "Failed"], ["Unknown", "Successful"], ["Active", "Unknown"]]) {
    await withServer(async ({ runner, requests }) => {
      await assert.rejects(runner(["lambda", "wait", "function-updated-v2", "--function-name", NAME]), SafeError);
      assert.equal(requests.length, 1);
    }, (_request, response) => jsonResponse(response, functionResponse(state, update)));
  }
});

test("new Lambda creation may omit LastUpdateStatus until completion, updates may not", async () => {
  const pending = functionResponse("Pending");
  const active = functionResponse("Active");
  delete pending.Configuration.LastUpdateStatus;
  delete active.Configuration.LastUpdateStatus;
  const values = [pending, active, functionResponse()];
  let index = 0;
  await withServer(async ({ runner, requests }) => {
    assert.equal(await runner(["lambda", "wait", "function-updated-v2", "--function-name", NAME], { creating: true, expectedCodeHash: "expected-hash" }), null);
    assert.equal(requests.length, 3);
  }, (_request, response) => jsonResponse(response, values[index++]));
  await withServer(async ({ runner, requests }) => {
    await assert.rejects(runner(["lambda", "wait", "function-updated-v2", "--function-name", NAME]), SafeError);
    assert.equal(requests.length, 1);
  }, (_request, response) => jsonResponse(response, pending));
});

test("wait deadlines and explicit destruction stop subsequent requests", async () => {
  await withServer(async ({ endpoint, requests }) => {
    const runner = awsRunner(ENV, { endpoints: { cloudformation: endpoint }, stackWaitMs: 40, pollMs: 10 });
    try {
      await assert.rejects(runner(["cloudformation", "wait", "stack-create-complete", "--stack-name", NAME]), /wait timed out|operation failed \(timeout\)/);
      const count = requests.length;
      runner.destroy();
      await assert.rejects(runner(["cloudformation", "describe-stacks", "--stack-name", NAME]), /runner is closed/);
      assert.equal(requests.length, count);
    } finally { runner.destroy(); }
  }, (_request, response) => xmlResponse(response, stackResponse("CREATE_IN_PROGRESS")));
});

test("missing credentials, invalid input, unsupported operations and non-loopback test endpoints fail before requests", async () => {
  await withServer(async ({ endpoint, requests }) => {
    const runner = awsRunner({ AWS_PROFILE: "unrelated", AWS_ENDPOINT_URL: "https://unrelated.invalid" }, { endpoints: { sts: endpoint } });
    try { await assert.rejects(runner(["sts", "get-caller-identity"]), /credentials are missing/); }
    finally { runner.destroy(); }
    assert.equal(requests.length, 0);
  }, (_request, response) => response.end());
  const runner = awsRunner(ENV);
  try {
    await assert.rejects(runner(["cloudformation", "create-stack"], { input: `{${MARKER}` }), (error) => error instanceof SafeError && !error.message.includes(MARKER));
    await assert.rejects(runner(["iam", "create-user"]), /Unsupported AWS preview operation/);
  } finally { runner.destroy(); }
  for (const endpoint of ["https://aws.invalid", "http://127.0.0.1@aws.invalid", "http://localhost/secret", "http://localhost/?secret=value"]) {
    assert.throws(() => awsRunner(ENV, { endpoints: { sts: endpoint } }), SafeError);
  }
});

test("classification returns only fixed labels even when raw names/messages contain private markers", () => {
  for (const [name, label] of [["AccessDeniedException", "access-denied"], ["AbortError", "timeout"], ["PreviewResponseLimitError", "response-limit"], ["ThrottlingException", "throttled"], ["ResourceConflictException", "conflict"], [MARKER, "unclassified"]]) {
    assert.equal(classifyAwsFailure({ name, message: MARKER }), label);
  }
});
