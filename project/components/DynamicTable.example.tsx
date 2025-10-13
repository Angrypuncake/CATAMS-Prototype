/**
 * Example usage of the generic DynamicTable component
 * This file demonstrates how to use DynamicTable with strongly-typed data
 */

import DynamicTable, { TableRowData } from "./DynamicTable/DynamicTable";

interface UserData {
  name: string;
  age: number;
  email: string;
  isActive: boolean;
}

const users: TableRowData<UserData>[] = [
  {
    id: 1,
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    isActive: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    email: "jane@example.com",
    isActive: false,
  },
];

export function UserTable() {
  return <DynamicTable<UserData> rows={users} />;
}

interface AllocationData {
  unit_code: string;
  tutor_name: string;
  hours: number;
  start_date: Date;
  status: string;
  activities: string[];
  metadata: {
    department: string;
    year: number;
  };
}

const allocations: TableRowData<AllocationData>[] = [
  {
    id: 1,
    unit_code: "COMP3888",
    tutor_name: "Alice Johnson",
    hours: 20,
    start_date: new Date("2025-01-15"),
    status: "active",
    activities: ["Lecture", "Tutorial", "Lab"],
    metadata: {
      department: "Computer Science",
      year: 2025,
    },
  },
  {
    id: 2,
    unit_code: "SOFT3888",
    tutor_name: "Bob Williams",
    hours: 15,
    start_date: new Date("2025-02-01"),
    status: "pending",
    activities: ["Tutorial"],
    metadata: {
      department: "Software Engineering",
      year: 2025,
    },
  },
];

export function AllocationTable() {
  return (
    <DynamicTable<AllocationData>
      rows={allocations}
      columns={[
        { key: "unit_code", label: "Unit Code" },
        { key: "tutor_name", label: "Tutor" },
        { key: "hours", label: "Hours" },
        { key: "start_date", label: "Start Date" },
        { key: "status", label: "Status" },
        { key: "activities", label: "Activities" },
      ]}
      maxChips={3}
      defaultRowsPerPage={10}
    />
  );
}

// Example 3: Using custom column renderers
import { Chip } from "@mui/material";

export function AllocationTableWithCustomRenderers() {
  return (
    <DynamicTable<AllocationData>
      rows={allocations}
      columnRenderers={{
        status: (value) => (
          <Chip
            label={String(value)}
            color={value === "active" ? "success" : "warning"}
            size="small"
          />
        ),
        hours: (value) => <strong>{String(value)} hrs</strong>,
      }}
    />
  );
}

// Example 4: Without pagination
export function SimpleTable() {
  return <DynamicTable<UserData> rows={users} enablePagination={false} />;
}
