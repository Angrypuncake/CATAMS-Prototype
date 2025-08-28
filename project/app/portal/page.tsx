import React from "react";
import { Button } from "@mui/material";
const page = () => {
  return (
    <div className="flex flex-col gap-2">
      <h1>Portal Page</h1>
      <Button type="link" href="/dashboard/tutor" variant="primary">
        Tutor Dashboard
      </Button>
      <Button type="link" href="/dashboard/assistent" variant="primary">
        Teaching assistant Dashboard
      </Button>
      <Button type="link" href="/dashboard/coordinator" variant="primary">
        Coordinator Dashboard
      </Button>
      <Button type="link" href="/dashboard/admin" variant="primary">
        System Admin Dashboard
      </Button>
    </div>
  );
};

export default page;
