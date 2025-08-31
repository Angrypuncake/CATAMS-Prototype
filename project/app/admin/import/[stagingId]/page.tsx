"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/** ---------- Types ---------- */
type TimetableRow = {
  date: string;
  start_time: string;
  end_time: string;
  activity_name: string;
  activity_type: string;
  activity_description: string | null;
  staff_id: string | null;
  staff_name: string | null;
  row_count: number;
  total_hours: number | null;
};

type PreviewPayload = {
  stagingId: number;
  preview: {
    raw: unknown[];
    issues: Record<string, number>;
    timetable: TimetableRow[];
  };
};

/** ---------- Small UI helpers ---------- */
function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}) {
  const map: Record<string, string> = {
    neutral: "bg-gray-100 text-gray-700",
    good: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  tone = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "danger" | "neutral";
}) {
  const map: Record<string, string> = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:hover:bg-emerald-600",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:hover:bg-rose-600",
    neutral:
      "bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50 disabled:hover:bg-gray-200",
  };
  return (
    <button
      className={`px-3 py-2 rounded-md text-sm font-medium transition ${map[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="py-2 pr-4">
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </td>
      ))}
    </tr>
  );
}

/** ---------- Page ---------- */
export default function PreviewPage() {
  const params = useParams<{ stagingId: string }>();
  const router = useRouter();
  const id = Number(params.stagingId);
  const [data, setData] = useState<PreviewPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");
  const [rawOpen, setRawOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof TimetableRow | "">("");
  const [sortAsc, setSortAsc] = useState(true);
  const confirmRefDiscard = useRef<HTMLDialogElement>(null);
  const confirmRefCommit = useRef<HTMLDialogElement>(null);

  // Guard bad id
  useEffect(() => {
    if (Number.isNaN(id) || id <= 0) {
      setMsg("Invalid batch id");
    }
  }, [id]);

  // Load preview with abort safety
  async function load() {
    const ctrl = new AbortController();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/preview?stagingId=${id}`, {
        cache: "no-store",
        signal: ctrl.signal,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load preview");
      setData(json);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg !== "AbortError") setMsg(msg || "Failed to load preview");
    } finally {
      setLoading(false);
    }
    return () => ctrl.abort();
  }

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const issues = data?.preview.issues || {};
  const missingUnit = Number(issues["missing_unit_code"] ?? 0);
  const missingAct = Number(issues["missing_activity_name"] ?? 0);
  const missingDate = Number(issues["missing_date"] ?? 0);
  const missingTimes = Number(issues["missing_times"] ?? 0);
  const hasBlocking = missingUnit + missingAct + missingDate > 0;

  const totalRows = data?.preview.raw?.length ?? 0;
  const totalSlots = data?.preview.timetable?.length ?? 0;

  // Filter + sort timetable client-side
  function cmp(
    a: string | number | null | undefined,
    b: string | number | null | undefined,
  ): number {
    if (a === b) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    return a > b ? 1 : -1;
  }

  const filteredTimetable = useMemo<TimetableRow[]>(() => {
    if (!data) return [];
    const q = filter.trim().toLowerCase();
    let rows = data.preview.timetable;

    if (q) {
      rows = rows.filter(
        (r) =>
          r.activity_name.toLowerCase().includes(q) ||
          (r.activity_type || "").toLowerCase().includes(q) ||
          (r.activity_description || "").toLowerCase().includes(q) ||
          (r.staff_name || "").toLowerCase().includes(q) ||
          (r.staff_id || "").toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q),
      );
    }

    if (sortKey) {
      const key = sortKey as keyof TimetableRow;
      rows = [...rows].sort(
        (a, b) =>
          cmp(
            a[key] as string | number | null | undefined,
            b[key] as string | number | null | undefined,
          ) * (sortAsc ? 1 : -1),
      );
    }
    return rows;
  }, [data, filter, sortKey, sortAsc]);

  function toggleSort(key: keyof TimetableRow) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  async function onCommit() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stagingId: id }),
      });

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        // If we were bounced to login, payload will be HTML
        if (typeof payload === "string" && payload.includes("<!DOCTYPE")) {
          throw new Error(
            "Request was redirected or failed (HTML response). Are you logged in?",
          );
        }
        throw new Error(payload?.error || "Commit failed");
      }

      // success
      setMsg(`✅ Committed. Inserted → ${JSON.stringify(payload.inserted)}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMsg(`❌ ${msg || "Commit failed"}`);
    } finally {
      setBusy(false);
    }
  }

  async function onDiscard() {
    setBusy(true);
    setMsg("");
    console.log("Discard request payload:", { stagingId: id });
    try {
      const res = await fetch(`/api/admin/discard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stagingId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Discard failed");
      setMsg("🗑️ Discarded.");
      router.push("/admin/import");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMsg(`❌ ${msg || "Commit failed"}`);
    } finally {
      setBusy(false);
    }
  }

  function copyId() {
    navigator.clipboard.writeText(String(id)).then(
      () => setMsg("Copied batch id"),
      () => setMsg("Failed to copy batch id"),
    );
  }

  return (
    <main className="p-6 md:p-8 space-y-6">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-semibold">
              Preview Import — Batch #{id}
            </h1>
            <button
              onClick={copyId}
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              title="Copy batch id"
            >
              Copy
            </button>
            <div className="hidden md:flex items-center gap-2">
              <Pill tone={hasBlocking ? "bad" : "good"}>
                {hasBlocking ? "Blocking issues" : "No blocking issues"}
              </Pill>
              <Pill tone="info">{totalRows} raw rows</Pill>
              <Pill tone="neutral">{totalSlots} timetable slots</Pill>
            </div>
          </div>

          {/* Actions (added Import New) */}
          <div className="flex items-center gap-2">
            <Button
              tone="neutral"
              onClick={() => router.push("/admin/import")}
              disabled={busy}
              title="Start a fresh import"
            >
              Import New
            </Button>
            <Button tone="neutral" onClick={load} disabled={busy || loading}>
              Reload
            </Button>
            <Button
              tone="danger"
              onClick={() => confirmRefDiscard.current?.showModal()}
              disabled={busy}
            >
              Discard
            </Button>
            <Button
              tone="primary"
              onClick={() => confirmRefCommit.current?.showModal()}
              disabled={busy || hasBlocking}
              title={hasBlocking ? "Fix blocking issues before commit" : ""}
            >
              Commit
            </Button>
          </div>
        </div>
      </div>

      {/* Status / messages */}
      {msg && (
        <div className="text-sm rounded-md border p-3 bg-gray-50">{msg}</div>
      )}

      {/* Validation panel */}
      <section className="border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Validation</h2>
          <div className="flex gap-2">
            <Pill tone={missingUnit ? "bad" : "good"}>
              missing_unit_code: {missingUnit}
            </Pill>
            <Pill tone={missingAct ? "bad" : "good"}>
              missing_activity_name: {missingAct}
            </Pill>
            <Pill tone={missingDate ? "bad" : "good"}>
              missing_date: {missingDate}
            </Pill>
            <Pill tone={missingTimes ? "warn" : "good"}>
              missing_times: {missingTimes}
            </Pill>
          </div>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded max-h-52 overflow-auto">
          {JSON.stringify(issues, null, 2)}
        </pre>
      </section>

      {/* Timetable */}
      <section className="border rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-medium">Timetable</h2>
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Filter by activity / staff / date…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                {[
                  ["date", "Date"],
                  ["start_time", "Start"],
                  ["end_time", "End"],
                  ["activity_name", "Activity"],
                  ["activity_type", "Type"],
                  ["staff", "Staff"],
                  ["row_count", "Rows"],
                  ["total_hours", "Hours"],
                ].map(([key, label]) => {
                  const k =
                    key === "staff" ? "" : (key as keyof TimetableRow | "");
                  const active = k && sortKey === k;
                  return (
                    <th
                      key={key}
                      className={`py-2 pr-4 font-medium ${
                        k ? "cursor-pointer select-none" : ""
                      }`}
                      onClick={k ? () => toggleSort(k) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {active && (
                          <span className="text-xs">{sortAsc ? "▲" : "▼"}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}
              {!loading &&
                filteredTimetable.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 pr-4">{r.date}</td>
                    <td className="py-2 pr-4">{r.start_time}</td>
                    <td className="py-2 pr-4">{r.end_time}</td>
                    <td className="py-2 pr-4">{r.activity_name}</td>
                    <td className="py-2 pr-4">{r.activity_type}</td>
                    <td className="py-2 pr-4">
                      {r.staff_name || r.staff_id || "—"}
                    </td>
                    <td className="py-2 pr-4">{r.row_count}</td>
                    <td className="py-2 pr-4">{r.total_hours ?? "—"}</td>
                  </tr>
                ))}
              {!loading && filteredTimetable.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={8}>
                    No rows match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Raw sample (collapsible) */}
      <section className="border rounded-xl">
        <button
          className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50"
          onClick={() => setRawOpen((v) => !v)}
        >
          <span className="font-medium">Raw Sample (first 100 rows)</span>
          <span className="text-sm">{rawOpen ? "Hide ▲" : "Show ▼"}</span>
        </button>
        {rawOpen && (
          <div className="p-4 pt-0">
            {loading ? (
              <div className="p-3 text-sm text-gray-500">Loading…</div>
            ) : (
              <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-3 rounded">
                {JSON.stringify(data?.preview.raw ?? [], null, 2)}
              </pre>
            )}
          </div>
        )}
      </section>

      {/* Confirm dialogs */}
      <dialog ref={confirmRefDiscard} className="rounded-xl p-0">
        <div className="p-5 w-80">
          <h3 className="font-semibold mb-2">Discard this batch?</h3>
          <p className="text-sm text-gray-600 mb-4">
            This will remove all staged rows for batch #{id}. This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              tone="neutral"
              onClick={() => confirmRefDiscard.current?.close()}
            >
              Cancel
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                confirmRefDiscard.current?.close();
                onDiscard();
              }}
              disabled={busy}
            >
              Discard
            </Button>
          </div>
        </div>
      </dialog>

      <dialog ref={confirmRefCommit} className="rounded-xl p-0">
        <div className="p-5 w-80">
          <h3 className="font-semibold mb-2">Commit this batch?</h3>
          <p className="text-sm text-gray-600 mb-4">
            We’ll run the ETL and upsert data into normalized tables. Make sure
            validation looks good.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              tone="neutral"
              onClick={() => confirmRefCommit.current?.close()}
            >
              Cancel
            </Button>
            <Button
              tone="primary"
              onClick={() => {
                confirmRefCommit.current?.close();
                onCommit();
              }}
              disabled={busy || hasBlocking}
              title={hasBlocking ? "Fix blocking issues before commit" : ""}
            >
              Commit
            </Button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
