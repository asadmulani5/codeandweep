import express from "express";
import cors from "cors";
import { runPython } from "./runner.js";
import { problems } from "./problems.js";
import { judge } from "./judge.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/run", async (req, res) => {
  const { code } = req.body;

  if (typeof code !== "string" || code.length === 0 || code.length > 10000) {
    return res.status(400).json({ error: "code must be a string of 1-10000 characters" });
  }

  const result = await runPython(code);
  res.json(result);
});

app.get("/problems/:id", (req, res) => {
  const problem = problems[req.params.id];
  if (!problem) return res.status(404).json({ error: "problem not found" });
  const { tests, ...publicInfo } = problem;
  res.json({ ...publicInfo, examples: tests.slice(0, 2) });
});

app.post("/submit", async (req, res) => {
  const { problemId, code } = req.body;
  const problem = problems[problemId];
  if (!problem) return res.status(404).json({ error: "problem not found" });
  if (typeof code !== "string" || code.length === 0 || code.length > 10000) {
    return res.status(400).json({ error: "code must be a string of 1-10000 characters" });
  }
  res.json(await judge(problem, code));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});