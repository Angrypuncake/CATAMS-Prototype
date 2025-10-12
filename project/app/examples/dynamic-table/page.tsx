"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DynamicTable, { TableRowData } from "@/components/DynamicTable";

// Table 1: Student Performance Data
interface StudentPerformance {
  student_id: string;
  full_name: string;
  course: string;
  gpa: number;
  credits_completed: number;
  enrollment_date: Date;
  is_international: boolean;
  majors: string[];
  contact: {
    email: string;
    phone: string;
  };
}

const studentData: TableRowData<StudentPerformance>[] = [
  {
    id: 1,
    student_id: "STU001",
    full_name: "Emma Thompson",
    course: "Computer Science",
    gpa: 3.85,
    credits_completed: 96,
    enrollment_date: new Date("2022-02-15"),
    is_international: false,
    majors: ["Software Engineering", "AI"],
    contact: {
      email: "emma.thompson@uni.edu",
      phone: "+61-2-1234-5678",
    },
  },
  {
    id: 2,
    student_id: "STU002",
    full_name: "Liam Chen",
    course: "Information Systems",
    gpa: 3.92,
    credits_completed: 108,
    enrollment_date: new Date("2021-07-20"),
    is_international: true,
    majors: ["Data Science"],
    contact: {
      email: "liam.chen@uni.edu",
      phone: "+61-2-2345-6789",
    },
  },
  {
    id: 3,
    student_id: "STU003",
    full_name: "Sophia Martinez",
    course: "Computer Science",
    gpa: 3.67,
    credits_completed: 84,
    enrollment_date: new Date("2022-08-01"),
    is_international: false,
    majors: ["Cybersecurity", "Networks", "Cloud Computing"],
    contact: {
      email: "sophia.m@uni.edu",
      phone: "+61-2-3456-7890",
    },
  },
  {
    id: 4,
    student_id: "STU004",
    full_name: "Noah Patel",
    course: "Software Engineering",
    gpa: 3.45,
    credits_completed: 72,
    enrollment_date: new Date("2023-01-10"),
    is_international: true,
    majors: ["Mobile Development"],
    contact: {
      email: "noah.patel@uni.edu",
      phone: "+61-2-4567-8901",
    },
  },
  {
    id: 5,
    student_id: "STU005",
    full_name: "Olivia Kim",
    course: "Data Science",
    gpa: 3.98,
    credits_completed: 120,
    enrollment_date: new Date("2021-02-01"),
    is_international: true,
    majors: ["Machine Learning", "Statistics"],
    contact: {
      email: "olivia.kim@uni.edu",
      phone: "+61-2-5678-9012",
    },
  },
  {
    id: 6,
    student_id: "STU006",
    full_name: "Ethan Rodriguez",
    course: "Computer Science",
    gpa: 3.72,
    credits_completed: 90,
    enrollment_date: new Date("2022-03-15"),
    is_international: false,
    majors: ["Game Development"],
    contact: {
      email: "ethan.r@uni.edu",
      phone: "+61-2-6789-0123",
    },
  },
  {
    id: 7,
    student_id: "STU007",
    full_name: "Ava Nguyen",
    course: "Information Technology",
    gpa: 3.55,
    credits_completed: 78,
    enrollment_date: new Date("2022-09-01"),
    is_international: true,
    majors: ["Web Development", "UX Design"],
    contact: {
      email: "ava.nguyen@uni.edu",
      phone: "+61-2-7890-1234",
    },
  },
  {
    id: 8,
    student_id: "STU008",
    full_name: "William Johnson",
    course: "Software Engineering",
    gpa: 3.88,
    credits_completed: 102,
    enrollment_date: new Date("2021-08-20"),
    is_international: false,
    majors: ["DevOps", "Cloud Infrastructure"],
    contact: {
      email: "will.j@uni.edu",
      phone: "+61-2-8901-2345",
    },
  },
];

