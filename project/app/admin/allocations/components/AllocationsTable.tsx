"use client";
import React from "react";
import { AllocationRow } from "../types";
import { toDisplayTime, toInputDate, labelName } from "../util";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface AllocationsTableProps {
  tab: "scheduled" | "unscheduled";
  loading: boolean;
  visible: AllocationRow[];
  page: number;
  limit: number;
  total: number;
  onEdit: (row: AllocationRow) => void;
  onPageChange: (newPage: number) => void;
}

export function AllocationsTable({
  tab,
  loading,
  visible,
  page,
  limit,
  total,
  onEdit,
  onPageChange,
}: AllocationsTableProps) {
  return (
    <div>
      {/* Table */}
      <div className="overflow-auto border rounded">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-50">
            {tab === "scheduled" ? (
              <tr className="text-left">
                <th className="px-3 py-2 w-[140px]">Date*</th>
                <th className="px-3 py-2 w-[110px]">Start*</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Activity</th>
                <th className="px-3 py-2">Tutor</th>
                <th className="px-3 py-2">Paycode</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2 w-[80px]">Edit</th>
              </tr>
            ) : (
              <tr className="text-left">
                <th className="px-3 py-2 w-[180px]">Allocated Hours*</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Activity</th>
                <th className="px-3 py-2">Tutor</th>
                <th className="px-3 py-2">Paycode</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2 w-[80px]">Edit</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                  No rows
                </td>
              </tr>
            )}
            {!loading &&
              visible.map((r) => (
                <tr key={r.id} className="border-t">
                  {tab === "scheduled" ? (
                    <>
                      <td className="px-3 py-2">
                        {toInputDate(r.session_date) || "—"}
                      </td>
                      <td className="px-3 py-2">
                        {toDisplayTime(r.start_at) || "—"}
                        {r.end_at && (
                          <div className="text-xs text-gray-500">
                            End: {r.end_at?.slice(0, 8)}
                          </div>
                        )}
                      </td>
                    </>
                  ) : (
                    <td className="px-3 py-2">{r.hours ?? "—"}</td>
                  )}
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.unit_code ?? "—"}</div>
                    <div className="text-xs text-gray-500">
                      {r.unit_name ?? ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.activity_type ?? "—"}</div>
                    <div className="text-xs text-gray-500">
                      {r.activity_name ?? ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{labelName(r)}</div>
                    <div className="text-xs text-gray-500">{r.email ?? ""}</div>
                  </td>
                  <td className="px-3 py-2">{r.paycode_id ?? "—"}</td>
                  <td className="px-3 py-2">{r.status ?? "—"}</td>
                  {tab === "scheduled" && (
                    <td className="px-3 py-2">{r.location ?? "—"}</td>
                  )}
                  <td className="px-3 py-2 truncate max-w-[360px]">
                    {r.note ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => onEdit(r)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="outlined"
          size="small"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          PREV
        </Button>

        <div className="text-sm text-gray-600">
          Page {page} of {Math.max(1, Math.ceil(total / limit))}
        </div>

        <Button
          variant="outlined"
          size="small"
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => onPageChange(page + 1)}
        >
          NEXT
        </Button>
      </div>
    </div>
  );
}
