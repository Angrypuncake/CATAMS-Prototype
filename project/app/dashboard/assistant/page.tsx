"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import TeachingOperationsHeader from "./TeachingOperationsHeader";
import UCRequestsTable from "../coordinator/CoordinatorRequestTable";
import { getRequestsByUC } from "@/app/services/requestService";
import { UCApproval } from "@/app/_types/request";

const TeachingOperations: React.FC = () => {
  const [termValue, setTermValue] = useState("S2 2025");
  const [unitValue, setUnitValue] = useState("All");
  const [viewValue, setViewValue] = useState("All");
  const [requests, setRequests] = useState<UCApproval[]>([]);

  async function fetchUnitRequests() {
    const res = await getRequestsByUC();
    setRequests(res);
  }

  useEffect(() => {
    fetchUnitRequests();
  }, []);

  const cardSx = {
    p: { xs: 2, md: 2.5 },
    borderRadius: 3, // ~24px
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

        {/* TA Approvals Section */}
        <Paper sx={{ ...cardSx, height: "100%" }}>
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
      </Box>
    </Box>
  );
};

export default TeachingOperations;
