"use client";
import { Box, Button, CircularProgress, Divider, Paper, Typography } from "@mui/material";
import type { AdminAllocationRow } from "@/app/_types/allocations";

interface EligibleAllocationsTableProps {
  eligibleAllocations: AdminAllocationRow[];
  selectedAllocation: AdminAllocationRow | null;
  onSelect: (allocation: AdminAllocationRow) => void;
  loading?: boolean;
  readOnly?: boolean;
  title?: string;
}

export default function EligibleAllocationsTable({
  eligibleAllocations,
  selectedAllocation,
  onSelect,
  loading = false,
  readOnly = false,
  title = "Eligible Allocations for Swap",
}: EligibleAllocationsTableProps) {
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th className="px-3 py-2 text-left font-semibold">Tutor</th>
                <th className="px-3 py-2 text-left font-semibold">Role</th>
                <th className="px-3 py-2 text-left font-semibold">Unit</th>
                <th className="px-3 py-2 text-left font-semibold">Activity</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Hours</th>
                <th className="px-3 py-2 text-left font-semibold">Location</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {eligibleAllocations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-3 text-center text-gray-500">
                    No eligible allocations found
                  </td>
                </tr>
              ) : (
                eligibleAllocations.map((a) => {
                  const selected = selectedAllocation?.id === a.id;
                  return (
                    <tr
                      key={a.id ?? `${a.user_id}-${a.session_date}`}
                      style={{
                        backgroundColor: selected ? "#e8f5e9" : "transparent",
                      }}
                    >
                      <td className="px-3 py-2">
                        {a.first_name} {a.last_name}
                      </td>
                      <td className="px-3 py-2">{a.teaching_role ?? "-"}</td>
                      <td className="px-3 py-2">{a.unit_code ?? "-"}</td>
                      <td className="px-3 py-2">{a.activity_name ?? "-"}</td>
                      <td className="px-3 py-2">{a.session_date ?? "-"}</td>
                      <td className="px-3 py-2">{a.hours ?? "-"}</td>
                      <td className="px-3 py-2">{a.location ?? "-"}</td>
                      <td className="px-3 py-2 text-right">
                        {!readOnly && (
                          <Button
                            size="small"
                            variant={selected ? "contained" : "outlined"}
                            color="primary"
                            onClick={() => onSelect(a)}
                          >
                            {selected ? "Selected" : "Select"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Paper>
      )}
    </>
  );
}
