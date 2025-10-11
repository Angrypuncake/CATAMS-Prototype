"use client";
import { createClient } from "@/lib/supabase/client";

export default function DevLoginButton() {
    async function login() {
        const sb = createClient();
        const { error } = await sb.auth.signInWithPassword({
            email: "tom.tutor@demo.edu",   // use a real Auth user you created
            password: "DevPass!234",
        });
        alert(error ? error.message : "Logged in");
        // optional: location.reload();
    }

    return (
        <button
            onClick={login}
            style={{ padding: 8, border: "1px solid #999", borderRadius: 6 }}
        >
            Dev login (temporary)
        </button>
    );
}
