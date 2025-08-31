"use client";
import * as React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// ------------ Types ------------
type RequestType = "Swap" | "Correction" | "Extension" | "Cancellation";
type RequestState = "Pending Review" | "Approved" | "Rejected";

interface AllocationDetail {
  id: string;
  courseCode: string;
  courseName: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  date: string;
  time: string;
  location: string;
  hours: string;
  session: string;
  notes?: string;
}

interface RequestItem {
  id: number;
  type: RequestType;
  state: RequestState;
}

interface CommentItem {
  id: number;
  author: string;
  role: string;
  time: string;
  body: string;
  mine?: boolean; // whether current user wrote this
}

// ---------- Mock data ----------
const mockAllocation: AllocationDetail = {
  id: "123",
  courseCode: "INFO1110",
  courseName: "Programming Fundamentals",
  status: "Confirmed",
  date: "12/09/2025",
  time: "9:00 AM – 11:00 AM",
  location: "Room A",
  hours: "2h",
  session: "Tutorial",
  notes:
    "“Please arrive 10 minutes early to assist with setup. Ensure attendance sheet is completed”",
};

const mockRequests: RequestItem[] = [
  { id: 123, type: "Swap", state: "Pending Review" },
  { id: 124, type: "Correction", state: "Pending Review" },
];

const mockComments: CommentItem[] = [
  {
    id: 1,
    author: "John D.",
    role: "Tutor",
    time: "26/08/25, 2:14 PM",
    body: "Hi, I just noticed this clashes with another lab I’m running in INFO1910. Could I request a swap?",
    mine: true, //Show Edit/Delete buttons if the logged-in user wrote this comment
  },
  {
    id: 2,
    author: "Sarah T.",
    role: "Teaching Assistant",
    time: "26/08/25, 3:02 PM",
    body: "Thanks John, I’ve flagged this as a pending swap. Please submit a formal request via the system so I can process it.",
  },
  {
    id: 3,
    author: "John D.",
    role: "Tutor",
    time: "26/08/25, 3:15 PM",
    body: "Submitted now under Request #123. Let me know if you need further details.",
    mine: true, //Show Edit/Delete buttons if the logged-in user wrote this comment
  },
  {
    id: 4,
    author: "Unit Coordinator – Dr. Lee",
    role: "",
    time: "27/08/25, 9:20 AM",
    body: "Request acknowledged. I’ll review availability in Room B and confirm by tomorrow.",
  },
];

// ---------- Page ----------
export default function AllocationPage({ params }: { params: { id: string } }) {
  // for now still use mocks; will swap to fetch(params.id) later
  const allocation = mockAllocation;

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
      {/* header + back */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton
          component={Link}
          href="/dashboard/tutor/allocations"
          size="small"
          aria-label="Back to Allocations"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Allocation
        </Typography>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          {/* course title + status */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Typography variant="h6" fontWeight={700}>
              {allocation.courseCode} – {allocation.courseName}
            </Typography>
            <Chip
              label={`${allocation.status} ✅`}
              color="success"
              variant="outlined"
            />
          </Stack>

          <Divider sx={{ my: 1 }} />

          {/* details grid */}
          <Box sx={{ my: 1 }}>
            <DetailRow label="Date" value={allocation.date} />
            <DetailRow label="Time" value={allocation.time} />
            <DetailRow label="Location" value={allocation.location} />
            <DetailRow label="Hours" value={allocation.hours} />
            <DetailRow label="Session" value={allocation.session} />
          </Box>

          {/* Notes */}
          {allocation.notes && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderLeft: "4px solid",
                borderColor: "grey.300",
                bgcolor: "grey.50",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {allocation.notes}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// small helper row (label: value)
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.25 }}>
      <Typography variant="body2" sx={{ width: 120, color: "text.secondary" }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
