"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField, Typography } from "@mui/material";
import axios from "axios";
import CatamsNav from "@/components/CatamsNav"; // adjust if your filename differs

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
        { withCredentials: true }
      );
      if (result.data.success) router.push("/portal");
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Login failed: ${error.response.data.error}`);
      } else {
        alert("Login failed: Network error");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7]">
      {/* USYD-style nav with fixed side gutters */}
      <CatamsNav
        logoSrc="/usyd_logo.png"
        rightTitle="CATAMS"
        actions={[{ label: "HELP" }]}
        containerClass="mx-[1cm]"
        logoClass="h-12"
      />

      {/* Login card */}
      <main className="w-full flex justify-center">
        <div className="mt-10 mb-16 w-full max-w-[520px] bg-white shadow-sm border border-gray-200 px-8 py-9">
          <Typography
            variant="h5"
            component="h2"
            align="center"
            fontWeight="bold"
            sx={{ mb: 4 }}
          >
            Sign in to your account
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* EXTRA space specifically between username & password */}
            <div className="space-y-8">
              <TextField
                name="username"
                type="text"
                required
                fullWidth
                label="Username *"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                name="password"
                type="password"
                required
                fullWidth
                label="Password *"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Keep button spacing as before */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3.5, py: 1.3 }}
            >
              SIGN IN
            </Button>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2, py: 1.15 }}
              onClick={() => router.push("/portal")}
            >
              GO TO PORTAL
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
