"use client";

import {
  Box,
  Typography,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#f7f7f7]">
      <main className="max-w-screen-2xl mx-auto px-4">
        <Paper
          elevation={0}
          className="mx-auto w-full max-w-4xl border border-gray-200 bg-white shadow-sm mt-10 sm:mt-14"
          sx={{ p: { xs: 3, sm: 5 }, borderRadius: 0 }}
        >
          {/* Header */}
          <Box textAlign="center" sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              CATAMS — Help & User Guide
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Tutor Allocation Management System
            </Typography>
          </Box>

          {/* Accent bar */}
          <Box
            sx={{
              height: 4,
              width: 72,
              mx: "auto",
              my: 2,
              bgcolor: "#f97316", // subtle orange accent used in portal cards
            }}
          />

          {/* Overview */}
          <section>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Overview
            </Typography>
            <Typography paragraph>
              CATAMS helps coordinators plan and assign teaching activities,
              tutors track their work, and administrators keep data consistent
              across the semester. This guide explains the core screens and
              common actions.
            </Typography>
          </section>

          <Divider sx={{ my: 3 }} />

          {/* Getting Started (public help, no auth promises) */}
          <section>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Getting Started
            </Typography>
            <Typography paragraph>
              Use the <b>Portal</b> to choose the area that matches your role.
              If you don’t have an account or can’t access a page listed below,
              contact support.
            </Typography>
            <Box textAlign="center" sx={{ mt: 1 }}>
              <Button
                variant="contained"
                onClick={() => router.push("/portal")}
                sx={{
                  borderRadius: 0,
                  bgcolor: "#292524",
                  "&:hover": { bgcolor: "#111" },
                  px: 3,
                  py: 1,
                }}
              >
                Go to Portal
              </Button>
            </Box>
          </section>

          <Divider sx={{ my: 4 }} />

          {/* Roles & Access (no deep links, just pages they can access) */}
          <section>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Roles & Access
            </Typography>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                <Typography fontWeight="bold">Tutor</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Access: Tutor Dashboard, My Allocations, Requests
                  (Swap/Cancellation), Claims
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                <Typography fontWeight="bold">Teaching Assistant</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Access: Assistant Dashboard, Session Support, Review Tasks (as
                  assigned)
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                <Typography fontWeight="bold">Coordinator</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Access: Coordinator Dashboard, Manual/Unscheduled Allocation,
                  Request Review, Unit Offerings
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                <Typography fontWeight="bold">System Admin</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Access: Admin Dashboard, User Management, Data Consistency,
                  System Settings
                </Typography>
              </Paper>
            </Box>
          </section>

          <Divider sx={{ my: 4 }} />

          {/* Common actions (kept high-level per your constraints) */}
          <section>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Common Actions
            </Typography>

            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                <Typography fontWeight="bold">
                  Create a Manual Allocation
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Coordinators can create unscheduled activities and assign
                  tutors with defined hours and notes for tracking and approval.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                <Typography fontWeight="bold">Submit a Request</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Tutors can request a swap or cancellation for an allocation
                  with a reason and optional supporting details.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                <Typography fontWeight="bold">Review Requests</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Coordinators review request context, verify allocation
                  details, and approve or reject with a short decision note.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                <Typography fontWeight="bold">Manage Users & Data</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Admins can add/update users and keep allocation/activity
                  records consistent across the term.
                </Typography>
              </Paper>
            </Box>
          </section>

          <Divider sx={{ my: 4 }} />

          {/* Status glossary */}
          <section>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Status Glossary
            </Typography>
            <Box className="flex flex-wrap gap-1.5 mb-2">
              <Chip label="Draft" size="small" variant="outlined" />
              <Chip label="Approved" size="small" variant="outlined" />
              <Chip label="Claimed" size="small" variant="outlined" />
              <Chip label="Cancelled" size="small" variant="outlined" />
            </Box>
            <Typography color="text.secondary">
              <b>Draft</b> — created but not finalized; <b>Approved</b> —
              authorized and ready to action; <b>Claimed</b> — included in a
              tutor claim; <b>Cancelled</b> — no longer active or valid.
            </Typography>
          </section>

          <Divider sx={{ my: 4 }} />

          {/* Terminology */}
          <section>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Terminology
            </Typography>
            <Box className="space-y-1.5">
              <Term label="Allocation">
                A unit of assigned work (hours, activity type, tutor, notes)
                that may be scheduled or unscheduled.
              </Term>
              <Term label="Teaching Activity">
                A class of work (e.g., Tutorial, Lecture, Marking, Consultation)
                associated with a unit offering.
              </Term>
              <Term label="Session Occurrence">
                A specific instance of a teaching activity (e.g., Week 3
                Tutorial, Thu 2pm).
              </Term>
              <Term label="Unit Offering">
                A course unit in a particular year/session (e.g., INFO1111, 2025
                S1).
              </Term>
            </Box>
          </section>

          <Divider sx={{ my: 4 }} />

          {/* FAQ (kept lean) */}
          <section>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Frequently Asked Questions
            </Typography>

            <Accordion disableGutters sx={{ borderRadius: 0 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Why don’t I see a page listed under my role?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  Your account may not have the required permissions yet.
                  Contact support with your name, Uni email, and role so we can
                  enable access.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters sx={{ borderRadius: 0 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  How do I know if an allocation is active?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  Check the status shown alongside the allocation.{" "}
                  <b>Approved</b> indicates it’s ready; <b>Cancelled</b> items
                  are inactive; <b>Draft</b> means it’s still being prepared.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </section>

          <Divider sx={{ my: 4 }} />

          {/* Contact */}
          <section>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Need More Help?
            </Typography>
            <Typography color="text.secondary" paragraph>
              Email <b>support@catams.example.edu</b> with your name, Uni email,
              and a short description of the issue.
            </Typography>
            <Box textAlign="center">
              <Button
                variant="outlined"
                onClick={() => router.push("/portal")}
                sx={{
                  borderRadius: 0,
                  py: 1.1,
                  borderColor: "#9CA3AF",
                  color: "#111827",
                  "&:hover": { borderColor: "#6B7280", bgcolor: "#F9FAFB" },
                }}
              >
                Return to Portal
              </Button>
            </Box>
          </section>
        </Paper>
      </main>
    </div>
  );
}

/** Small helper for consistent term rows */
function Term({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography component="span" fontWeight="bold">
        {label}:{" "}
      </Typography>
      <Typography component="span" color="text.secondary">
        {children}
      </Typography>
    </Box>
  );
}
