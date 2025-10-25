"use client";
import ReviewShell from "@/app/dashboard/review/[id]/page";
import { useParams } from "next/navigation";
export default function Page() {
  const { requestId } = useParams<{ id: string; requestId: string }>();
  const rid = Array.isArray(requestId) ? requestId[0] : requestId;
  return <ReviewShell role="USER" readOnly requestId={rid} />;
}
