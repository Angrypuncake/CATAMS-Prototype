"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import React from "react";

import {
  Box,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import CatamsNavbar from "@/components/CatamsNav";

/* ---------------------- Dashboard tiles ---------------------- */
type Tile = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  accent: "blue" | "gold" | "green" | "orange";
};

const tiles: Tile[] = [
  {
    title: "Tutor",
    description: "View your sessions, allocations, and marking tasks.",
    icon: <SchoolIcon fontSize="large" />,
    href: "/dashboard/tutor",
    accent: "blue",
  },
  {
    title: "Teaching Assistant",
    description: "Handle session support and approvals",
    icon: <GroupsIcon fontSize="large" />,
    href: "/dashboard/assistant",
    accent: "gold",
  },
  {
    title: "Coordinator",
    description: "Overview budget, approve hours, and manage staffing.",
    icon: <EventAvailableIcon fontSize="large" />,
    href: "/dashboard/coordinator",
    accent: "green",
  },
  {
    title: "System Admin",
    description: "User management, data operations, and system settings.",
    icon: <AdminPanelSettingsIcon fontSize="large" />,
    href: "/dashboard/admin",
    accent: "orange",
  },
];

const ACCENT: Record<Tile["accent"], string> = {
  blue: "#0b3a74",
  gold: "#f0b429",
  green: "#2e7d32",
  orange: "#ef6c00",
};

/* --------------------------- Page ---------------------------- */
export default function PortalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Same navbar as Login: blue + gold, centered, with margins on both sides */}
      <CatamsNavbar
        rightTitle="CATAMS"
        onHelp={() => router.push("/help")}
        onLogout={handleLogout}
        containerClass="max-w-[1100px]" // matches the login navbar width
      />

      {/* Content */}
      <main className="mx-auto w-full max-w-[1100px] px-4 py-10">
        {/* Hero */}
        <header className="mb-8">
          <Typography
            variant="h3"
            component="h1"
            fontWeight={800}
            sx={{ lineHeight: 1.1, letterSpacing: "-0.02em", mb: 1 }}
          >
            Casual Academic Time Allocation
          </Typography>
          <div className="inline-flex items-center gap-2">
            <Typography variant="h6" color="text.secondary">
              One portal for coordinators, TAs, admins, and tutors to view
              schedules and manage teaching allocations—simple and consistent
              across units.
            </Typography>
          </div>
        </header>

        {/* Tiles */}
        <section className="flex flex-wrap gap-4 md:gap-6">
          {tiles.map((t) => (
            <Card
              key={t.title}
              sx={{
                flex: "1 1 260px",
                maxWidth: 320,
                borderRadius: 3,
                textAlign: "center",
                boxShadow: 4,
                overflow: "hidden",
                transition: "transform .25s, box-shadow .25s",
                "&:hover": { transform: "translateY(-6px)", boxShadow: 10 },
              }}
            >
              {/* top accent bar */}
              <Box sx={{ height: 6, width: "100%", bgcolor: ACCENT[t.accent] }} />

              <CardContent sx={{ pt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 1.5,
                    color: ACCENT[t.accent],
                  }}
                >
                  {t.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {t.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  component={Link}
                  href={t.href}
                  variant="contained"
                  sx={{ borderRadius: 2 }}
                >
                  Enter
                </Button>
              </CardActions>
            </Card>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 text-gray-600">
          <Typography variant="body2">
            © {new Date().getFullYear()} CATAMS — University of Sydney
          </Typography>
          <div className="flex gap-3">
            <Button component={Link} href="/privacy" size="small">
              Privacy
            </Button>
            <Button component={Link} href="/terms" size="small">
              Terms
            </Button>
            <Button component={Link} href="/support" size="small">
              Support
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}
