"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField, Typography } from "@mui/material";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO connect to backend
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full mx-4 space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            fontWeight="bold"
            sx={{ mt: 3, mb: 3 }}
          >
            Sign in to your account
          </Typography>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <TextField
              id="username"
              name="username"
              type="text"
              required
              fullWidth
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
            />
            <TextField
              id="password"
              name="password"
              type="password"
              required
              fullWidth
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              variant="contained"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
          <div>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push("/portal")}
              sx={{ mt: 2 }}
            >
              Go to Portal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
