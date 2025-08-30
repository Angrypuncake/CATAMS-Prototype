"use client";

import React, { useCallback, useState } from "react";

const ENDPOINT = process.env.NEXT_PUBLIC_IMPORT_URL || "/api/admin/import"; // override if needed

export default function UploadTestPage() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  const [log, setLog] = useState<string>("");

  const allowed = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const allowedExt = [".csv", ".xlsx"];

  function isAllowed(f: File) {
    const name = f.name.toLowerCase();
    const okExt = allowedExt.some((ext) => name.endsWith(ext));
    const okType = allowed.includes(f.type); // some browsers report empty type; extension check helps
    return okExt || okType;
  }

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!isAllowed(f)) {
      setFile(null);
      setLog(
        `❌ Unsupported file: ${f.name}\nAllowed: ${allowedExt.join(", ")}`,
      );
      setStatus("error");
      return;
    }
    setFile(f);
    setLog(`✅ Ready to upload: ${f.name} (${f.size.toLocaleString()} bytes)`);
    setStatus("idle");
  }, []);

  async function upload() {
    if (!file) return;
    setStatus("uploading");
    setLog((prev) => `${prev}\n↗️ Uploading to ${ENDPOINT} ...`);

    try {
      const form = new FormData();
      form.append("file", file, file.name);

      const res = await fetch(ENDPOINT, { method: "POST", body: form });

      const contentType = res.headers.get("content-type") || "";
      const body = contentType.includes("application/json")
        ? JSON.stringify(await res.json(), null, 2)
        : await res.text();

      if (!res.ok) {
        setStatus("error");
        setLog((prev) => `${prev}\n❌ Server ${res.status}: ${body}`);
        return;
      }

      setStatus("done");
      setLog((prev) => `${prev}\n✅ Done (${res.status}). Response:\n${body}`);
    } catch (e: unknown) {
      setStatus("error");
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : JSON.stringify(e);
      setLog((prev) => `${prev}\n💥 Error: ${msg}`);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Upload Test (CSV/XLSX)</h1>
      <p className="text-sm text-gray-500 mt-1">
        Posts as <code>multipart/form-data</code> to <code>{ENDPOINT}</code>
      </p>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={[
          "mt-6 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
          dragOver ? "border-indigo-500 bg-indigo-50/50" : "border-gray-300",
        ].join(" ")}
      >
        <p className="text-lg font-medium">
          Drag & drop your <span className="font-semibold">.csv</span> or{" "}
          <span className="font-semibold">.xlsx</span> here
        </p>
        <p className="text-sm text-gray-500 mt-1">or</p>

        {/* Hidden file input + button */}
        <label className="mt-4 inline-block cursor-pointer rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
          Choose a file
          <input
            type="file"
            accept=".csv, .xlsx, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {/* Selected file */}
        {file && (
          <div className="mt-4 text-sm">
            <div className="font-medium">Selected:</div>
            <div className="text-gray-700">{file.name}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={upload}
          disabled={!file || status === "uploading"}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
        <button
          onClick={() => {
            setFile(null);
            setLog("");
            setStatus("idle");
          }}
          className="rounded-xl border px-4 py-2"
        >
          Reset
        </button>
      </div>

      {/* Log */}
      <pre className="mt-6 whitespace-pre-wrap rounded-xl border p-4 text-sm">
        {log || "Logs will appear here…"}
      </pre>
    </main>
  );
}
