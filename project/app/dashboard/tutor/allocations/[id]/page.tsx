"use client";
import * as React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NewCommentBox from "../_components/NewCommentBox";
import DetailRow from "../_components/DetailRow";
import RequestRow from "../_components/RequestRow";
import CommentBubble from "../_components/CommentBubble";
import type {
  AllocationDetail,
  RequestItem,
  CommentItem,
} from "@/app/_types/allocations";

// ---------- Mock data ----------
const mockAllocation: AllocationDetail = {
  id: "123",
  courseCode: "INFO1110",
  courseName: "Programming Fundamentals",
  status: "Confirmed", // Confirmed | Pending | Rejected
  date: "12/09/2025",
  time: "9:00 AM – 11:00 AM",
  location: "Room A",
  hours: "2h",
  session: "Tutorial",
  notes:
    "“Please arrive 10 minutes early to assist with setup. Ensure attendance sheet is completed”",
};

const mockRequests: RequestItem[] = [
  { id: "123", type: "Swap", state: "Pending Review" },
  { id: "124", type: "Correction", state: "Pending Review" },
];

const mockComments: CommentItem[] = [
  {
    id: "1",
    author: "John D.",
    role: "Tutor",
    time: "26/08/25, 2:14 PM",
    body: "Hi, I just noticed this clashes with another lab I’m running in INFO1910. Could I request a swap?",
    mine: true,
  },
  {
    id: "2",
    author: "Sarah T.",
    role: "Teaching Assistant",
    time: "26/08/25, 3:02 PM",
    body: "Thanks John, I’ve flagged this as a pending swap. Please submit a formal request via the system so I can process it.",
  },
  {
    id: "3",
    author: "John D.",
    role: "Tutor",
    time: "26/08/25, 3:15 PM",
    body: "Submitted now under Request #123. Let me know if you need further details.",
    mine: true,
  },
  {
    id: "4",
    author: "Unit Coordinator – Dr. Lee",
    role: "",
    time: "27/08/25, 9:20 AM",
    body: "Request acknowledged. I’ll review availability in Room B and confirm by tomorrow.",
  },
];

// ---------- Page ----------
export default function AllocationPage({ params }: { params: { id: string } }) {
  // Comment box state
  const [comment, setComment] = React.useState("");

  // Request menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Modal state
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // TODO: replace mocks with real fetch using params.id
  const allocation = mockAllocation;
  const requests = mockRequests;
  const comments = mockComments;

  // Handlers
  const handleSubmitClaim = () => {
    console.log("Submit Claim pressed");
    // TODO: hook up real submit claim
  };

  const handleCreateRequestClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const showClaim = allocation.status === "Confirmed";

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
      {/* Header & Back */}
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
          {/* Course + Status */}
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
              icon={<CheckCircleIcon fontSize="small" />}
              label={allocation.status}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Divider sx={{ my: 1 }} />

          {/* Details grid */}
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

          {/* Actions */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mt: 3, mb: 2 }}
          >
            {/* New View button to open modal */}
            <Button variant="outlined" onClick={() => setDialogOpen(true)}>
              View
            </Button>

            <Button variant="contained" onClick={handleSubmitClaim}>
              Submit Claim
            </Button>

            <div>
              <Button variant="outlined" onClick={handleCreateRequestClick}>
                Create Request ▾
              </Button>
              <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleCloseMenu}>
                <MenuItem onClick={handleCloseMenu}>Swap</MenuItem>
                <MenuItem onClick={handleCloseMenu}>Correction</MenuItem>
                <MenuItem onClick={handleCloseMenu}>Extension</MenuItem>
                <MenuItem onClick={handleCloseMenu}>Cancellation</MenuItem>
              </Menu>
            </div>

            <Button
              variant="outlined"
              component={Link}
              href="/dashboard/tutor/allocations"
            >
              Back to Allocations
            </Button>
          </Stack>

          {/* Requests */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
            View/Edit Request
          </Typography>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {requests.map((r) => (
              <RequestRow key={r.id} req={r} />
            ))}
          </Stack>

          {/* Comments */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 3 }}>
            Comments
          </Typography>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {comments.map((c) => (
              <CommentBubble key={c.id} comment={c} />
            ))}

            <NewCommentBox
              value={comment}
              onChange={setComment}
              onSubmit={() => {
                // TODO: POST comment
                setComment("");
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Modal Popup */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Allocation</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={0.5}>
            <Typography>
              <b>Course:</b> {allocation.courseCode} – {allocation.courseName}
            </Typography>
            <Typography>
              <b>Status:</b> {allocation.status}
            </Typography>
            <Typography>
              <b>Date:</b> {allocation.date}
            </Typography>
            <Typography>
              <b>Time:</b> {allocation.time}
            </Typography>
            <Typography>
              <b>Location:</b> {allocation.location}
            </Typography>
            <Typography>
              <b>Hours:</b> {allocation.hours}
            </Typography>
            <Typography>
              <b>Session:</b> {allocation.session}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button>View Details</Button>

          <Button
            variant="outlined"
            onClick={() => {
              setDialogOpen(false);
              // trigger same handler
              handleCreateRequestClick({ currentTarget: document.body } as any);
            }}
          >
            Make Request
          </Button>

          {showClaim && (
            <Button
              variant="contained"
              onClick={() => {
                setDialogOpen(false);
                handleSubmitClaim();
              }}
            >
              Submit Claim
            </Button>
          )}

          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
