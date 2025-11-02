"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CircularProgress, Typography, Box } from "@mui/material";

import { getRequestByRequestId } from "@/app/services/requestService";
import { getFormattedAllocationById } from "@/app/services/allocationService";
import { getTutorsByUnit } from "@/app/services/userService";

import type { TutorRequest } from "@/app/_types/request";
import type { Tutor } from "@/app/_types/tutor";
import type { TutorAllocationRow } from "@/app/_types/allocations";
import ClaimReview from "./_components/ClaimReview";
import SwapReview from "./_components/SwapReview";
import CancelReview from "./_components/CancelReview";
import CorrectionReview from "./_components/CorrectionReview";
import QueryReview from "./_components/QueryReview";
import ReviewFallback from "./_components/ReviewFallback";

export type ReviewRole = "UC" | "TA" | "USER";

export default function ReviewShell({
  role,
  readOnly = role === "USER",
  currentUserId,
  requestId,
}: {
  role: ReviewRole;
  readOnly?: boolean;
  currentUserId?: number;
  requestId: string;
}) {
  const id = requestId;
  const [data, setData] = useState<TutorRequest | null>(null);
  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const req = await getRequestByRequestId(id);
        if (cancelled) return;
        setData(req);

        const alloc = await getFormattedAllocationById(
          String(req.allocationId),
        );
        if (cancelled) return;
        setAllocation(alloc);

        if (alloc?.unit_code) {
          const unitTutors = await getTutorsByUnit(alloc.unit_code);
          if (!cancelled) setTutors(unitTutors);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setErr(msg || "Failed to load review data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (err) {
    return (
      <Box p={3}>
        <Typography color="error">{err}</Typography>
      </Box>
    );
  }

  if (!data || !allocation) {
    return (
      <Box p={3}>
        <Typography color="error">
          {err ?? "Request or allocation not found."}
        </Typography>
      </Box>
    );
  }

  const { requestType } = data;
  const componentProps = {
    data,
    allocation,
    tutors,
    role,
    readOnly,
    currentUserId,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box mt={4}>
        {(() => {
          switch (requestType) {
            case "claim":
              return <ClaimReview {...componentProps} />;
            case "swap":
              return <SwapReview {...componentProps} />;
            case "cancellation":
              return <CancelReview {...componentProps} />;
            case "correction":
              return <CorrectionReview {...componentProps} />;
            case "query":
              return <QueryReview {...componentProps} />;
            default:
              return <ReviewFallback {...componentProps} />;
          }
        })()}
      </Box>
    </Box>
  );
}
