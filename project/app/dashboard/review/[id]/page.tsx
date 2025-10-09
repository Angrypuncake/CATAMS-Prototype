// app/dashboard/review/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CircularProgress, Typography, Box } from "@mui/material";

import { getRequestById } from "@/app/services/requestService";
import type { TutorRequest } from "@/app/_types/request";

// Review Components
import ClaimReview from "./_components/ClaimReview";
import SwapReview from "./_components/SwapReview";
import CancelReview from "./_components/CancelReview";
import CorrectionReview from "./_components/CorrectionReview";
import QueryReview from "./_components/QueryReview";
import ReviewFallback from "./_components/ReviewFallback";

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [data, setData] = useState<TutorRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchData() {
      try {
        if (!cancelled) {
          setLoading(true);
          setErr(null);
        }

        const result = await getRequestById(id);
        if (!cancelled) setData(result);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setErr(msg || "Failed to load request");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ---- Render States ----
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (err)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{err}</Typography>
      </Box>
    );

  if (!data)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No request found for ID: {id}</Typography>
      </Box>
    );

  // ---- Core Review Logic ----
  const { requestType } = data;

  switch (requestType) {
    case "claim":
      return <ClaimReview data={data} />;
    case "swap":
      return <SwapReview data={data} />;
    case "cancellation":
      return <CancelReview data={data} />;
    case "correction":
      return <CorrectionReview data={data} />;
    case "query":
      return <QueryReview data={data} />;
    default:
      return <ReviewFallback data={data} />;
  }
}
