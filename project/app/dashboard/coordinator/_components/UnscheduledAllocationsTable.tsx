"use client";

import React, { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup, Button,
  Tooltip, Stack, Chip, Link as MUILink,
} from "@mui/material";
import {
  getAllUnscheduledAllocationsForUC,
  UnscheduledAllocation,
} from "@/app/services/allocationService";

interface UCUnscheduledAllocation extends UnscheduledAllocation {
  offeringId: number;
  unitCode: string;
  unitName: string;
  year: number;
  session: string;
}

const blackOutlined = {
  borderColor: "#000",
  color: "#000",
  borderRadius: 9999,
  px: 2,
  "&:hover": { backgroundColor: "#000", color: "#fff", borderColor: "#111" },
};

export default function UnscheduledAllocationsTable() {
  const [allocations, setAllocations] = useState<UCUnscheduledAllocation[]>([]);
  const [activityType, setActivityType] = useState<"Marking" | "Consultation">("Marking");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllUnscheduledAllocationsForUC(activityType);
      setAllocations(data);
    } catch (err) {
      console.error("Failed to fetch UC unscheduled allocations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activityType]); // eslint-disable-line

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>{activityType} Hours</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup exclusive value={activityType} onChange={(_, v) => v && setActivityType(v)} size="small">
            <ToggleButton value="Marking">Marking</ToggleButton>
            <ToggleButton value="Consultation">Consultation</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Refresh data">
            <Button variant="outlined" size="small" onClick={fetchData} sx={blackOutlined}>Refresh</Button>
          </Tooltip>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading {activityType.toLowerCase()} allocations…</Typography>
        </Box>
      ) : allocations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No {activityType.toLowerCase()} hours allocated across your units.
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            border: "1px solid #000",
            overflow: "hidden",
            boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, backgroundColor: "grey.100", borderColor: "#000" } }}>
                <TableCell>Unit Code</TableCell>
                <TableCell>Unit Name</TableCell>
                <TableCell>Tutor</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Hours</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allocations.map((a) => (
                <TableRow key={a.allocation_id} hover sx={{ "& td": { borderColor: "#000" } }}>
                  <TableCell>{a.unitCode}</TableCell>
                  <TableCell>{a.unitName}</TableCell>
                  <TableCell>{a.first_name} {a.last_name}</TableCell>
                  <TableCell>
                    <MUILink href={`mailto:${a.email}`} underline="hover">{a.email}</MUILink>
                  </TableCell>
                  <TableCell align="center">{a.hours}</TableCell>
                  <TableCell>{a.note || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={a.status}
                      sx={{ borderColor: "#000", color: "#000" }}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
