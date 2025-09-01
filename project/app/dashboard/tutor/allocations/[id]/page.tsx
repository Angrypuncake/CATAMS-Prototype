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
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NewCommentBox from "../_components/NewCommentBox";

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
  id: string;
  type: RequestType;
  state: RequestState;
}

interface CommentItem {
  id: string;
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
    mine: true, //Show Edit/Delete buttons if the logged-in user wrote this comment
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
    mine: true, //Show Edit/Delete buttons if the logged-in user wrote this comment
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
  // Menu state for "Create Request"
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Comment box state
  const [comment, setComment] = React.useState("");

  // TODO: replace mocks with real fetch using params.id
  const allocation = mockAllocation;
  const requests = mockRequests;
  const comments = mockComments;

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
            <Button variant="contained">Submit Claim</Button>
            <div>
              <Button
                variant="outlined"
                onClick={(e: React.MouseEvent<HTMLElement>) =>
                  setAnchorEl(e.currentTarget)
                }
              >
                Create Request ▾
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => setAnchorEl(null)}>Swap</MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>
                  Correction
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>Extension</MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>
                  Cancellation
                </MenuItem>
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

            {/* New comment input */}
            <NewCommentBox
              value={comment}
              onChange={setComment}
              onSubmit={() => {
                //TODO: POST comment
                setComment("");
              }}
            ></NewCommentBox>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

// ---------- Subcomponents ----------
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

function RequestRow({ req }: { req: RequestItem }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
      sx={{
        p: 1,
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1.5,
      }}
    >
      <Typography variant="body2" sx={{ minWidth: 56 }}>
        #{req.id}
      </Typography>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ display: { xs: "none", sm: "block" } }}
      />
      <Typography variant="body2" sx={{ minWidth: 90 }}>
        {req.type}
      </Typography>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ display: { xs: "none", sm: "block" } }}
      />
      <Typography variant="body2" sx={{ color: "text.secondary", flexGrow: 1 }}>
        {req.state}
      </Typography>
      <Button size="small" variant="outlined">
        View/Edit Request
      </Button>
    </Stack>
  );
}

function CommentBubble({ comment }: { comment: CommentItem }) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1.5,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 0.5 }}
      >
        <Typography variant="body2" fontWeight={600}>
          {comment.author}
          {comment.role ? ` – ${comment.role}` : ""} ({comment.time})
        </Typography>
        {comment.mine && (
          <Stack direction="row" spacing={0.5}>
            <Button size="small" variant="outlined" startIcon={<EditIcon />}>
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </Stack>
        )}
      </Stack>
      <Typography variant="body2" color="text.primary">
        {comment.body}
      </Typography>
    </Box>
  );
}
