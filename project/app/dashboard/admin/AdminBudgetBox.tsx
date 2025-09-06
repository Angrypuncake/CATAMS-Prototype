import { Button, Typography } from "@mui/material";
import React from "react";

interface AdminBudgetBoxProps {
  title: string;
  description: string;
  href?: string;
}

const AdminBudgetBox: React.FC<AdminBudgetBoxProps> = ({
  title,
  description,
  href,
}) => {
  return (
    <div>
      <div className="mt-2 rounded-2xl border border-[#e3e3e3] p-2 flex justify-between items-center">
        <div>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body1">{description}</Typography>
        </div>

        <Button variant="secondary" color="blue" href={href ? href : undefined}>
          Open
        </Button>
      </div>
    </div>
  );
};

export default AdminBudgetBox;
