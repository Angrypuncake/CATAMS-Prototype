"use client";
import React from "react";
import { AllocationRow } from "../types";
import { toDisplayTime, toInputDate, labelName } from "../util";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface AllocationsTableProps {
  tab: "scheduled" | "unscheduled";
  loading: boolean;
  visible: AllocationRow[];
  page: number;
  limit: number;
  total: number;
  onEdit: (row: AllocationRow) => void;
  onPageChange: (newPage: number) => void;
  sort: string;
  sortDir: "asc" | "desc";
  onSort: (column: string) => void;
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
  sort,
  sortDir,
  onSort,
}: AllocationsTableProps) {
  // Helper to render sortable header
  const SortableHeader = ({
    column,
    label,
    className = "",
  }: {
    column: string;
    label: string;
    className?: string;
  }) => (
    <th
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 select-none ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sort === column && (
          <span className="text-xs">
            {sortDir === "asc" ? (
              <ArrowUpwardIcon sx={{ fontSize: "0.9rem" }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: "0.9rem" }} />
            )}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div>
      {/* Table */}
      <div className="overflow-auto border rounded">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-50">
            {tab === "scheduled" ? (
              <tr className="text-left">
                <SortableHeader
                  column="so.session_date"
                  label="Date*"
                  className="w-[140px]"
                />
                <SortableHeader
                  column="so.start_at"
                  label="Start*"
                  className="w-[110px]"
                />
                <SortableHeader column="cu.unit_code" label="Unit" />
                <SortableHeader column="ta.activity_type" label="Activity" />
                <SortableHeader column="u.last_name" label="Tutor" />
                <SortableHeader column="a.paycode_id" label="Paycode" />
                <SortableHeader column="a.status" label="Status" />
                <SortableHeader column="so.location" label="Location" />
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2 w-[80px]">Edit</th>
              </tr>
            ) : (
              <tr className="text-left">
                <SortableHeader
                  column="a.hours"
                  label="Allocated Hours*"
                  className="w-[180px]"
                />
                <SortableHeader column="cu.unit_code" label="Unit" />
                <SortableHeader column="ta.activity_type" label="Activity" />
                <SortableHeader column="u.last_name" label="Tutor" />
                <SortableHeader column="a.paycode_id" label="Paycode" />
                <SortableHeader column="a.status" label="Status" />
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
