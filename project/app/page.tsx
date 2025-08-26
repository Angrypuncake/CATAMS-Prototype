"use client";
import { useState } from "react";
import { Button } from "@mui/material";

export default function Home() {
  const [response, setResponse] = useState("");

  async function sendMessage() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello from frontend!" }),
    });

    const data = await res.json();
    setResponse(data.reply);
  }
  return (
    <div>
      <h1>welcome to the home page</h1>
      Click the button here
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Send Message to Backend
      </button>
      <Button>Sample MUI Button</Button>
    </div>
  );
}
