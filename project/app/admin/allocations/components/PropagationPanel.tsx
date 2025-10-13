// components/admin/PropagationPanel.tsx
"use client";
import React from "react";
import { getActivityOccurrences } from "@/app/services/activityService";
import {
  OccurrenceRow,
  PropagationPayload,
} from "@/app/admin/allocations/types";
import { Dow } from "@/app/_types/allocations";

export function PropagationPanel({
  activityId,
  disabled,
  derivedDow,
  onChange,
}: {
  activityId: number;
  disabled?: boolean;
  derivedDow: Dow | "";
  onChange: (p: PropagationPayload) => void;
}) {
  const [weeks, setWeeks] = React.useState<OccurrenceRow[]>([]);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [fields, setFields] = React.useState<PropagationPayload["fields"]>([]);
  const [notesMode, setNotesMode] = React.useState<"overwrite" | "append">(
    "overwrite",
  );
  const [moveDow, setMoveDow] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!activityId) {
      setWeeks([]);
      setSelected(new Set());
      return;
    }
    (async () => {
      try {
        const occurrences = await getActivityOccurrences(activityId);
        setWeeks(occurrences);
        setSelected(new Set());
      } catch (e) {
        console.error(e);
        setWeeks([]);
        setSelected(new Set());
      }
    })();
  }, [activityId]);

  // Lift state up
  React.useEffect(() => {
    onChange({
      fields,
      notesMode: fields.includes("note") ? notesMode : undefined,
      dow: moveDow && derivedDow ? derivedDow : undefined, // <-- only when checked
      occurrenceIds: Array.from(selected),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, notesMode, derivedDow, selected]);

  const toggleAll = (check: boolean) => {
    if (check) setSelected(new Set(weeks.map((w) => w.occurrence_id)));
    else setSelected(new Set());
  };

  const toggleOne = (id: number, check: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (check) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleField = (name: PropagationPayload["fields"][number]) => {
    setFields((prev) => {
      const has = prev.includes(name);
      if (has) return prev.filter((f) => f !== name);
      return [...prev, name];
    });
  };

  const isDisabled = !!disabled;

  return (
    <fieldset className={isDisabled ? "opacity-60 pointer-events-none" : ""}>
      <legend className="block text-base font-semibold mb-1">
        Propagate across existing sessions
      </legend>
      <p className="text-xs text-gray-500 mb-3">
        Tick weeks below to apply changes. Leave all unticked for “this session
        only”.
      </p>

      <div className="grid grid-cols-5 gap-3">
        {/* DoW section */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Day of Week (derived)
          </label>

          {/* NEW: checkbox to include/exclude DOW propagation */}
          <label className="inline-flex items-center gap-2 mb-1 text-sm">
            <input
              type="checkbox"
              checked={moveDow}
              onChange={(e) => setMoveDow(e.target.checked)}
              disabled={!derivedDow} // if no date selected yet
            />
            Move to this weekday
          </label>

          <input
            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700"
            value={derivedDow || "—"}
            readOnly
            aria-readonly="true"
            title="Derived from Date (this session)"
          />
          <div className="text-xs text-gray-500 mt-1">
            Propagation uses the weekday derived from “Date (this session)”.
            Change the date above to update this value.
          </div>
        </div>

        {/* Fields to propagate */}
        <div className="col-span-3">
          <div className="text-sm font-medium mb-1">Fields to propagate</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("tutor")}
                onChange={() => toggleField("tutor")}
              />
              Tutor
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("paycode")}
                onChange={() => toggleField("paycode")}
              />
              Paycode
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("start")}
                onChange={() => toggleField("start")}
              />
              Start
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("end")}
                onChange={() => toggleField("end")}
              />
              End
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("note")}
                onChange={() => toggleField("note")}
              />
              Notes
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("status")}
                onChange={() => toggleField("status" as const)}
              />
              Status
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("location")}
                onChange={() => toggleField("location" as const)}
              />
              Location
            </label>

            {/* Notes mode */}
            {fields.includes("note") && (
              <div className="flex items-center gap-3 text-xs">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="note-mode"
                    checked={notesMode === "overwrite"}
                    onChange={() => setNotesMode("overwrite")}
                  />
                  overwrite
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="note-mode"
                    checked={notesMode === "append"}
                    onChange={() => setNotesMode("append")}
                  />
                  append
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weeks table */}
      <div className="mt-4 border rounded">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t">
          <div className="font-medium">Choose existing weeks</div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1 border rounded"
              onClick={() => toggleAll(true)}
            >
              Select All
            </button>
            <button
              type="button"
              className="px-3 py-1 border rounded"
              onClick={() => toggleAll(false)}
            >
              Clear All
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2 w-[48px]"></th>
              <th className="px-3 py-2 w-[120px]">Week</th>
              <th className="px-3 py-2 w-[160px]">Date</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, idx) => {
              const checked = selected.has(w.occurrence_id);
              return (
                <tr key={w.occurrence_id} className="border-t">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        toggleOne(w.occurrence_id, e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-3 py-2">Week {idx + 1}</td>
                  <td className="px-3 py-2">{w.session_date}</td>
                  <td className="px-3 py-2">
                    {w.status ? (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 border">
                        {w.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">existing</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {weeks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  No existing weeks found for this activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="px-3 py-2 text-xs text-gray-500 border-t rounded-b">
          Tip: leaving all weeks unticked means “this session only”.
        </div>
      </div>

      {/* Tiny summary */}
      <div className="mt-3 text-xs text-gray-600">
        {selected.size > 0
          ? `Will apply to ${selected.size} occurrence(s).`
          : `No occurrences selected — this session only.`}
      </div>
    </fieldset>
  );
}
