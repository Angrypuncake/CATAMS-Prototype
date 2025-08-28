"use client";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/portal");
  // For the sake of demoing, redirect to /portal.
  // In the final product this should redirect to /login
}
