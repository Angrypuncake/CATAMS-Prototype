export type SimplifiedStatus = "Draft" | "Approved" | "Claimed" | "Cancelled";

export function mapLegacyStatus(status?: string | null): SimplifiedStatus {
  if (!status) return "Draft"; // default fallback

  const s = status.toLowerCase();

  if (["approved allocation", "variation complete"].includes(s)) return "Approved";
  if (["hours for approval", "hours for review", "draft casual"].includes(s)) return "Draft";
  if (["rejected by approval", "ignore class"].includes(s)) return "Cancelled";
  if (["academic staff"].includes(s)) return "Cancelled"; // non-claimable permanent staff

  return "Draft"; // fallback safety
}
