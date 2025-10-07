"use client";
import React from "react";

interface FilterControlsProps {
  q: string;
  unitCode: string;
  activityType: string;
  status: string;
  limit: number;
  onQChange: (val: string) => void;
  onUnitCodeChange: (val: string) => void;
  onActivityTypeChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onLimitChange: (val: number) => void;
  onApply: () => void;
}

export function FilterControls({
  q,
  unitCode,
  activityType,
  status,
  limit,
  onQChange,
  onUnitCodeChange,
  onActivityTypeChange,
  onStatusChange,
  onLimitChange,
  onApply,
}: FilterControlsProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[220px]">
        <label className="block text-sm text-gray-600 mb-1">Search</label>
        <input
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="Search tutor, unit, or activity…"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="min-w-[180px]">
        <label className="block text-sm text-gray-600 mb-1">Unit Code</label>
        <input
          value={unitCode}
          onChange={(e) => onUnitCodeChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="min-w-[200px]">
        <label className="block text-sm text-gray-600 mb-1">
          Activity Type
        </label>
        <input
          value={activityType}
          onChange={(e) => onActivityTypeChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="min-w-[200px]">
        <label className="block text-sm text-gray-600 mb-1">Status</label>
        <input
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="w-[100px]">
        <label className="block text-sm text-gray-600 mb-1">Limit</label>
        <input
          type="number"
          min={1}
          max={200}
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value || "25", 10))}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={onApply}
        className="h-[38px] px-4 rounded bg-blue-600 text-white self-end"
      >
        APPLY
      </button>
    </div>
  );
}
