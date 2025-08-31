"use client";
import React from "react";
import { Button, Typography } from "@mui/material";
import DynamicTable from "../../../components/DynamicTable";

const page = () => {
  const adminView = {
    numUsers: 0,
    numAllocations: 0,
    numPendingErrors: 0,
    numBudgetLoaded: 0,
  };

  const tutorRows = [
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
  ];

  return (
    <div className="h-screen flex flex-col w-[90%] gap-3">
      <div className="flex justify-around mt-15 w-full">
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
      <div className="flex gap-3 justify-center w-full">
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
          <div className="flex flex-col">
            <Typography>Users</Typography>
            <Typography variant="h4">{adminView.numUsers}</Typography>
          </div>
          <div>
            <Button variant="bubble">directory</Button>
          </div>
        </div>
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
          <div className="flex flex-col">
            <Typography>Allocations</Typography>
            <Typography variant="h4">{adminView.numAllocations}</Typography>
          </div>
          <div>
            <Button variant="bubble">current term</Button>
          </div>
        </div>
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
          <div className="flex flex-col">
            <Typography>Pending Errors</Typography>
            <Typography variant="h4">{adminView.numPendingErrors}</Typography>
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
            <Typography variant="h4">{adminView.numBudgetLoaded}</Typography>
          </div>
          <div>
            <Button variant="bubble" color="green">
              ok
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center h-full gap-3 w-full">
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

        <div className="w-2/3 h-full  rounded-3xl flex flex-col gap-3">
          <div className="h-[20%] bg-white rounded-3xl p-3">
            <Typography variant="subtitle1">Validation Reports</Typography>

            <div>
              <Button variant="secondary" color="red">
                Invalid Tutor Emails {`(4)`}
              </Button>
            </div>
          </div>

          <div className="h-[37%] bg-white rounded-3xl p-3">
            <Typography variant="subtitle1">User & Role Management</Typography>
            <DynamicTable rows={tutorRows} />
          </div>

          <div className="h-[37%] bg-white rounded-3xl p-3">
            <Typography variant="subtitle1">Recent Import&Exports</Typography>
            <DynamicTable rows={tutorRows} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
