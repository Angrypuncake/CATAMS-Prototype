// NOTIFICATION SERVICE — optional (MVP stub)
/**
 * Notify TA that a new swap request has been created.
 */
export async function notifyTA(requestId: number) {
  // INSERT INTO notifications (target_role, request_id, message) VALUES ('TA', $1, 'New swap request pending')
}

/**
 * Notify tutor when their swap request status changes.
 */
export async function notifyTutor(userId: number, requestId: number, newStatus: string) {
  // INSERT INTO notifications (target_user, request_id, message) VALUES ($1, $2, `Request updated to ${newStatus}`)
}

/**
 * Notify UC when a swap is ready for approval.
 */
export async function notifyUC(requestId: number) {
  // INSERT INTO notifications (target_role, request_id, message) VALUES ('UC', $1, 'Swap ready for approval')
}
