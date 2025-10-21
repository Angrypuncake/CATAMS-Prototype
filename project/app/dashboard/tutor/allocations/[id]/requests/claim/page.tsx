// components/ClaimForm.tsx
"use client";
import { useEffect, useState } from "react";
import { getAllocationById } from "@/app/services/allocationService";
import { TutorAllocationRow } from "@/app/_types/allocations";
import { useParams } from "next/navigation";
import { getPaycodes } from "@/app/services/paycodeService";
import { Paycode } from "@/app/_types/paycode";
import { createClaim } from "@/app/services/claimService";
import { CreateClaimPayload } from "@/app/_types/claim";
import { getUserFromAuth } from "@/app/services/authService";
import { useRouter } from "next/navigation";

export default function ClaimForm() {
  const router = useRouter();
  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [systemHours, setSystemHours] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [payCode, setPayCode] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const params = useParams<{ id: string }>();
  const allocationId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [userId, setUserId] = useState(0);

  const [paycodes, setPaycodes] = useState<Paycode[]>([]);

  useEffect(() => {
    (async () => {
      const [allocData, paycodeList] = await Promise.all([
        getAllocationById(allocationId),
        getPaycodes(),
      ]);

      const { userId } = await getUserFromAuth();

      setAllocation(allocData);
      setSystemHours(Number(allocData.hours ?? 0));
      setHours(Number(allocData.hours ?? 0));
      setPayCode(allocData.paycode_id ?? "");
      setPaycodes(paycodeList);
      setUserId(userId);
    })();
  }, [allocationId]);

  if (!allocation) return <div>Loading...</div>;
  const hoursChanged = hours != systemHours;
  const paycodeChanged = payCode !== allocation.paycode_id;

  const handleSubmit = async () => {
    if ((paycodeChanged || hoursChanged) && !comment.trim()) {
      setError("Comment required when claimed hours or pay code differ");
      return;
    }

    setError("");

    const payload: CreateClaimPayload = {
      allocation_id: Number(allocationId), // ensure numeric
      requester_id: userId,
      paycode: payCode,
      claimed_hours: hours, // ← use the current edited hours, not systemHours
    };

    try {
      await createClaim(payload);
      alert("Claim submitted");
      router.push(`/dashboard/tutor/allocations/${allocationId}`);
    } catch (err: unknown) {
      console.error("Claim submission failed:", err);
      setError("Failed to submit claim. Please try again.");
    }
  };

  return (
    <div className="p-6 border rounded-lg max-w-xl">
      <h2 className="text-xl font-semibold mb-3">Claim Allocation</h2>
      <p>
        <strong>Unit:</strong> {allocation.unit_code} – {allocation.unit_name}
      </p>
      <p>
        <strong>Date:</strong> {allocation.session_date} <strong>Time:</strong>{" "}
        {allocation.start_at}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-medium">System Record</p>
          <p>Hours: {allocation.hours}</p>
          <p>Pay Code: {allocation.paycode_id}</p>
        </div>
        <div>
          <p className="font-medium">Tutor Claim</p>
          <input
            type="number"
            min="0"
            step="0.25"
            className="border rounded w-full px-2 py-1"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
          <select
            className="border rounded w-full mt-2 px-2 py-1"
            value={payCode}
            onChange={(e) => setPayCode(e.target.value)}
          >
            {paycodes.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code} – {p.paycode_description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="font-medium">
          Comment {(hoursChanged || paycodeChanged) && "[Mandatory]"}
        </label>
        <textarea
          className="border rounded w-full px-2 py-1 mt-1"
          placeholder={
            hoursChanged || paycodeChanged
              ? "Explain reason for change..."
              : "Optional comment"
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {error && <p className="text-red-600 mt-2">⚠ {error}</p>}

      <button
        onClick={handleSubmit}
        className={`mt-4 px-4 py-2 rounded text-white ${
          paycodeChanged || hoursChanged ? "bg-yellow-600" : "bg-blue-600"
        }`}
      >
        {paycodeChanged || hoursChanged
          ? "Submit Claim Request"
          : "Submit Claim"}
      </button>

      {paycodeChanged && (
        <p className="text-sm text-red-600 mt-2">
          Entered Paycode is different
        </p>
      )}
    </div>
  );
}