// Table 2: Project Assignment Data
interface ProjectAssignment {
  project_code: string;
  title: string;
  team_size: number;
  budget_allocated: number;
  start_date: Date;
  deadline: Date;
  status: "Not Started" | "In Progress" | "Completed" | "On Hold";
  technologies: string[];
  priority: number;
  client_info: {
    company: string;
    industry: string;
  };
  requires_approval: boolean;
}

const projectData: TableRowData<ProjectAssignment>[] = [
  {
    id: 1,
    project_code: "PRJ-2025-001",
    title: "E-Commerce Platform Redesign",
    team_size: 8,
    budget_allocated: 125000,
    start_date: new Date("2025-01-15"),
    deadline: new Date("2025-06-30"),
    status: "In Progress",
    technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
    priority: 1,
    client_info: {
      company: "TechMart Retail",
      industry: "E-Commerce",
    },
    requires_approval: true,
  },
  {
    id: 2,
    project_code: "PRJ-2025-002",
    title: "Mobile Banking App",
    team_size: 12,
    budget_allocated: 250000,
    start_date: new Date("2025-02-01"),
    deadline: new Date("2025-12-31"),
    status: "In Progress",
    technologies: ["React Native", "Firebase", "Stripe", "MongoDB"],
    priority: 1,
    client_info: {
      company: "SecureBank",
      industry: "Finance",
    },
    requires_approval: true,
  },
  {
    id: 3,
    project_code: "PRJ-2025-003",
    title: "Healthcare Records System",
    team_size: 15,
    budget_allocated: 450000,
    start_date: new Date("2024-11-01"),
    deadline: new Date("2025-10-31"),
    status: "In Progress",
    technologies: ["Angular", "Java Spring", "MySQL", "Azure", "Docker"],
    priority: 1,
    client_info: {
      company: "MediCare Plus",
      industry: "Healthcare",
    },
    requires_approval: true,
  },
  {
    id: 4,
    project_code: "PRJ-2025-004",
    title: "AI Chatbot Integration",
    team_size: 5,
    budget_allocated: 75000,
    start_date: new Date("2025-03-01"),
    deadline: new Date("2025-05-31"),
    status: "Not Started",
    technologies: ["Python", "TensorFlow", "OpenAI API", "FastAPI"],
    priority: 2,
    client_info: {
      company: "CustomerFirst Inc",
      industry: "Customer Service",
    },
    requires_approval: false,
  },
  {
    id: 5,
    project_code: "PRJ-2025-005",
    title: "Inventory Management Dashboard",
    team_size: 6,
    budget_allocated: 95000,
    start_date: new Date("2024-12-01"),
    deadline: new Date("2025-04-30"),
    status: "In Progress",
    technologies: ["Vue.js", "Express", "Redis", "GraphQL"],
    priority: 2,
    client_info: {
      company: "LogisTech Solutions",
      industry: "Logistics",
    },
    requires_approval: false,
  },
  {
    id: 6,
    project_code: "PRJ-2024-089",
    title: "Legacy System Migration",
    team_size: 10,
    budget_allocated: 180000,
    start_date: new Date("2024-08-15"),
    deadline: new Date("2025-02-28"),
    status: "Completed",
    technologies: ["Java", "Kubernetes", "Microservices", "Jenkins"],
    priority: 1,
    client_info: {
      company: "OldTech Corp",
      industry: "Manufacturing",
    },
    requires_approval: true,
  },
  {
    id: 7,
    project_code: "PRJ-2025-006",
    title: "Social Media Analytics Tool",
    team_size: 7,
    budget_allocated: 110000,
    start_date: new Date("2025-02-15"),
    deadline: new Date("2025-08-15"),
    status: "Not Started",
    technologies: ["Python", "Django", "Elasticsearch", "D3.js"],
    priority: 3,
    client_info: {
      company: "BrandBoost Marketing",
      industry: "Marketing",
    },
    requires_approval: false,
  },
  {
    id: 8,
    project_code: "PRJ-2025-007",
    title: "Video Streaming Platform",
    team_size: 20,
    budget_allocated: 600000,
    start_date: new Date("2025-01-01"),
    deadline: new Date("2026-01-01"),
    status: "In Progress",
    technologies: ["Next.js", "WebRTC", "FFmpeg", "Cloudflare", "Redis"],
    priority: 1,
    client_info: {
      company: "StreamNow Entertainment",
      industry: "Media & Entertainment",
    },
    requires_approval: true,
  },
  {
    id: 9,
    project_code: "PRJ-2024-092",
    title: "Internal HR Portal",
    team_size: 4,
    budget_allocated: 45000,
    start_date: new Date("2024-10-01"),
    deadline: new Date("2024-12-31"),
    status: "Completed",
    technologies: ["React", "Express", "MongoDB"],
    priority: 3,
    client_info: {
      company: "Internal",
      industry: "HR",
    },
    requires_approval: false,
  },
  {
    id: 10,
    project_code: "PRJ-2025-008",
    title: "IoT Sensor Network",
    team_size: 9,
    budget_allocated: 220000,
    start_date: new Date("2025-03-15"),
    deadline: new Date("2025-11-30"),
    status: "On Hold",
    technologies: ["C++", "MQTT", "InfluxDB", "Grafana", "Raspberry Pi"],
    priority: 2,
    client_info: {
      company: "SmartCity Initiative",
      industry: "Smart Cities",
    },
    requires_approval: true,
  },
];

