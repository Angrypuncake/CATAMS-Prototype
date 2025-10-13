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

import { useSearchParams } from "next/navigation";
import NewCommentBox from "../_components/NewCommentBox";
import DetailRow from "../_components/DetailRow";
import RequestRow from "../_components/RequestRow";
import CommentBubble from "../_components/CommentBubble";
import type {
  TutorAllocationRow as AllocationDetail,
  RequestItem,
  CommentItem,
} from "@/app/_types/allocations";
import { useRouter } from "next/navigation";
import { getFormattedAllocationById } from "@/app/services/allocationService";
import AllocationDetails from "./_components/AllocationDetails";
import { getOpenRequestTypes } from "@/app/services/requestService";

// DB status → UI union type normalization
// type UIStatus = AllocationDetail["status"]; // "Confirmed" | "Pending" | "Cancelled"

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
  const [requestToast, setRequestToast] = React.useState(false);
  const searchParams = useSearchParams();
  const [openRequestTypes, setOpenRequestTypes] = React.useState<string[]>([]);
  const [loadingRequests, setLoadingRequests] = React.useState(false);

  // Toast/feedback for "request created"
  React.useEffect(() => {
    if (searchParams.get("success") === "true") {
      setRequestToast(true);
      const timer = setTimeout(() => setRequestToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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

        // fetch via service
        const mapped = await getFormattedAllocationById(id);

        if (!cancelled) {
          setAllocation(mapped);
          setRequests([]); // future endpoint
          setComments([]); // future endpoint
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

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoadingRequests(true);
        const types = await getOpenRequestTypes(Number(id));
        if (!cancelled) setOpenRequestTypes(types);
      } catch (err) {
        console.error("Error fetching open request types:", err);
      } finally {
        if (!cancelled) setLoadingRequests(false);
      }
    })();

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

  // helper function to determine if this request type already has a request to grey out buttons

  const hasOpen = (type: string) => openRequestTypes.includes(type);

  const statusColor: "success" | "warning" | "default" =
    allocation.status === "Confirmed"
      ? "success"
      : allocation.status === "Pending"
        ? "warning"
        : "default";

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
      {requestToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded shadow-lg">
          Request Submitted.
        </div>
      )}
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

      <AllocationDetails allocation={allocation} />

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          {/* Actions */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mt: 3, mb: 2 }}
          >
            <Button
              variant="contained"
              disabled={hasOpen("claim")}
              onClick={() => router.push(`${id}/requests/claim`)}
              title={
                hasOpen("claim")
                  ? "You already have a pending claim request."
                  : ""
              }
            >
              Submit Claim
            </Button>

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
                <MenuItem
                  disabled={hasOpen("swap")}
                  onClick={() => router.push(`${id}/requests/swap`)}
                >
                  Swap
                </MenuItem>

                <MenuItem
                  disabled={hasOpen("correction")}
                  onClick={() => router.push(`${id}/requests/correction`)}
                >
                  Correction
                </MenuItem>

                <MenuItem
                  disabled={hasOpen("cancellation")}
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/allocations/${id}/requests/cancel`,
                    )
                  }
                >
                  Cancellation
                </MenuItem>

                <MenuItem
                  disabled={hasOpen("query")}
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/allocations/${id}/requests/query`,
                    )
                  }
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
