import express from "express";
import { runPython } from "./runner.js";

const app = express();
const PORT = process.env.PORT || 4000;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});