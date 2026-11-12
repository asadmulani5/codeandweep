"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

const API = "http://localhost:4000";
const PROBLEM_ID = "two-sum";
const STARTER = "def two_sum(nums, target):\n    # write your solution here\n    pass\n";

export default function Home() {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(STARTER);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/problems/${PROBLEM_ID}`)
      .then((r) => r.json())
      .then(setProblem)
      .catch(() => setError("Could not reach the backend. Is it running on port 4000?"));
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const r = await fetch(`${API}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: PROBLEM_ID, code }),
      });
      setResult(await r.json());
    } catch {
      setError("Submission failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen bg-zinc-950 text-zinc-100">
      <section className="w-2/5 overflow-y-auto border-r border-zinc-800 p-6">
        <h1 className="text-2xl font-semibold">CodeAndWeep</h1>

        {problem ? (
          <>
            <h2 className="mt-6 text-xl font-medium">{problem.title}</h2>
            <p className="mt-3 text-zinc-300">{problem.description}</p>
            <h3 className="mt-6 font-medium">Examples</h3>
            {problem.examples.map((ex, i) => (
              <pre key={i} className="mt-2 rounded bg-zinc-900 p-3 text-sm">
                {`Input: ${JSON.stringify(ex.input)}\nOutput: ${JSON.stringify(ex.expected)}`}
              </pre>
            ))}
          </>
        ) : (
          !error && <p className="mt-6 text-zinc-400">Loading problem...</p>
        )}

        {error && <p className="mt-6 text-red-400">{error}</p>}
        {result && <ResultPanel result={result} />}
        {result?.review && <ReviewPanel review={result.review} />}
      </section>

      <section className="flex w-3/5 flex-col">
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>
        <div className="flex justify-end border-t border-zinc-800 p-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-emerald-600 px-5 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Running tests and reviewing..." : "Submit"}
          </button>
        </div>
      </section>
    </main>
  );
}

function ResultPanel({ result }) {
  if (result.error) {
    return <p className="mt-6 text-red-400">{result.error}</p>;
  }

  const accepted = result.status === "accepted";

  return (
    <div className="mt-6 rounded border border-zinc-800 p-4">
      <p className={`text-lg font-semibold ${accepted ? "text-emerald-400" : "text-red-400"}`}>
        {result.status.replace("_", " ")}
        {result.total !== undefined && ` · ${result.passed}/${result.total} tests passed`}
      </p>
      {result.results?.map((r, i) => (
        <p key={i} className="mt-1 text-sm">
          {r.passed ? "✅" : "❌"} Test {i + 1}: {r.error ?? r.output}
        </p>
      ))}
      {result.stderr && (
        <pre className="mt-3 whitespace-pre-wrap text-sm text-red-300">{result.stderr}</pre>
      )}
    </div>
  );
}

function ReviewPanel({ review }) {
  const positive = review.verdict?.includes("Hire") && !review.verdict.includes("No Hire");

  return (
    <div className="mt-6 rounded border border-zinc-800 p-4">
      <p className="text-sm uppercase tracking-wide text-zinc-400">Interviewer feedback</p>
      <p className={`mt-1 text-xl font-semibold ${positive ? "text-emerald-400" : "text-amber-400"}`}>
        {review.verdict}
      </p>
      <p className="mt-2 text-zinc-300">{review.summary}</p>

      <div className="mt-3 flex gap-6 text-sm text-zinc-400">
        <span>Time: <span className="text-zinc-100">{review.timeComplexity}</span></span>
        <span>Space: <span className="text-zinc-100">{review.spaceComplexity}</span></span>
      </div>

      <ReviewList title="Strengths" items={review.strengths} />
      <ReviewList title="Issues" items={review.issues} />

      {review.followUp && (
        <div className="mt-4 rounded bg-zinc-900 p-3 text-sm">
          <span className="font-medium">Follow-up question: </span>
          {review.followUp}
        </div>
      )}
    </div>
  );
}

function ReviewList({ title, items }) {
  if (!items?.length) return null;

  return (
    <div className="mt-4">
      <h4 className="font-medium">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-300">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}