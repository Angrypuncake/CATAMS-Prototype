"use client";
import React, { useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const Page = () => {
  const [adminView, setAdminView] = useState({
    numUsers: 0,
    numAllocations: 0,
    numPendingErrors: 0,
    numBudgetLoaded: 0,
  });

  const [tutorRows, setTutorRows] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      role: "Tutor",
      unitsEnrolled: 2,
      status: "Active",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob.smith@example.com",
      role: "Tutor",
      unitsEnrolled: 1,
      status: "Inactive",
    },
    {
      id: 3,
      name: "Catherine Lee",
      email: "catherine.lee@example.com",
      role: "Senior Tutor",
      unitsEnrolled: 3,
      status: "Active",
    },
    {
      id: 4,
      name: "Daniel Kim",
      email: "daniel.kim@example.com",
      role: "Tutor",
      unitsEnrolled: 0,
      status: "Pending",
    },
  ]);

  useEffect(() => {
    setAdminView(...[adminView]);
  }, []);
  return (
    <div className="h-screen flex flex-col w-[80%] gap-5">
      <div className="flex justify-around mt-20 w-full">
        <div>
          <div>
            <Typography variant="h3">System Admin Dashboard</Typography>
            <Typography variant="body1">
              Data operations, integrity checks, and system configuration.
            </Typography>
          </div>
        </div>

        <div className="gap-2 flex">
          <Button variant="secondary">Refresh</Button>
          <Button variant="secondary" color="blue">
            Bulk Import Allocations
          </Button>
        </div>
      </div>
      <div className="flex gap-8 justify-center w-full">
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
          <div className="flex flex-col">
            <Typography>Users</Typography>
            <Typography variant="h3">{adminView.numUsers}</Typography>
          </div>
          <div>
            <Button variant="bubble">directory</Button>
          </div>
        </div>
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
          <div className="flex flex-col">
            <Typography>Allocations</Typography>
            <Typography variant="h3">{adminView.numAllocations}</Typography>
          </div>
          <div>
            <Button variant="bubble">current term</Button>
          </div>
        </div>
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
          <div className="flex flex-col">
            <Typography>Pending Errors</Typography>
            <Typography variant="h3">{adminView.numPendingErrors}</Typography>
          </div>
          <div>
            <Button variant="bubble" color="red">
              attention
            </Button>
          </div>
        </div>
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-center rounded-2xl">
          <div className="flex flex-col">
            <Typography>Budgets Loaded</Typography>
            <Typography variant="h3">{adminView.numBudgetLoaded}</Typography>
          </div>
          <div>
            <Button variant="bubble" color="green">
              ok
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center h-full gap-4 w-full">
        <div className="w-1/3 h-1/3 bg-white rounded-3xl p-3">
          <Typography variant="subtitle1">Budgets Loaded</Typography>
          <div>
            <div className="rounded-2xl border border-[#e3e3e3] p-2 flex justify-between items-center">
              <div>
                <Typography variant="h5">Allocations CSV</Typography>
                <Typography variant="body1">
                  Upload + preview in timetable
                </Typography>
              </div>

              <Button variant="secondary" color="blue">
                Open
              </Button>
            </div>
          </div>
        </div>

        <div className="w-2/3 h-full  rounded-3xl flex flex-col gap-4">
          <div className="h-[12%] bg-white rounded-3xl p-3">
            <Typography variant="subtitle1">Validation Reports</Typography>

            <div>
              <Button variant="secondary" color="red">
                Invalid Tutor Emails {`(4)`}
              </Button>
            </div>
          </div>

          <div className="h-[30%] bg-white rounded-3xl p-3">
            <Typography>asd</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Units Enrolled</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tutorRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.unitsEnrolled}</TableCell>
                      <TableCell>{row.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div className="h-[30%] bg-white rounded-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Page;
