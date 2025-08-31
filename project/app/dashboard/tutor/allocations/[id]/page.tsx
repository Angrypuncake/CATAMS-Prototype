"use client";

// ------------ Types ------------
type RequestType = "Swap" | "Correction" | "Extension" | "Cancellation";
type RequestState = "Pending Review" | "Approved" | "Rejected";

interface AllocationDetail {
  id: string;
  courseCode: string;
  courseName: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  date: string;
  time: string;
  location: string;
  hours: string;
  session: string;
  notes?: string;
}

interface RequestItem {
  id: number;
  type: RequestType;
  state: RequestState;
}

interface CommentItem {
  id: number;
  author: string;
  role: string;
  time: string;
  body: string;
  mine?: boolean; // whether current user wrote this
}

// ---------- Mock data ----------
const mockAllocation: AllocationDetail = {
  id: "123",
  courseCode: "INFO1110",
  courseName: "Programming Fundamentals",
  status: "Confirmed",
  date: "12/09/2025",
  time: "9:00 AM – 11:00 AM",
  location: "Room A",
  hours: "2h",
  session: "Tutorial",
  notes:
    "“Please arrive 10 minutes early to assist with setup. Ensure attendance sheet is completed”",
};

const mockRequests: RequestItem[] = [
  { id: 123, type: "Swap", state: "Pending Review" },
  { id: 124, type: "Correction", state: "Pending Review" },
];

const mockComments: CommentItem[] = [
  {
    id: 1,
    author: "John D.",
    role: "Tutor",
    time: "26/08/25, 2:14 PM",
    body: "Hi, I just noticed this clashes with another lab I’m running in INFO1910. Could I request a swap?",
    mine: true, //Show Edit/Delete buttons if the logged-in user wrote this comment
  },
  {
    id: 2,
    author: "Sarah T.",
    role: "Teaching Assistant",
    time: "26/08/25, 3:02 PM",
    body: "Thanks John, I’ve flagged this as a pending swap. Please submit a formal request via the system so I can process it.",
  },
  {
    id: 3,
    author: "John D.",
    role: "Tutor",
    time: "26/08/25, 3:15 PM",
    body: "Submitted now under Request #123. Let me know if you need further details.",
    mine: true, //Show Edit/Delete buttons if the logged-in user wrote this comment
  },
  {
    id: 4,
    author: "Unit Coordinator – Dr. Lee",
    role: "",
    time: "27/08/25, 9:20 AM",
    body: "Request acknowledged. I’ll review availability in Room B and confirm by tomorrow.",
  },
];
