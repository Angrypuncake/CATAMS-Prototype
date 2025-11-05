"use client";

import { useEffect, useState } from "react";
import {
  getAllocationById,
  getAllocationsByUnitAndActivityType,
} from "@/app/services/allocationService";
import { getTutorById } from "@/app/services/userService";
import type { Tutor } from "@/app/_types/tutor";
import type { TutorRequest } from "@/app/_types/request";
import type {
  TutorAllocationRow,
  AdminAllocationRow,
} from "@/app/_types/allocations";

export function useSwapReview(data: TutorRequest) {
  const { allocationId, requesterId } = data;
  const [loadingEligible, setLoadingEligible] = useState(true);
  const [sourceTutor, setSourceTutor] = useState<Tutor | null>(null);
  const [suggestedTutor, setSuggestedTutor] = useState<Tutor | null>(null);
  const [sourceAllocation, setSourceAllocation] =
    useState<TutorAllocationRow | null>(null);
  const [eligibleAllocations, setEligibleAllocations] = useState<
    AdminAllocationRow[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const source = await getAllocationById(String(allocationId));
        const tutor = await getTutorById(String(requesterId));
        setSourceTutor(tutor);
        setSourceAllocation(source);

        if (data.requestType === "swap" && data.details?.suggested_tutor_id) {
          const sug = await getTutorById(
            String(data.details.suggested_tutor_id),
          );
          setSuggestedTutor(sug);
        }

        const allocations = await getAllocationsByUnitAndActivityType(
          source.unit_code,
          source.activity_type,
          requesterId,
        );
        setEligibleAllocations(allocations);
      } catch (err) {
        console.error("❌ useSwapReview failed:", err);
      } finally {
        setLoadingEligible(false);
      }
    })();
  }, [allocationId, requesterId, data]);

  return {
    loadingEligible,
    sourceTutor,
    suggestedTutor,
    sourceAllocation,
    eligibleAllocations,
  };
}
