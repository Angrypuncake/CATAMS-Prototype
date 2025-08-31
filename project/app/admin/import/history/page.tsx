"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Staged = {
  batch_id: number;
  created_at: string;
  status: string;
  row_count: number | null;
  issues: Record<string, number> | null;
};

type Run = {
  run_id: number;
  batch_id: number;
  started_at: string;
  finished_at: string | null;
  status: "committed" | "rolled_back" | "failed";
  counts: {
    teaching_activity?: number;
    session_occurrence?: number;
    allocation?: number;
  } | null;
  staged_rows: number | null;
  batch_created_at: string;
};

export default function ImportHistoryPage() {
  const [staged, setStaged] = useState<Staged[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const confirmRollback = useRef<HTMLDialogElement>(null);
  const [pendingRunId, setPendingRunId] = useState<number | null>(null);

  async function load() {
    setMsg("");
    const res = await fetch("/api/admin/history?limit=100", {
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg(json?.error || "Failed to load history");
      return;
    }
    setStaged(json.staged || []);
    setRuns(json.runs || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function doRollback(runId: number) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();
      if (!res.ok)
        throw new Error(
          typeof payload === "string"
            ? payload
            : payload?.error || "Rollback failed",
        );
      setMsg(
        `Rolled back run #${runId}. Deleted: ${JSON.stringify(payload.deleted)}`,
      );
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setMsg(`❌ ${message || "Rollback failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 md:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Import History</h1>
        <button
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          onClick={load}
          disabled={busy}
        >
          Reload
        </button>

        <Link
          href="/admin/import"
          className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Import New
        </Link>
      </header>

      {msg && (
        <div className="text-sm border rounded bg-gray-50 p-3">{msg}</div>
      )}

      {/* Staged batches (resume/commit) */}
      <section className="border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Staged Batches</h2>
          <span className="text-xs text-gray-500">{staged.length} staged</span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 pr-4">Batch ID</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Rows</th>
                <th className="py-2 pr-4">Blocking</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staged.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={5}>
                    No staged batches.
                  </td>
                </tr>
              )}
              {staged.map((b) => {
                const issues = b.issues || {};
                const blocking =
                  Number(issues.missing_unit_code || 0) +
                  Number(issues.missing_activity_name || 0) +
                  Number(issues.missing_date || 0);
                return (
                  <tr key={b.batch_id} className="border-b">
                    <td className="py-2 pr-4 font-mono">#{b.batch_id}</td>
                    <td className="py-2 pr-4">
                      {new Date(b.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{b.row_count ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {blocking > 0 ? (
                        <span className="px-2 py-0.5 text-xs rounded bg-rose-100 text-rose-700">
                          {blocking} blocking
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700">
                          none
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <Link
                        className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                        href={`/admin/import/${b.batch_id}`}
                      >
                        Preview
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent commit runs (with rollback) */}
      <section className="border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Recent Commits</h2>
          <span className="text-xs text-gray-500">{runs.length} runs</span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 pr-4">Run</th>
                <th className="py-2 pr-4">Batch</th>
                <th className="py-2 pr-4">Started</th>
                <th className="py-2 pr-4">Finished</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Counts</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={7}>
                    No runs yet.
                  </td>
                </tr>
              )}
              {runs.map((r) => {
                const c = r.counts || {};
                const canRollback = r.status === "committed";
                return (
                  <tr key={r.run_id} className="border-b">
                    <td className="py-2 pr-4 font-mono">#{r.run_id}</td>
                    <td className="py-2 pr-4">
                      <Link
                        className="text-blue-700 underline"
                        href={`/admin/import/${r.batch_id}`}
                      >
                        #{r.batch_id}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      {new Date(r.started_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">
                      {r.finished_at
                        ? new Date(r.finished_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {r.status === "committed" && (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
                          committed
                        </span>
                      )}
                      {r.status === "rolled_back" && (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800">
                          rolled_back
                        </span>
                      )}
                      {r.status === "failed" && (
                        <span className="px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-700">
                          failed
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      TA: {c.teaching_activity ?? 0} • SO:{" "}
                      {c.session_occurrence ?? 0} • AL: {c.allocation ?? 0}
                    </td>
                    <td className="py-2 pr-4">
                      <button
                        className="px-3 py-1.5 rounded bg-rose-600 text-white disabled:opacity-50"
                        disabled={!canRollback || busy}
                        onClick={() => {
                          setPendingRunId(r.run_id);
                          confirmRollback.current?.showModal();
                        }}
                        title={
                          canRollback
                            ? "Rollback this commit"
                            : "Nothing to rollback"
                        }
                      >
                        Rollback
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Confirm dialog */}
      <dialog ref={confirmRollback} className="rounded-xl p-0">
        <div className="p-5 w-96">
          <h3 className="font-semibold mb-2">Rollback run #{pendingRunId}?</h3>
          <p className="text-sm text-gray-600 mb-4">
            This deletes rows created by that run (when safe). Shared rows are
            preserved.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-2 rounded bg-gray-200"
              onClick={() => confirmRollback.current?.close()}
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 rounded bg-rose-600 text-white disabled:opacity-50"
              disabled={busy}
              onClick={() => {
                confirmRollback.current?.close();
                if (pendingRunId) doRollback(pendingRunId);
              }}
            >
              Rollback
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
