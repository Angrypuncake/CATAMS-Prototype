"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Box,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Tooltip,
  Stack,
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

export default function UnscheduledAllocationsTable() {
  const [allocations, setAllocations] = useState<UCUnscheduledAllocation[]>([]);
  const [activityType, setActivityType] = useState<"Marking" | "Consultation">(
    "Marking",
  );
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

  useEffect(() => {
    fetchData();
  }, [activityType]);

  const handleTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: string | null,
  ) => {
    if (newType) setActivityType(newType as "Marking" | "Consultation");
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" fontWeight={600}>
          {activityType} Hours
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            exclusive
            value={activityType}
            onChange={handleTypeChange}
            size="small"
          >
            <ToggleButton value="Marking">Marking</ToggleButton>
            <ToggleButton value="Consultation">Consultation</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Refresh data">
            <Button variant="outlined" size="small" onClick={fetchData}>
              Refresh
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography>
            Loading {activityType.toLowerCase()} allocations…
          </Typography>
        </Box>
      ) : allocations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No {activityType.toLowerCase()} hours allocated across your units.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
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
                <TableRow key={a.allocation_id}>
                  <TableCell>{a.unitCode}</TableCell>
                  <TableCell>{a.unitName}</TableCell>
                  <TableCell>
                    {a.first_name} {a.last_name}
                  </TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell align="center">{a.hours}</TableCell>
                  <TableCell>{a.note || "—"}</TableCell>
                  <TableCell>{a.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
