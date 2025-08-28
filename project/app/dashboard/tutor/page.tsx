import React from "react";
import Button from "@mui/material/Button";

const page = () => {
  return (
    <div className="flex flex-col">
      Tutor Page starts here
      <Button variant="secondary">Click</Button>
      <Button variant="secondary" color="blue">
        Click
      </Button>
      <Button variant="secondary" color="red">
        Click
      </Button>
    </div>
  );
};

export default page;
