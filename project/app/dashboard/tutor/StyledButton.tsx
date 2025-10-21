"use client";

import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";

/**
 * Monochrome pill button with subtle motion:
 * - Pill shape, soft lift on hover
 * - Black contained by default (no gradients)
 * - Thin orange focus ring for keyboard users
 * - Accepts all normal MUI Button props (startIcon, size, etc.)
 */
type StyledButtonProps = ButtonProps;

const StyledButton = React.forwardRef<HTMLButtonElement, StyledButtonProps>(
  function StyledButton(
    {
      variant = "contained",
      color = "primary",
      sx,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <Button
        ref={ref}
        variant={variant}
        color={color}
        sx={{
          // shape + typography
          borderRadius: "9999px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          px: 2.75,
          py: 0.9,
          minHeight: 36,

          // base motion
          transition: "transform .15s ease, box-shadow .2s ease, background-color .2s ease",

          // contained → black
          ...(variant === "contained" && {
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #000",
            boxShadow: "0 2px 10px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.06)",
            "&:hover": {
              backgroundColor: "#111",
              transform: "translateY(-1px)",
              boxShadow: "0 8px 22px rgba(0,0,0,.14)",
            },
          }),

          // outlined → thin black outline + soft grey hover
          ...(variant === "outlined" && {
            color: "#111827",
            borderColor: "#000",
            borderWidth: 1,
            "&:hover": {
              backgroundColor: "#F3F4F6",
              transform: "translateY(-1px)",
            },
          }),

          // text → quiet but consistent
          ...(variant === "text" && {
            color: "#111827",
            "&:hover": { backgroundColor: "#F3F4F6" },
          }),

          // focus ring (keyboard)
          "&:focus-visible": {
            outline: "none",
            boxShadow:
              "0 0 0 3px rgba(249,115,22,.35), 0 2px 10px rgba(0,0,0,.08)",
          },

          // disabled
          "&.Mui-disabled": {
            backgroundColor: "#E5E7EB !important",
            color: "#9CA3AF !important",
            borderColor: "#E5E7EB !important",
            boxShadow: "none",
            transform: "none",
          },

          // allow caller overrides last
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);

export default StyledButton;
