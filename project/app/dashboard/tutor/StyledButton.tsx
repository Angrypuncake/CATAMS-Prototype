import Button from "@mui/material/Button";
import React from "react";

interface StyledButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

const StyledButton: React.FC<StyledButtonProps> = ({
  onClick,
  children,
  size = "small",
  variant = "contained",
  color = "primary",
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      sx={{
        borderRadius: "9999px",
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.85rem",
        px: 2.5,
        py: 0.5,
        minHeight: "30px",
        background: "linear-gradient(to right, #3b82f6, #6414c7)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          background: "linear-gradient(to right, #2563eb, #490d91)",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
        },
        "&:active": { transform: "scale(0.98)" },
      }}
      size={size}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default StyledButton;
