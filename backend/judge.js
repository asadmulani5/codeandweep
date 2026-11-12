import { randomUUID } from "node:crypto";
import { runPython } from "./runner.js";

export async function judge(problem, userCode) {
  const marker = `__RESULTS_${randomUUID()}__`;
  const testsJson = JSON.stringify(JSON.stringify(problem.tests));

  const harness = `
import json as __json
__tests = __json.loads(${testsJson})
__results = []
for __t in __tests:
    try:
        __out = ${problem.functionName}(*__t["input"])
        __results.append({"passed": __out == __t["expected"], "output": repr(__out)})
    except Exception as __e:
        __results.append({"passed": False, "error": type(__e).__name__ + ": " + str(__e)})
print("${marker}" + __json.dumps(__results))
`;

  const run = await runPython(userCode + "\n" + harness);
    if (run.exitCode === 125) {
    console.error("Docker failed:", run.stderr);
    return { status: "error", stderr: "Code execution is temporarily unavailable. Please try again shortly." };
  }

  const line = run.stdout.split("\n").find((l) => l.startsWith(marker));
  if (!line) {
    return { status: run.killed ? "timeout" : "error", stdout: run.stdout, stderr: run.stderr };
  }

  const results = JSON.parse(line.slice(marker.length));
  const passed = results.filter((r) => r.passed).length;

  return {
    status: passed === results.length ? "accepted" : "wrong_answer",
    passed,
    total: results.length,
    results,
    stdout: run.stdout.replace(line, "").trim(),
  };
}