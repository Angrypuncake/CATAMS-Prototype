import React from "react";
import { Button, Typography } from "@mui/material";

const page = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex justify-around mt-20">
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
      <div className="flex gap-4 justify-around">
        <div>
          <Typography>Users</Typography>
          <Typography>{320}</Typography>
        </div>
        <div>
          <Typography>Users</Typography>
          <Typography>{320}</Typography>
        </div>
        <div>
          <Typography>Users</Typography>
          <Typography>{320}</Typography>
        </div>
        <div>
          <Typography>Users</Typography>
          <Typography>{320}</Typography>
        </div>
      </div>

      <div className="flex justify-center h-full gap-4">
        <div className="w-1/3 h-1/3 bg-white rounded-3xl">asd</div>

        <div className="w-1/3 h-1/3 bg-white rounded-3xl">
          <div>asd</div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default page;
