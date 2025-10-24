import React from "react";
import { Button, Typography, Box, Paper } from "@mui/material";

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
    <Box>
      <Paper
        elevation={0}
        sx={{
          mt: 1,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>

        <Button
          variant="secondary"
          color="blue"
          href={href || undefined}
          sx={{ whiteSpace: "nowrap" }}
        >
          Open
        </Button>
      </Paper>
    </Box>
  );
};

export default AdminBudgetBox;
