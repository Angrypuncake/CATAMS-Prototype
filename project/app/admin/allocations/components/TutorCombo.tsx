// components/TutorCombo.tsx
"use client";
import React, { useMemo, useState } from "react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { Tutor } from "@/app/_types/tutor";

interface TutorComboProps {
  options: Tutor[];
  valueId: number | null;
  onChange: (opt: Tutor | null) => void;
}

export function TutorCombo({ options, valueId, onChange }: TutorComboProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  useOutsideClick(boxRef, () => setOpen(false));

  const selected = useMemo(
    () => options.find((t) => t.user_id === valueId) || null,
    [options, valueId],
  );

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return options.slice(0, 50);
    return options
      .filter((t) => {
        const name = `${t.first_name ?? ""} ${t.last_name ?? ""}`.toLowerCase();
        return name.includes(ql) || (t.email ?? "").toLowerCase().includes(ql);
      })
      .slice(0, 50);
  }, [q, options]);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border rounded px-3 py-2 text-left"
      >
        {selected
          ? `${selected.first_name ?? ""} ${selected.last_name ?? ""}`.trim() +
            (selected.email ? ` (${selected.email})` : "")
          : "Select tutor…"}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded px-2 py-1"
              placeholder="Search name or email…"
            />
          </div>
          <ul className="max-h-72 overflow-auto">
            {filtered.map((t) => (
              <li key={t.user_id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  <div className="font-medium">
                    {(t.first_name ?? "") + " " + (t.last_name ?? "")}
                  </div>
                  {t.email && (
                    <div className="text-xs text-gray-500">{t.email}</div>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
