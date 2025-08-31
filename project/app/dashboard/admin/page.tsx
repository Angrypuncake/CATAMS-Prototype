"use client";
import React from "react";
import { Button, Typography } from "@mui/material";
import { useState } from "react";

const Page = () => {
  const [adminView, setAdminView] = useState({
    numUsers: 0,
    numAllocations: 0,
    numPendingErrors: 0,
    numBudgetLoaded: 0,
  });
  setAdminView(...[adminView]);
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
            <Button variant="secondary">directory</Button>
          </div>
        </div>
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
          <div className="flex flex-col">
            <Typography>Allocations</Typography>
            <Typography variant="h3">{adminView.numAllocations}</Typography>
          </div>
          <div>
            <Button variant="secondary">directory</Button>
          </div>
        </div>
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
          <div className="flex flex-col">
            <Typography>Pending Errors</Typography>
            <Typography variant="h3">{320}</Typography>
          </div>
          <div>
            <Button variant="secondary">directory</Button>
          </div>
        </div>
        <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-center rounded-2xl">
          <div className="flex flex-col">
            <Typography>Budgets Loaded</Typography>
            <Typography variant="h3">{320}</Typography>
          </div>
          <div>
            <Button variant="secondary">directory</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center h-full gap-4 w-full">
        <div className="w-1/3 h-1/3 bg-white rounded-3xl">asd</div>

        <div className="w-2/3 h-1/3 bg-white rounded-3xl">
          <div>asd</div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Page;
