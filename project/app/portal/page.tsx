"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Typography, Card, CardContent, CardActions } from "@mui/material";
import CatamsNav from "@/components/CatamsNav";
import axios from "axios";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const dashboards = [
  {
    title: "Tutor",
    description: "View your sessions, allocations, and marking tasks.",
    icon: <SchoolIcon fontSize="large" />,
    href: "/dashboard/tutor",
    accent: "#0b3a74",
  },
  {
    title: "Teaching Assistant",
    description: "Handle session support and approvals.",
    icon: <GroupsIcon fontSize="large" />,
    href: "/dashboard/assistant",
    accent: "#f0b429",
  },
  {
    title: "Coordinator",
    description: "Overview budget, approve hours, and manage staffing.",
    icon: <EventAvailableIcon fontSize="large" />,
    href: "/dashboard/coordinator",
    accent: "#2f7d32",
  },
  {
    title: "System Admin",
    description: "User management, data operations, and system settings.",
    icon: <AdminPanelSettingsIcon fontSize="large" />,
    href: "/dashboard/admin",
    accent: "#e46d0a",
  },
];

export default function PortalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f9fc]">
      {/* EXACT 1cm gap on both sides */}
      <CatamsNav
        logoSrc="/usyd_logo.png"
        rightTitle="CATAMS"
        actions={[
          { label: "HELP", href: "/help" },
          { label: "Logout", onClick: handleLogout },
        ]}
        edgeGapCm={1}
        maxWidthClass="max-w-screen-2xl"
      />

      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        <header className="mb-6">
          <Typography
            variant="h4"
            component="h1"
            fontWeight={800}
            sx={{ lineHeight: 1.15, letterSpacing: "-0.01em" }}
          >
            Casual Academic Time Allocation System
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 900, mt: 1 }}
          >
            One portal for coordinators, TAs, admins, and tutors to view
            schedules and manage teaching allocations
          </Typography>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dashboards.map((d) => (
            <Card
              key={d.title}
              elevation={4}
              sx={{ borderRadius: 2, overflow: "hidden" }}
            >
              <div style={{ height: 6, backgroundColor: d.accent }} />
              <CardContent sx={{ textAlign: "center", pt: 3 }}>
                <div style={{ color: d.accent, display: "flex", justifyContent: "center" }}>
                  {d.icon}
                </div>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                  {d.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {d.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  component={Link}
                  href={d.href}
                  variant="contained"
                  sx={{ borderRadius: 1 }}
                >
                  Enter
                </Button>
              </CardActions>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
