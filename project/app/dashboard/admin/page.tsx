"use client";
import React, { useCallback, useState } from "react";
import { Button, Typography } from "@mui/material";
import DynamicTable from "../../../components/DynamicTable";
import { useEffect } from "react";
import axios from "axios";
import AdminInfoBox from "./AdminInfoBox";
import AdminBudgetBox from "./AdminBudgetBox";

const AdminDashboard = () => {
  const [adminView, setAdminView] = useState({
    numUsers: 0,
    numAllocations: 0,
  });
  const [page, setPage] = useState(1);

  const [tutorRows, setTutorRows] = useState([]);
  const fetchUsers = useCallback(async () => {
    try {
      const limit = 4;
      const result = await axios.get("/api/tutor/allocations", {
        params: { page, limit },
      });
      setTutorRows(result.data.data);
    } catch (error) {
      console.error("Error while fetching users:", error);
    }
  }, [page]);

  const loadOverview = useCallback(async () => {
    try {
      const result = await axios.get("/api/admin/overview");
      console.log("Overview data:", result.data);
      setAdminView({
        numUsers: Number(result.data.totals.users),
        numAllocations: Number(result.data.totals.allocations),
      });
    } catch (err) {
      console.error("Error loading overview:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    loadOverview();
  }, [page]);
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
        <div className="w-1/4 h-1/3 bg-white rounded-3xl p-3">
          <Typography variant="subtitle1">Budgets Loaded</Typography>
          <AdminBudgetBox
            title="Allocations CSV"
            description="Upload + preview in timetable"
            href=""
          />
        </div>

        <div className="w-3/4 h-full  rounded-3xl flex flex-col gap-3">
          <div className="h-[10%] bg-white rounded-3xl p-3">
            <Typography variant="subtitle1">Validation Reports</Typography>

            <div>
              <Button variant="secondary" color="red">
                Invalid Tutor Emails {`(4)`}
              </Button>
            </div>
          </div>

          <div className="h-[42%] bg-white rounded-3xl p-3">
            <div className="flex justify-between items-center">
              <Typography variant="subtitle1">
                User & Role Management
              </Typography>
              <div className="flex gap-2">
                <Button
                  variant="bubble"
                  onClick={() => {
                    setPage(page - 1);
                  }}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="bubble"
                  onClick={() => {
                    setPage(page + 1);
                  }}
                  disabled={!tutorRows || tutorRows.length < 3}
                >
                  Next
                </Button>
              </div>
            </div>
            <DynamicTable rows={tutorRows ?? []} />
          </div>

          <div className="h-[42%] bg-white rounded-3xl p-3">
            <Typography variant="subtitle1">Recent Import&Exports</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
