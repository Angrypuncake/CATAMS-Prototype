"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  offeringId: number;
  unitCode: string;
  unitName: string;
  year: number;
  session: string;
  budget: number;
  spent: number;
  pctUsed: number; // 0..1 from API
  variance: number;
};

type ApiResp = {
  year: number;
  session: string;
  threshold: number; // 0..1
  rows: Row[];
  alerts?: {
    message: string;
    offeringId: number;
    unitCode: string;
    pctUsed: number;
  }[];
};

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const PCT = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function UCTestPage() {
  const [data, setData] = useState<ApiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [threshold, setThreshold] = useState(0.9);

  async function load() {
    try {
      setBusy(true);
      setError(null);
      const res = await fetch(
        `/api/uc/overview?year=2025&session=S2&threshold=${threshold}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResp = await res.json();
      setData(json);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Failed to load");
      } else {
        setError("Failed to load");
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load(); /* initial */
  }, []);

  // Recompute status/alerts client-side so slider is live without refetching
  const computed = useMemo(() => {
    if (!data) return null;
    const rows = data.rows.map((r) => ({
      ...r,
      status: r.pctUsed >= threshold ? "Open" : "Healthy",
    }));
    const alerts = rows
      .filter((r) => r.pctUsed >= threshold)
      .map((r) => ({
        message: `${r.unitCode} is at ${Math.round(r.pctUsed * 100)}% budget used.`,
        unitCode: r.unitCode,
      }));
    return { rows, alerts };
  }, [data, threshold]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Unit Coordinator Dashboard (Test)
        </h1>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={busy}
            className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            {busy ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
          Error: {error}
        </div>
      )}

      {/* Alerts */}
      {computed && computed.alerts.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {computed.alerts.map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800"
            >
              {a.message}
            </span>
          ))}
        </div>
      )}

      {/* Controls */}
      <section className="flex items-center gap-4">
        <label className="text-sm text-gray-600">Open threshold</label>
        <input
          type="range"
          min={0.5}
          max={1}
          step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-64"
        />
        <span className="font-medium">{Math.round(threshold * 100)}%</span>
        <button
          onClick={load}
          className="ml-3 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </section>

      {/* Table */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Budget Overview</h2>
        {!data ? (
          <p>Loading…</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Unit</th>
                  <th className="px-4 py-2 text-left">Year</th>
                  <th className="px-4 py-2 text-left">Session</th>
                  <th className="px-4 py-2 text-right">Budget</th>
                  <th className="px-4 py-2 text-right">Spent</th>
                  <th className="px-4 py-2 text-right">% Used</th>
                  <th className="px-4 py-2 text-right">Forecast (Wk)</th>
                  <th className="px-4 py-2 text-right">Variance</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {computed?.rows.map((r) => (
                  <tr key={r.offeringId} className="border-t">
                    <td className="px-4 py-2 font-medium">{r.unitCode}</td>
                    <td className="px-4 py-2">{r.year}</td>
                    <td className="px-4 py-2">{r.session}</td>
                    <td className="px-4 py-2 text-right">
                      {AUD.format(r.budget)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {AUD.format(r.spent)}
                    </td>
                    <td className="px-4 py-2 text-right">{PCT(r.pctUsed)}</td>
                    <td className="px-4 py-2 text-right">—</td>
                    <td className="px-4 py-2 text-right">
                      {AUD.format(r.variance)}
                      {/* negative shows as -A$X */}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                          (r.status === "Open"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800")
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {computed?.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No offerings for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
