"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: number;
  user_id: string | number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  unit_code: string;
  unit_name: string;
  start_at: string;
  end_at: string;
  activity_type: string | null;
  activity_name: string | null;
};

export default function AllocationsTestPage() {
  const [userId, setUserId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [data, setData] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  // remember last used values across refreshes (optional)
  useEffect(() => {
    const u = localStorage.getItem("alloc_test_userId");
    const p = localStorage.getItem("alloc_test_page");
    const l = localStorage.getItem("alloc_test_limit");
    if (u) setUserId(u);
    if (p) setPage(Number(p) || 1);
    if (l) setLimit(Number(l) || 10);
  }, []);

  useEffect(() => {
    localStorage.setItem("alloc_test_userId", userId);
    localStorage.setItem("alloc_test_page", String(page));
    localStorage.setItem("alloc_test_limit", String(limit));
  }, [userId, page, limit]);

  const canFetch = useMemo(() => userId.trim().length > 0, [userId]);

  async function fetchData() {
    try {
      setBusy(true);
      setError("");
      setData([]);
      const q = new URLSearchParams({
        userId: userId.trim(),
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/tutor/allocations?${q.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      setData(json?.data ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Allocations – Test UI</h1>

      <div className="grid gap-3 sm:grid-cols-3 max-w-xl">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">User ID (staff_id)</span>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="e.g. 8 or tutor_123"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Page</span>
          <input
            type="number"
            min={1}
            className="border rounded-md px-3 py-2"
            value={page}
            onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Limit</span>
          <input
            type="number"
            min={1}
            max={100}
            className="border rounded-md px-3 py-2"
            value={limit}
            onChange={(e) =>
              setLimit(Math.min(100, Math.max(1, Number(e.target.value) || 10)))
            }
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={fetchData}
          disabled={!canFetch || busy}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        >
          {busy ? "Loading…" : "Fetch"}
        </button>
        {!canFetch && (
          <span className="text-sm text-gray-500">
            Enter a userId to enable fetch.
          </span>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Tutor</th>
              <th className="text-left p-2">Unit</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Activity</th>
              <th className="text-left p-2">Start</th>
              <th className="text-left p-2">End</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={7}>
                  {busy ? "Loading…" : "No rows"}
                </td>
              </tr>
            )}
            {data.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.id}</td>
                <td className="p-2">
                  {r.first_name || r.last_name
                    ? `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim()
                    : r.user_id}
                </td>
                <td className="p-2">{r.unit_code}</td>
                <td className="p-2">{r.unit_name}</td>
                <td className="p-2">
                  {r.activity_type ?? "-"} / {r.activity_name ?? "-"}
                </td>
                <td className="p-2">{r.start_at}</td>
                <td className="p-2">{r.end_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
