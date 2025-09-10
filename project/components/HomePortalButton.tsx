"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomePortalButton() {
  const pathname = usePathname();
  if (!pathname) return null;
  // Hide the button on the portal itself
  if (pathname === "/portal") return null;

  return (
    <Link
      href="/portal"
      aria-label="Go to Portal"
      title="Go to Portal"
      className="fixed left-4 bottom-4 z-[1000] inline-flex h-12 w-12 items-center justify-center rounded-lg border bg-white shadow-md hover:bg-gray-50 active:scale-95 transition"
    >
      {/* Simple Home icon (SVG) */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
