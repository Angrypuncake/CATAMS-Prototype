import React from "react";
import { Button, Typography } from "@mui/material";

interface AdminInfoBoxProps {
  adminStatistic: number;
  title: string;
  bubbleText?: string;
  bubbleColor?: string;
}

const AdminInfoBox: React.FC<AdminInfoBoxProps> = ({
  adminStatistic,
  title,
  bubbleText,
  bubbleColor,
}) => {
  return (
    <div className="w-[250px] h-[80px] bg-white flex gap-3 items-center justify-around rounded-2xl">
      <div className="flex flex-col">
        <Typography>{title}</Typography>
        <Typography variant="h4">{adminStatistic}</Typography>
      </div>
      <div>
        {bubbleColor === "red" ? (
          <Button
            variant="bubble"
            sx={{ backgroundColor: "red", color: "#fff" }}
          >
            {bubbleText}
          </Button>
        ) : bubbleColor === "green" ? (
          <Button
            variant="bubble"
            sx={{ backgroundColor: "green", color: "#fff" }}
          >
            {bubbleText}
          </Button>
        ) : (
          <Button variant="bubble">{bubbleText}</Button>
        )}
      </div>
    </div>
  );
};

export default AdminInfoBox;
