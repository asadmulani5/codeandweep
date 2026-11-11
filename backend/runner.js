import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

const TIMEOUT_SECONDS = 5;
const MAX_OUTPUT = 10000;

export function runPython(code) {
  return new Promise((resolve) => {
    const name = `cw-${randomUUID()}`;

    const args = [
      "run", "--rm", "-i",
      "--name", name,
      "--init",
      "--network", "none",
      "--memory", "128m",
      "--cpus", "0.5",
      "--pids-limit", "64",
      "python:3.13-alpine",
      "timeout", "-s", "KILL", String(TIMEOUT_SECONDS),
      "python", "-",
    ];

    const child = spawn("docker", args);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });

    const killer = setTimeout(() => {
      spawn("docker", ["kill", name]);
    }, (TIMEOUT_SECONDS + 2) * 1000);

    child.on("close", (exitCode) => {
      clearTimeout(killer);
      resolve({
        stdout: stdout.slice(0, MAX_OUTPUT),
        stderr: stderr.slice(0, MAX_OUTPUT),
        exitCode,
        killed: exitCode === 137,
      });
    });

    child.stdin.write(code);
    child.stdin.end();
  });
}