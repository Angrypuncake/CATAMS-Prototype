// components/PaycodeCombo.tsx
"use client";
import React, { useMemo, useState } from "react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { PaycodeOption } from "@/app/admin/allocations/types";

interface PaycodeComboProps {
  options: PaycodeOption[];
  valueCode: string | null;
  onChange: (opt: PaycodeOption | null) => void;
}

export function PaycodeCombo({ options, valueCode, onChange }: PaycodeComboProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick(boxRef, () => setOpen(false));

  const selected = options.find((p) => p.code === valueCode) || null;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return options.slice(0, 100);
    return options
      .filter(
        (p) =>
          p.code.toLowerCase().includes(ql) ||
          (p.paycode_description ?? "").toLowerCase().includes(ql)
      )
      .slice(0, 100);
  }, [q, options]);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border rounded px-3 py-2 text-left"
      >
        {selected
          ? `${selected.code}` +
            (selected.paycode_description ? ` — ${selected.paycode_description}` : "")
          : "Select paycode…"}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded px-2 py-1"
              placeholder="Search code or description…"
            />
          </div>
          <ul className="max-h-72 overflow-auto">
            {filtered.map((p) => (
              <li key={p.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  <div className="font-medium">{p.code}</div>
                  {(p.paycode_description || p.amount) && (
                    <div className="text-xs text-gray-500">
                      {p.paycode_description ?? ""} {p.amount ? `• $${p.amount}` : ""}
                    </div>
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
