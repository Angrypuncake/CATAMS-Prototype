"use client";
import ReviewShell from "@/app/dashboard/review/[id]/page";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = Promise.resolve({ role: "UC", readOnly: "false" });

  return <ReviewShell params={params} searchParams={searchParams} />;
}
