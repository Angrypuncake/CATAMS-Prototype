// lib/auth.ts
import { createClient } from "@/lib/supabase/server";
import { query } from "@/lib/db";

/** Returns the row from public.users for the currently logged-in Supabase user. */
export async function getAuthedUserRow() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;            // not logged in

    const { rows } = await query(
    `SELECT user_id, first_name, last_name, email, auth_uid
    FROM public.users
    WHERE auth_uid = $1
    LIMIT 1`,
        [user.id],
    );

    return rows[0] ?? null;
}
