"use client";
import ReviewShell from "@/app/dashboard/review/[id]/page";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const requestId = Array.isArray(id) ? id[0] : id;

  return <ReviewShell role="TA" readOnly={false} requestId={requestId} />;
}
