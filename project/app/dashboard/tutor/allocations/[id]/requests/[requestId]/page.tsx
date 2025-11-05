"use client";
import ReviewShell from "@/app/dashboard/review/[id]/page";

export default function Page({
  params,
}: {
  params: Promise<{ id: string; requestId: string }>;
}) {
  const wrappedParams = params.then((p) => ({ id: p.requestId }));
  const searchParams = Promise.resolve({ role: "USER", readOnly: "true" });

  return <ReviewShell params={wrappedParams} searchParams={searchParams} />;
}
