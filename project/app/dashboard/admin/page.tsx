"use client";
import React from "react";
import { Button, Typography } from "@mui/material";
import DynamicTable from "../../../components/DynamicTable";
import { useEffect } from "react";
import axios from "axios";
import AdminInfoBox from "./AdminInfoBox";
import AdminBudgetBox from "./AdminBudgetBox";

const AdminDashboard = () => {
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

  const fetchUsers = async () => {
    try {
      const limit = 10;
      const page = 1;
      const result = await axios.get("/api/tutor/allocations", {
        params: { page, limit },
      });
      console.log(result.data);
    } catch (error) {
      console.log("error while fetching users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
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
        <AdminInfoBox
          adminStatistic={adminView.numUsers}
          title="User"
          bubbleText="directory"
        />
        <AdminInfoBox
          adminStatistic={adminView.numAllocations}
          title="Allocations"
          bubbleText="current term"
        />
      </div>

      <div className="flex justify-center h-full gap-3 w-full">
        <div className="w-1/3 h-1/3 bg-white rounded-3xl p-3">
          <Typography variant="subtitle1">Budgets Loaded</Typography>
          <AdminBudgetBox
            title="Allocations CSV"
            description="Upload + preview in timetable"
            href=""
          />
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
            <div className="flex justify-between items-center">
              <Typography variant="subtitle1">
                User & Role Management
              </Typography>
              <div>
                <Button>Prev</Button>
                <Button>Next</Button>
              </div>
            </div>
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

export default AdminDashboard;
