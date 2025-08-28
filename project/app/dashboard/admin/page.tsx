import React from "react";
import { Button, Typography } from "@mui/material";

const page = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-around flex-[1]">
        <div>
          <Typography variant="h3">System Admin Dashboard</Typography>
          <Typography variant="body1">
            Data operations, integrity checks, and system configuration.
          </Typography>
        </div>

        <div className="gap-2 flex">
          <Button variant="secondary">Refresh</Button>
          <Button variant="secondary" color="blue">
            Bulk Import Allocations
          </Button>
        </div>
      </div>

      <div className="flex-[4]">asd</div>
    </div>
  );
};

export default page;
