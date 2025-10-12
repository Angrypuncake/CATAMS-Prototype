import api from "@/lib/axios";

// ==========================================================
// SWAP REQUEST SERVICE — handles full tutor → TA → UC workflow
// ==========================================================

/**
 * Tutor creates a blind swap request.
 * Inserts a new row into `swap_request` table.
 * status = 'PENDING_TA'
 */
export async function createSwapRequest(
  tutorId: number,
  allocationId: number,
  reason?: string,
) {
  // SQL:
  // INSERT INTO swap_request (initiator_id, allocation_id, reason, status)
  // VALUES ($1, $2, $3, 'PENDING_TA')
}

/**
 * Returns all swap requests initiated by a given tutor (for dashboard/history).
 */
export async function getSwapRequestsByUser(userId: number) {
  // SELECT * FROM swap_request WHERE initiator_id = $1 ORDER BY created_at DESC
}

/**
 * Returns all swap requests related to a specific unit.
 * Used by TA / UC dashboards to review pending requests.
 */
export async function getSwapRequestsForUnit(unitCode: string) {
  // SELECT sr.*, a.unit_code FROM swap_request sr
  // JOIN allocations a ON a.allocation_id = sr.allocation_id
  // WHERE a.unit_code = $1
}

/**
 * TA proposes a replacement tutor or allocation.
 * Updates swap_request with replacement IDs and sets status = 'PENDING_REPLACEMENT'
 */
export async function proposeReplacement(
  requestId: number,
  replacementTutorId: number,
  replacementAllocationId?: number,
) {
  // UPDATE swap_request
  // SET replacement_tutor_id = $2, replacement_allocation_id = $3, status = 'PENDING_REPLACEMENT'
  // WHERE id = $1
}

/**
 * Replacement tutor accepts or declines the swap proposal.
 * Accept → status = 'PENDING_UC'
 * Decline → status = 'PENDING_TA' (revert for TA to reassign)
 */
export async function respondToSwap(requestId: number, accepted: boolean) {
  // UPDATE swap_request
  // SET status = accepted ? 'PENDING_UC' : 'PENDING_TA'
  // WHERE id = $1
}

/**
 * Unit Coordinator approves the swap.
 * Calls AllocationService.swapAllocations()
 * and updates swap_request status = 'APPROVED'
 */
export async function approveSwap(requestId: number) {
  // 1. Fetch allocations (current + replacement)
  // 2. Call swapAllocations(a, b)
  // 3. UPDATE swap_request SET status = 'APPROVED', updated_at = NOW()
}

/**
 * UC rejects the swap.
 * Updates status = 'DECLINED' and stores optional rejection reason.
 */
export async function rejectSwap(requestId: number, reason?: string) {
  // UPDATE swap_request SET status = 'DECLINED', reason = $2 WHERE id = $1
}

//query request for an allocation
export async function submitQueryRequest(
  allocationId: string,
  data: {
    subject: string;
    details: string;
    attachment?: File;
  },
): Promise<void> {
  const formData = new FormData();
  formData.append("type", "query");
  formData.append("subject", data.subject);
  formData.append("details", data.details);
  if (data.attachment) {
    formData.append("attachment", data.attachment);
  }

  await api.post(
    `/tutor/allocations/${allocationId}/requests/query`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}
