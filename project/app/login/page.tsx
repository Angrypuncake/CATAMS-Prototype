"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button, TextField, Typography } from "@mui/material";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        "/api/auth/login",
        { useremail: username, password },
        { withCredentials: true },
      );
      if (result.data?.success) router.push("/portal");
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Login failed: ${error.response.data.error}`);
      } else {
        alert("Login failed: Network error");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f7f7]">
      <main className="max-w-screen-2xl mx-auto px-4">
        <div className="mx-auto w-full max-w-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm mt-10 sm:mt-14">
          <Typography
            variant="h5"
            component="h2"
            align="center"
            fontWeight="bold"
            sx={{ mb: 3 }}
          >
            Sign in to your account
          </Typography>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <TextField
              name="username"
              type="text"
              required
              fullWidth
              label="Username"
              placeholder="your.name@uni.edu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />

            <TextField
              name="password"
              type="password"
              required
              fullWidth
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 1,
                borderRadius: 0,
                py: 1.2,
                bgcolor: "#000",
                "&:hover": { bgcolor: "#111" },
              }}
            >
              SIGN IN
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push("/portal")}
              sx={{
                borderRadius: 0,
                py: 1.1,
                borderColor: "#9CA3AF",
                color: "#111827",
                "&:hover": { borderColor: "#6B7280", bgcolor: "#F9FAFB" },
              }}
            >
              GO TO PORTAL
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
