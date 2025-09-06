"use client";
import React, { useCallback, useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import DynamicTable from "../../../components/DynamicTable";
import AdminInfoBox from "./AdminInfoBox";
import AdminBudgetBox from "./AdminBudgetBox";
import AdminPagination from "./AdminPagination";
import axios from "axios";

const AdminDashboard = () => {
  const [adminView, setAdminView] = useState({
    numUsers: 0,
    numAllocations: 0,
  });
  const LIMIT = 4;
  const [page, setPage] = useState(1);
  const [tutorRows, setTutorRows] = useState([]);

  const loadOverview = useCallback(async () => {
    try {
      const result = await axios.get("/api/admin/overview");
      console.log("Overview data:", result.data);
      setAdminView({
        numUsers: Number(result.data.totals.users),
        numAllocations: Number(result.data.totals.allocations),
      });
      setTutorRows(result.data.userRoles);
    } catch (err) {
      console.error("Error loading overview:", err);
    }
  }, []);

  const loadImportHistory = useCallback(async () => {
    try {
      const res = await axios.get("/api/admin/history", {
        params: { limit: LIMIT },
      });
      console.log(res);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    loadImportHistory();
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
          <div className="min-h-[85px] h-[10%] bg-white rounded-3xl p-3">
            <Typography variant="subtitle1">Validation Reports</Typography>
            <div>
              <Button variant="secondary" color="red">
                Invalid Tutor Emails {`(0)`}
              </Button>
            </div>
          </div>

          <div className="h-[42%] bg-white rounded-3xl p-3">
            <div className="flex justify-between items-center">
              <Typography variant="subtitle1">
                User & Role Management
              </Typography>
              <AdminPagination
                page={page}
                setPage={setPage}
                itemTotal={tutorRows.length}
                itemLimit={LIMIT}
              />
            </div>
            <DynamicTable
              rows={
                tutorRows.slice(
                  (page - 1) * LIMIT,
                  (page - 1) * LIMIT + LIMIT,
                ) ?? []
              }
            />
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

/* 
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
  }, [page]);*/
