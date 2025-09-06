# TP03 – Role-Based Access

**TC-R1 Tutor cannot access Admin/UC endpoints**  
Call `/api/admin/overview` and `/api/uc/overview` with Tutor creds → 401/403.

**TC-R2 UC/Admin can access their scope**  
Valid token → 200 responses; check no tutor-specific private data leaks.

**Evidence:** Failed/allowed calls, auth middleware logs (if available).
