"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  CircularProgress,
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
import { useRouter } from "next/navigation";

// ---------- Helpers ----------
function toHHMM(hms?: string | null) {
  if (!hms) return "—";
  return hms.slice(0, 5); // assumes "HH:MM:SS"
}
function toDDMMYYYY(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// DB status → UI union type normalization
type UIStatus = AllocationDetail["status"]; // "Confirmed" | "Pending" | "Cancelled"
function normalizeStatus(s?: string | null): UIStatus {
  const v = (s ?? "").trim().toLowerCase();

  // Treat as Confirmed
  if (
    v === "confirmed" ||
    v === "approved" ||
    v === "accepted" ||
    v === "allocated" ||
    v === "active" ||
    v === "assigned"
  ) {
    return "Confirmed";
  }

  // Treat as Pending
  if (
    v === "pending" ||
    v === "in_progress" ||
    v === "requested" ||
    v.includes("pending") ||
    v.includes("review") ||
    v.includes("await")
  ) {
    return "Pending";
  }

  // Fallback
  return "Cancelled";
}

// ---------- Page ----------
export default function AllocationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [comment, setComment] = React.useState("");

  const [allocation, setAllocation] = React.useState<AllocationDetail | null>(
    null,
  );
  const [requests, setRequests] = React.useState<RequestItem[]>([]);
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // fetch allocation detail from DB
  React.useEffect(() => {
    if (!id) return; // wait until router provides id
    let cancelled = false;

    async function run() {
      try {
        if (!cancelled) {
          setLoading(true);
          setErr(null);
        }

        const res = await fetch(
          `/api/tutor/allocations/${encodeURIComponent(id)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Failed to fetch allocation ${id}`);
        const json = await res.json();

        const a = json.data as {
          allocation_id: string;
          unit_code: string | null;
          unit_name: string | null;
          status: string | null;
          session_date: string | null;
          start_at: string | null;
          end_at: string | null;
          location: string | null;
          activity_name: string | null;
          note: string | null;
        };

        const mapped: AllocationDetail = {
          id: a.allocation_id,
          courseCode: a.unit_code ?? "—",
          courseName: a.unit_name ?? "—",
          status: normalizeStatus(a.status),
          date: toDDMMYYYY(a.session_date),
          time:
            a.start_at || a.end_at
              ? `${toHHMM(a.start_at)} – ${toHHMM(a.end_at)}`
              : "—",
          location: a.location ?? "—",
          hours:
            a.start_at && a.end_at
              ? (() => {
                  const [sh, sm] = a.start_at.split(":").map(Number);
                  const [eh, em] = a.end_at.split(":").map(Number);
                  const start = new Date(0, 0, 0, sh || 0, sm || 0, 0);
                  const end = new Date(0, 0, 0, eh || 0, em || 0, 0);
                  let diff =
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  if (diff < 0) diff += 24;
                  return `${diff.toFixed(2)}h`;
                })()
              : "—",
          session: a.activity_name ?? "—",
          notes: a.note ?? undefined,
        };

        if (!cancelled) {
          setAllocation(mapped);
          setRequests([]); // TODO: later wire to /requests
          setComments([]); // TODO: later wire to /comments
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setErr(msg || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography variant="body2">Loading allocation…</Typography>
        </Stack>
      </Box>
    );
  }

  if (err || !allocation) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <IconButton component={Link} href="/dashboard/tutor/" size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            Allocation
          </Typography>
        </Stack>
        <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
          <Typography color="error" sx={{ mb: 1 }}>
            {err ?? "Allocation not found."}
          </Typography>
          <Button component={Link} href="/dashboard/tutor" variant="outlined">
            Back to Allocations
          </Button>
        </Card>
      </Box>
    );
  }

  const statusColor: "success" | "warning" | "default" =
    allocation.status === "Confirmed"
      ? "success"
      : allocation.status === "Pending"
        ? "warning"
        : "default";

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
      {/* Header & Back */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton
          component={Link}
          href="/dashboard/tutor/"
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
              color={statusColor}
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
                <MenuItem onClick={() => setAnchorEl(null)}>
                  Cancellation
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    router.push(
                      `/dashboard/tutor/allocations/${id}/requests/query`,
                    );
                  }}
                >
                  Query
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
            {requests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No requests yet.
              </Typography>
            ) : (
              requests.map((r) => <RequestRow key={r.id} req={r} />)
            )}
          </Stack>

          {/* Comments */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 3 }}>
            Comments
          </Typography>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No comments yet.
              </Typography>
            ) : (
              comments.map((c) => <CommentBubble key={c.id} comment={c} />)
            )}

            {/* New comment input */}
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
    </Box>
  );
}
