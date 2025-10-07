"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField, Typography, Alert } from "@mui/material";
import axios from "axios";
import CatamsNav from "@/components/CatamsNav";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPending(true);

    try {
      const result = await axios.post(
        "/api/auth/login",
        { useremail: username, password },
        { withCredentials: true },
      );

      if (result.data?.success) {
        router.push("/portal");
        return;
      }

      setErrorMsg("Login failed. Please check your credentials and try again.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setErrorMsg(String(error.response.data.error));
      } else {
        setErrorMsg("Network error. Please try again.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {/* NAV: blue (logo + CATAMS), gold (HELP only). 
          CatamsNav defaults to /usyd_logo.png in /public if logoSrc not provided. */}
      <CatamsNav rightTitle="CATAMS" actions={[{ label: "HELP", href: "/help" }]} />

      {/* Center the login card below the header */}
      <div className="min-h-[calc(100vh-96px)] flex w-full items-center justify-center bg-gray-50 px-4 py-10">
        <div className="max-w-lg w-full space-y-6 bg-white p-8 rounded-lg shadow-lg">
          <Typography variant="h4" component="h1" align="center" fontWeight="bold">
            Sign in to your account
          </Typography>

          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              name="username"
              type="text"
              required
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              fullWidth
              autoComplete="username"
            />

            <TextField
              name="password"
              type="password"
              required
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              fullWidth
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={pending}
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push("/portal")}
            >
              Go to Portal
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
