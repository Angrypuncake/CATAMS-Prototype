import React from "react";
import { Button, Typography, Box, Paper } from "@mui/material";

interface AdminInfoBoxProps {
  adminStatistic: number;
  title: string;
  bubbleText?: string;
  bubbleColor?: "red" | "green" | string;
}

const AdminInfoBox: React.FC<AdminInfoBoxProps> = ({
  adminStatistic,
  title,
  bubbleText,
  bubbleColor,
}) => {
  const bubbleSx =
    bubbleColor === "red"
      ? { backgroundColor: "error.main", color: "#fff" }
      : bubbleColor === "green"
      ? { backgroundColor: "success.main", color: "#fff" }
      : undefined;

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        height: 96,
        bgcolor: "background.paper",
        borderRadius: 4,
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
          {adminStatistic}
        </Typography>
      </Box>

      {bubbleText && (
        <Button variant="bubble" sx={bubbleSx}>
          {bubbleText}
        </Button>
      )}
    </Paper>
  );
};

export default AdminInfoBox;
