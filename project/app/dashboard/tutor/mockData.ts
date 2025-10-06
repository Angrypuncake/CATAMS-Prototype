export const actions = [
  {
    session_date: "2025-09-09",
    time: "10:00 AM - 12:00 PM",
    unit: "MATH201",
    hours: 2,
    desc: "Calculus II tutorial",
    status: "Available",
    actions: "Claim",
  },
  {
    session_date: "2025-09-10",
    time: "1:00 PM - 3:00 PM",
    unit: "CS102",
    hours: 2,
    desc: "Intro to Programming lab",
    status: "Pending Request",
    actions: "View/Edit Request",
  },
  {
    session_date: "2025-09-11",
    time: "9:00 AM - 11:00 AM",
    unit: "CHEM110",
    hours: 2,
    desc: "Organic Chemistry tutorial",
    status: "Available",
    actions: "Claim",
  },
  {
    session_date: "2025-09-12",
    time: "3:00 PM - 5:00 PM",
    unit: "PHYS150",
    hours: 2,
    desc: "Classical Mechanics session",
    status: "Pending Request",
    actions: "View/Edit Request",
  },
  {
    session_date: "2025-09-13",
    time: "11:00 AM - 1:00 PM",
    unit: "PSYC101",
    hours: 2,
    desc: "Introduction to Psychology tutorial",
    status: "Available",
    actions: "Claim",
  },
];

export const request = [
  {
    requestID: "REQ001",
    type: "Swap",
    relatedSession: "CS101 - 2025-09-10 2:00 PM",
    status: "Pending",
    actions: "View/Edit Request",
  },
  {
    requestID: "REQ002",
    type: "Correction",
    relatedSession: "MATH202 - 2025-09-12 9:00 AM",
    status: "Approved",
    actions: "View/Edit Request",
  },
  {
    requestID: "REQ003",
    type: "Swap",
    relatedSession: "BIO105 - 2025-09-14 1:00 PM",
    status: "Pending",
    actions: "View/Edit Request",
  },
  {
    requestID: "REQ004",
    type: "Correction",
    relatedSession: "CHEM101 - 2025-09-09 11:00 AM",
    status: "Approved",
    actions: "View/Edit Request",
  },
  {
    requestID: "REQ005",
    type: "Swap",
    relatedSession: "PHYS110 - 2025-09-13 10:00 AM",
    status: "Pending",
    actions: "View/Edit Request",
  },
];

export const notices = [
  {
    session_date: "2025-09-09",
    type: "Reject",
    message: "TA Rejected REQ008",
    actions: "View/Edit Request",
  },
  {
    session_date: "2025-09-09",
    type: "Approve",
    message: "UC Approved REQ009",
    actions: "View/Edit Request",
  },
];
