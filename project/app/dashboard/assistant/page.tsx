"use client";

import React, { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import TeachingOperationsHeader from "./TeachingOperationsHeader";
import UCRequestsTable from "../coordinator/CoordinatorRequestTable";

import { getRequestsByUC } from "@/app/services/requestService";
import { getAllAllocationsForUC } from "@/app/services/allocationService";
import { UCApproval } from "@/app/_types/request";
import { AdminAllocationRow } from "@/app/_types/allocations";
import AllocationsTable from "./AllocationsTable";

const TeachingOperations: React.FC = () => {
  const [termValue, setTermValue] = useState("S2 2025");
  const [unitValue, setUnitValue] = useState("All");
  const [viewValue, setViewValue] = useState("All");

  const [requests, setRequests] = useState<UCApproval[]>([]);
  const [allocations, setAllocations] = useState<AdminAllocationRow[]>([]);

  // -------------------------------------------------
  // 🔹 Fetch requests
  // -------------------------------------------------
  async function fetchUnitRequests() {
    try {
      const res = await getRequestsByUC();
      const filtered = res.filter((r) => r.requestStatus !== "pending_uc");
      setRequests(filtered);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  }

  // -------------------------------------------------
  // 🔹 Fetch allocations
  // -------------------------------------------------
  async function fetchAllocations() {
    try {
      const res = await getAllAllocationsForUC();
      setAllocations(res);
    } catch (err) {
      console.error("Failed to fetch allocations:", err);
    }
  }

  // -------------------------------------------------
  // 🔹 Fetch both on mount
  // -------------------------------------------------
  useEffect(() => {
    Promise.all([fetchUnitRequests(), fetchAllocations()]);
  }, []);

  const cardSx = {
    p: { xs: 2, md: 2.5 },
    borderRadius: 3,
    border: "1px solid #000",
    boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
    bgcolor: "#fff",
  };

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <TeachingOperationsHeader
            termValue={termValue}
            unitValue={unitValue}
            viewValue={viewValue}
            onTermChange={setTermValue}
            onUnitChange={setUnitValue}
            onViewChange={setViewValue}
            onSearch={(q) => console.log("Search:", q)}
            onExport={() => console.log("Export CSV")}
          />
        </Stack>

        {/* --- 🧾 Requests Section --- */}
        <Paper sx={{ ...cardSx, mb: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="h6">Requests</Typography>
              <Typography variant="body2" color="text.secondary">
                Items awaiting your review
              </Typography>
            </Box>
          </Stack>
          <UCRequestsTable requests={requests} />
        </Paper>

        {/* --- 📘 Allocations Section --- */}
        <Paper sx={{ ...cardSx }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="h6">Allocations</Typography>
              <Typography variant="body2" color="text.secondary">
                All teaching allocations across your coordinated units
              </Typography>
            </Box>
          </Stack>
          <AllocationsTable allocations={allocations} />
        </Paper>
      </Box>
    </Box>
  );
};

export default TeachingOperations;
