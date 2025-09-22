"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type AllocationRow = {
  unit_code: string | null;
  unit_name: string | null;
  session_date: string | null; // ISO
  start_at: string | null; // "HH:MM:SS"
  end_at: string | null; // "HH:MM:SS"
  activity_name: string | null;
};

export default function QueryRequestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const allocationId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [allocation, setAllocation] = useState<AllocationRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchAllocation() {
      try {
        const res = await fetch(`/api/tutor/allocations/${allocationId}`);
        if (!res.ok) throw new Error("Failed to fetch allocation");
        const json = (await res.json()) as { data?: AllocationRow };
        setAllocation(json.data ?? null);
      } catch (e: unknown) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (allocationId) fetchAllocation();
  }, [allocationId]);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "query");
      formData.append("subject", subject);
      formData.append("details", details);
      if (file) formData.append("attachment", file);

      const res = await fetch(
        `/api/tutor/allocations/${allocationId}/requests`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Failed to submit query");

      alert("Query submitted!");
      router.push(`/dashboard/tutor/allocations/${allocationId}`);
    } catch (err: unknown) {
      console.error(err);
      alert("Error submitting request.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      {/* Back link */}
      <Typography
        component={Link}
        href="/dashboard/tutor"
        color="primary"
        sx={{ display: "inline-block", mb: 2, textDecoration: "none" }}
      >
        ← Back to Dashboard
      </Typography>

      {/* Title */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Query Request
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use this form to raise a clarification or general question about your
        allocation or claim.
      </Typography>

      {/* Allocation summary */}
      {allocation && (
        <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
          <CardContent>
            <Typography fontWeight={700}>
              {allocation.unit_code} – {allocation.unit_name}
            </Typography>
            <Typography>Date: {allocation.session_date}</Typography>
            <Typography>
              Time: {allocation.start_at?.slice(0, 5)} –{" "}
              {allocation.end_at?.slice(0, 5)}
            </Typography>
            <Typography>Session: {allocation.activity_name}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Query form */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Your Query
          </Typography>

          <Stack spacing={3}>
            {/* Subject */}
            <TextField
              label="Subject"
              placeholder="Short title for your query (required)"
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubject(e.target.value)
              }
              fullWidth
              required
            />

            {/* Details */}
            <TextField
              label="Details"
              placeholder="Write your question or clarification in detail (required)"
              value={details}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => setDetails(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
            />

            {/* Example note */}
            <Typography variant="caption" color="text.secondary">
              Examples: “I’m unsure if this session counts as lab or tutorial
              hours” or “Does my swap request affect budget?”
            </Typography>

            {/* Attachment */}
            <Button variant="outlined" component="label">
              {file ? file.name : "Choose File"}
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                }}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Optional evidence or supporting screenshot (PDF/PNG/DOC up to
              5MB).
            </Typography>

            {/* Actions */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button variant="outlined" disabled>
                Save Draft
              </Button>
              <Button
                variant="contained"
                disabled={!subject || !details}
                onClick={handleSubmit}
              >
                Submit Query
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
