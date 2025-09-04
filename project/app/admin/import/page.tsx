"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const [log, setLog] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const router = useRouter();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      setLog(JSON.stringify(json, null, 2));
      if (!res.ok) throw new Error(json?.error || "Import failed");
      router.push(`/admin/import/${json.stagingId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setLog(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Import Allocations</h1>

        {/* Plain button that goes to localhost history */}
        <a
          href="http://localhost:3000/admin/import/history"
          className="inline-flex items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 active:bg-zinc-100"
        >
          View Import History
        </a>
      </div>

      {/* Uploader card */}
      <section className="rounded-xl border border-zinc-200 bg-white/50 shadow-sm">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-medium">Select a file to import</h2>
          <p className="mt-1 text-sm text-zinc-500">Accepted: .csv, .xlsx</p>
        </div>

        <div className="px-5 py-5 space-y-4">
          <label className="block">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={onFileChange}
              disabled={busy}
              className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0
                         file:bg-blue-600 file:px-4 file:py-2 file:font-medium file:text-white
                         hover:file:bg-blue-700 disabled:opacity-50"
            />
          </label>

          {/* Status Row */}
          <div className="flex items-center justify-between">
            <div className="min-h-[1.5rem] text-sm text-zinc-600">
              {fileName ? <span className="font-medium">Selected:</span> : null}{" "}
              {fileName}
            </div>
            {busy && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                Uploading…
              </div>
            )}
          </div>

          {/* Log area */}
          <div className="rounded-lg bg-zinc-900 p-4">
            <pre className="h-64 overflow-auto text-xs leading-relaxed text-green-300">
              {log || "Upload a file to see logs here..."}
            </pre>
          </div>

          {/* Utility row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!log}
              onClick={() => navigator.clipboard.writeText(log)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
            >
              Copy Log
            </button>
            <button
              type="button"
              onClick={() => {
                setLog("");
                setFileName("");
              }}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Clear
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