export default function DynamicTableExamplesPage() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("info");

  const showMessage = (
    message: string,
    severity: "success" | "info" | "warning" | "error" = "info",
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
        DynamicTable Component Examples
      </Typography>

      {/* Table 1: Student Performance */}
      <Paper elevation={2} sx={{ mb: 6, p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Table 1: Student Performance Data with Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This table displays 8 students with their academic performance
          metrics, enrollment details, and contact information. Features
          automatic date formatting, array rendering for majors, and object
          inspection for contact details.{" "}
          <strong>
            Try searching for &quot;Computer Science&quot;, &quot;3.9&quot;, or
            &quot;international&quot;!
          </strong>
          <br />
          <strong>Action buttons: </strong> View, Edit, and Delete buttons
          demonstrate the actions feature.
          <br />
          <strong>Sorting: </strong> Click any column header to sort. Initially
          sorted by GPA (descending).
        </Typography>
        <DynamicTable<StudentPerformance>
          rows={studentData}
          columns={[
            { key: "student_id", label: "Student ID" },
            { key: "full_name", label: "Name" },
            { key: "course", label: "Course" },
            { key: "gpa", label: "GPA" },
            { key: "credits_completed", label: "Credits" },
            { key: "enrollment_date", label: "Enrolled" },
            { key: "is_international", label: "International" },
            { key: "majors", label: "Majors" },
          ]}
          actions={[
            {
              label: "View",
              icon: <VisibilityIcon fontSize="small" />,
              onClick: (row) =>
                showMessage(`Viewing student: ${row.full_name}`, "info"),
              variant: "outlined",
              color: "primary",
            },
            {
              label: "Edit",
              icon: <EditIcon fontSize="small" />,
              onClick: (row) =>
                showMessage(`Editing student: ${row.full_name}`, "info"),
              variant: "text",
              color: "secondary",
            },
            {
              label: "Delete",
              icon: <DeleteIcon fontSize="small" />,
              onClick: (row) =>
                showMessage(`Deleted student: ${row.full_name}`, "error"),
              variant: "text",
              color: "error",
              disabled: (row) => row.gpa > 3.9, // Can't delete high-performing students
            },
          ]}
          enableSearch={true}
          searchPlaceholder="Search students by name, course, major, or any field..."
          enableSorting={true}
          defaultSortColumn="gpa"
          defaultSortDirection="desc"
          maxChips={2}
          defaultRowsPerPage={5}
          rowsPerPageOptions={[5, 10, 15]}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Table 2: Project Assignments */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Table 2: Project Assignment Data with Conditional Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This table shows 10 projects with different statuses, budgets, and
          timelines. Includes technology stacks, client information, and
          priority levels. Demonstrates handling of multiple date fields, large
          arrays, and nested objects.{" "}
          <strong>
            Try searching for &quot;React&quot;, &quot;In Progress&quot;, or
            &quot;Finance&quot;!
          </strong>
          <br />
          <strong>Action buttons: </strong> Approve/Cancel buttons are disabled
          for completed projects.
          <br />
          <strong>Sorting: </strong> Click headers to sort by budget, dates,
          priority, etc. Initially sorted by deadline.
        </Typography>
        <DynamicTable<ProjectAssignment>
          rows={projectData}
          columns={[
            { key: "project_code", label: "Code" },
            { key: "title", label: "Project Title" },
            { key: "team_size", label: "Team" },
            { key: "budget_allocated", label: "Budget ($)" },
            { key: "start_date", label: "Start Date" },
            { key: "deadline", label: "Deadline" },
            { key: "status", label: "Status" },
            { key: "technologies", label: "Tech Stack" },
            { key: "priority", label: "Priority" },
          ]}
          actions={[
            {
              label: "Approve",
              icon: <CheckCircleIcon fontSize="small" />,
              onClick: (row) =>
                showMessage(`Approved project: ${row.title}`, "success"),
              variant: "contained",
              color: "success",
              disabled: (row) =>
                row.status === "Completed" || row.status === "On Hold",
            },
            {
              label: "Cancel",
              icon: <CancelIcon fontSize="small" />,
              onClick: (row) =>
                showMessage(`Cancelled project: ${row.title}`, "warning"),
              variant: "outlined",
              color: "warning",
              disabled: (row) => row.status === "Completed",
            },
          ]}
          enableSearch={true}
          searchPlaceholder="Search projects by title, status, technology, client, or any field..."
          enableSorting={true}
          defaultSortColumn="deadline"
          defaultSortDirection="asc"
          maxChips={3}
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>

      {/* Snackbar for action feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Additional Info */}
      <Box sx={{ mt: 4, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Features Demonstrated:
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>
              <strong>Type Safety:</strong> Both tables use generic types
              (StudentPerformance and ProjectAssignment) for full TypeScript
              support
            </li>
            <li>
              <strong>Action Buttons:</strong> Customizable action buttons with
              icons, colors, variants, and conditional disabled states. Each
              button can have its own callback function that receives the full
              row data
            </li>
            <li>
              <strong>Conditional Actions:</strong> Actions can be disabled
              based on row data (e.g., delete disabled for high-performing
              students, approve disabled for completed projects)
            </li>
            <li>
              <strong>Sorting:</strong> Click any column header to sort data.
              Automatic type-aware sorting for strings, numbers, dates, and
              booleans. Visual indicators show active sort column and direction.
              No callback functions needed - all built-in!
            </li>
            <li>
              <strong>Search Functionality:</strong> Real-time search across all
              fields including nested objects and arrays. Searches are
              case-insensitive and work with dates, strings, numbers, and
              booleans
            </li>
            <li>
              <strong>Date Handling:</strong> Automatic formatting with ISO
              tooltip on hover. Dates are searchable in their formatted form
            </li>
            <li>
              <strong>Primitive Types:</strong> Strings, numbers, and booleans
              rendered appropriately
            </li>
            <li>
              <strong>Arrays:</strong> Displayed as chips with overflow
              indicator (e.g., majors, technologies). All array items are
              searchable
            </li>
            <li>
              <strong>Objects:</strong> Nested objects with inspect button for
              detailed view. All nested values are searchable
            </li>
            <li>
              <strong>Pagination:</strong> Different page sizes for each table.
              Pagination updates automatically when searching
            </li>
            <li>
              <strong>Custom Column Labels:</strong> Readable headers for
              snake_case field names
            </li>
            <li>
              <strong>Empty States:</strong> Displays appropriate messages for
              no data or no search results
            </li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
}
