"use client";

import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

/* ------------ Minimal data (universal audience) ------------ */
const dashboards = [
  {
    title: "Tutor",
    description: "View your sessions, allocations, and marking tasks.",
    icon: <SchoolIcon fontSize="large" />,
    href: "/dashboard/tutor",
    accent: "primary",
  },
  {
    title: "Teaching Assistant",
    description: "Handle session support and approvals",
    icon: <GroupsIcon fontSize="large" />,
    href: "/dashboard/assistant",
    accent: "secondary",
  },
  {
    title: "Coordinator",
    description: "Overview budget, approve hours, and manage staffing.",
    icon: <EventAvailableIcon fontSize="large" />,
    href: "/dashboard/coordinator",
    accent: "success",
  },
  {
    title: "System Admin",
    description: "User management, data operations, and system settings.",
    icon: <AdminPanelSettingsIcon fontSize="large" />,
    href: "/dashboard/admin",
    accent: "warning",
  },
];

export default function PortalPage() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(33,150,243,0.12) 0%, rgba(33,150,243,0) 60%), radial-gradient(900px 500px at 110% 10%, rgba(156,39,176,0.10) 0%, rgba(156,39,176,0) 60%), linear-gradient(180deg, #f7f9fc 0%, #f7f9fc 100%)",
      }}
    >
      {/* Top bar (simple, universal) */}
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{ backdropFilter: "blur(8px)" }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Typography variant="h6" fontWeight={800}>
            CATAMS
          </Typography>
          <Chip
            label="University of Sydney"
            size="small"
            sx={{ ml: 1, fontWeight: 600 }}
          />
          <Box sx={{ flex: 1 }} />
          <Button component={Link} href="/help" size="small">
            Help
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero (neutral copy, no role bias, no admin CTAs) */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pt: { xs: 6, md: 8 },
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: { xs: "left", md: "left" },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1200 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight={800}
            sx={{ lineHeight: 1.1, letterSpacing: "-0.02em", mb: 1 }}
          >
            Casual Academic Time Allocation
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 720 }}
          >
            One portal for coordinators, TAs, admins, and tutors to view
            schedules and manage teaching allocations—simple and consistent
            across units.
          </Typography>
        </Box>
      </Box>

      {/* Role cards (no Grid, fully responsive with flexbox) */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
          }}
        >
          {dashboards.map((item) => (
            <Card
              key={item.title}
              sx={{
                flex: "1 1 260px",
                maxWidth: 320,
                borderRadius: 4,
                textAlign: "center",
                boxShadow: 4,
                overflow: "hidden",
                transition: "transform .25s, box-shadow .25s",
                "&:hover": { transform: "translateY(-6px)", boxShadow: 10 },
                // top accent
                "&:before": {
                  content: '""',
                  display: "block",
                  height: 6,
                  bgcolor: `${item.accent}.main`,
                },
              }}
            >
              <CardContent sx={{ pt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 1.5,
                    color: `${item.accent}.main`,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  component={Link}
                  href={item.href}
                  variant="contained"
                  sx={{ borderRadius: 2 }}
                >
                  Enter
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* Footer (minimal) */}
      <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} CATAMS — University of Sydney
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button component={Link} href="/privacy" size="small">
              Privacy
            </Button>
            <Button component={Link} href="/terms" size="small">
              Terms
            </Button>
            <Button component={Link} href="/support" size="small">
              Support
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
