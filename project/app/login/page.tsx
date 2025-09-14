"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO connect to backend
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full mx-4 space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
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
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

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
