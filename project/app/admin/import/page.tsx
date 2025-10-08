"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { importAdminData } from "@/app/services/allocationService";

/**
 * Admin > Import Allocations
 * - Drag & drop + click-to-browse
 * - Client-side validation (type, size)
 * - Busy / progress states
 * - Copy / Clear log
 * - Advanced options (headers toggle, delimiter)
 * - Template & History links
 * - Accessible (keyboard & ARIA)
 */
export default function ImportPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [log, setLog] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Advanced opts that your API can read from FormData
  const [hasHeaders, setHasHeaders] = useState<boolean>(true);
  const [delimiter, setDelimiter] = useState<string>(",");

  // simple progress stages to give the user feedback
  const [stage, setStage] = useState<
    | "idle"
    | "reading"
    | "uploading"
    | "validating"
    | "staging"
    | "redirect"
    | "error"
  >("idle");

  const accept = useMemo(() => [".csv", ".xlsx"], []);
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  const appendLog = useCallback((line: string) => {
    setLog((prev) => (prev ? `${prev}\n${line}` : line));
  }, []);

  const reset = useCallback(() => {
    setLog("");
    setFileName("");
    setBusy(false);
    setStage("idle");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  function validateFile(f: File): string | null {
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (!accept.includes(ext)) {
      return `Unsupported file type: ${ext}. Accepted: ${accept.join(", ")}`;
    }
    if (f.size > maxSizeBytes) {
      return `File is too large (${(f.size / (1024 * 1024)).toFixed(1)} MB). Max is ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB.`;
    }
    return null;
  }

  async function handleFiles(files?: FileList | null) {
    const f = files?.[0];
    if (!f) return;

    const err = validateFile(f);
    if (err) {
      setStage("error");
      appendLog(`[client] ${err}`);
      return;
    }

    setFileName(f.name);
    setBusy(true);
    setStage("reading");
    appendLog(
      `[client] Selected: ${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`,
    );

    try {
      setStage("uploading");
      appendLog("[client] Uploading to /api/admin/import …");

      const fd = new FormData();
      fd.append("file", f);
      fd.append("hasHeaders", String(hasHeaders));
      fd.append("delimiter", delimiter);

      const data = await importAdminData(fd);

      setStage("validating");
      appendLog("[server] Processing upload …");

      appendLog(JSON.stringify(data, null, 2));

      if (!("ok" in data) || !data.ok) {
        setStage("error");
        throw new Error(data?.error || "Import failed");
      }

      setStage("staging");
      appendLog("[server] Staging complete. Redirecting to review page …");

      setStage("redirect");
      router.push(`/admin/import/${data.stagingId}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setStage("error");
      appendLog(`[client] Error: ${message}`);
      setBusy(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    void handleFiles(e.target.files);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    void handleFiles(e.dataTransfer?.files);
  }

  return (
    <main className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumbs + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="text-sm text-zinc-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/admin" className="hover:underline">
                Admin
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li className="text-zinc-900 font-medium">Import</li>
          </ol>
        </nav>

        <div className="flex gap-2">
          <Link
            href="/admin/import/history"
            className="inline-flex items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 active:bg-zinc-100"
          >
            View History
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Import Allocations
        </h1>
        <p className="text-sm text-zinc-600">
          Upload a CSV/XLSX file to stage an import, review differences, and
          commit to production.
        </p>
      </header>

      {/* Upload card */}
      <section className="rounded-2xl border border-zinc-200 bg-white/60 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-medium">File Upload</h2>
          {busy ? (
            <div className="inline-flex items-center gap-2 text-sm text-blue-700">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              Processing…
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-3">
          {/* Dropzone */}
          <div className="md:col-span-2">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={onDrop}
              htmlFor="file-input"
              className={[
                "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-5 py-10 text-center transition",
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-zinc-300 hover:bg-zinc-50",
                busy && "pointer-events-none opacity-60",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="rounded-full p-3 ring-1 ring-zinc-200">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium text-zinc-900">Drag & drop</span>{" "}
                  your file here, or <span className="underline">browse</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Accepted: {accept.join(", ")} · Max 10MB
                </p>
                {fileName && (
                  <p className="text-xs text-zinc-600">
                    <span className="font-medium">Selected:</span> {fileName}
                  </p>
                )}
              </div>
              <input
                ref={inputRef}
                id="file-input"
                type="file"
                accept={accept.join(",")}
                onChange={onInputChange}
                disabled={busy}
                className="sr-only"
              />
            </label>

            {/* Log */}
            <div className="mt-4 rounded-lg bg-zinc-950 p-4">
              <pre
                className="h-64 overflow-auto text-xs leading-relaxed text-green-300"
                aria-live="polite"
              >
                {log || "Upload a file to see logs here…"}
              </pre>
            </div>

            {/* Utilities */}
            <div className="mt-3 flex items-center gap-3">
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
                onClick={reset}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Sidebar: options & help */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Options</h3>
              <div className="mt-3 space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300"
                    checked={hasHeaders}
                    onChange={(e) => setHasHeaders(e.target.checked)}
                    disabled={busy}
                  />
                  First row contains headers
                </label>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="delimiter" className="text-zinc-700">
                    Delimiter
                  </label>
                  <select
                    id="delimiter"
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    disabled={busy}
                    className="w-28 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm"
                  >
                    <option value=",">Comma</option>
                    <option value=";">Semicolon</option>
                    <option value="\t">Tab</option>
                    <option value="|">Pipe</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <h3 className="font-semibold">Heads‑up</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Ensure required columns exist (e.g., <code>unit_code</code>,{" "}
                  <code>date</code>, <code>start_at</code>, <code>end_at</code>
                  ).
                </li>
                <li>
                  Dates must be ISO (YYYY‑MM‑DD). Times are 24‑hour HH:MM:SS.
                </li>
                <li>
                  You’ll review a diff in the next step before committing.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
              <h3 className="font-semibold">Status</h3>
              <dl className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <dt>Stage</dt>
                  <dd className="font-mono">{stage}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Busy</dt>
                  <dd className="font-mono">{busy ? "yes" : "no"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>File</dt>
                  <dd className="truncate font-mono" title={fileName || "—"}>
                    {fileName || "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* Footer actions */}
        <div className="border-t border-zinc-200 px-5 py-4 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Problems importing? See{" "}
            <Link href="/docs/import" className="underline">
              docs
            </Link>
            .
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
            >
              Browse…
            </button>
            <button
              type="button"
              onClick={() =>
                inputRef.current?.files?.length
                  ? handleFiles(inputRef.current.files)
                  : inputRef.current?.click()
              }
              disabled={busy}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Uploading…" : fileName ? "Re-upload" : "Upload File"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
