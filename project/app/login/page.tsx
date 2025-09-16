"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField, Typography } from "@mui/material";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await axios.post(
        "/api/auth/login",
        {
          useremail: username,
          password: password,
        },
        {
          withCredentials: true,
        },
      );

      if (result.data.success) {
        console.log("Login successful:", result.data);
        router.push("/portal");
      }
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
    <div className="min-h-screen flex w-full items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full mx-4 space-y-8 bg-white p-8 rounded-lg shadow-lg flex flex-col gap-3">
        <Typography
          variant="h4"
          component="h2"
          align="center"
          fontWeight="bold"
        >
          Sign in to your account
        </Typography>
        <form
          className="mt-8 space-y-6 flex flex-col gap-3"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <TextField
              name="username"
              type="text"
              required
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
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
            />
          </div>
          <Button type="submit" variant="contained" fullWidth>
            Sign in
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
  );
}
