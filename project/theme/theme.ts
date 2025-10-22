"use client";

import type { Theme, ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

/* ---------------- Button variant typings (keep as-is) ---------------- */
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    primary: true;
    secondary: true;
    bubble: true;
  }
  interface ButtonPropsColorOverrides {
    blue: true;
    red: true;
    green: true;
  }
}

/* ---------------- Reusable styles for custom variants ---------------- */
const secondaryBaseStyle = ({ theme }: { theme: Theme }) => ({
  boxShadow: theme.shadows[8],
  fontWeight: 700,
  width: "auto",
  alignSelf: "flex-start",
  justifyContent: "flex-start",
  borderRadius: 16,
  padding: "2px 12px",
  "&:hover": {
    filter: "brightness(110%)",
    boxShadow: theme.shadows[1],
  },
});

const bubbleBaseStyle = ({ theme }: { theme: Theme }) => ({
  borderRadius: 16,
  fontSize: "0.85rem",
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 3,
  paddingBottom: 3,
});

/* ---------------- Minimal monochrome theme + orange accent ---------------- */
const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#292524" }, // black
    secondary: { main: "#E5E7EB" }, // light grey
    warning: { main: "#F97316" }, // subtle orange accent
    background: {
      default: "#F7F7F7", // page backdrop (login/portal)
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
    },
    divider: "#E5E7EB",
  },

  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h1: { fontSize: "2.25rem", fontWeight: 700 },
    h2: { fontSize: "1.75rem", fontWeight: 600 },
    h3: { fontSize: "1.5rem", fontWeight: 600 },
    h4: { fontSize: "1.375rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.57 },
    subtitle1: {
      fontSize: "1rem",
      color: "#6B7280",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".02em",
    },
  },

  components: {
    /* Global backdrop color */
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F7F7F7",
        },
      },
    },

    /* Cards (tiles/containers) */
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        },
      },
    },

    /* -------- Buttons --------
       - Any contained button becomes black (fixes blue CSV/JSON)
       - Outlined gets hairline black
       - Custom variants preserved but recolored to our scheme
    */
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: "none",
        },
        contained: {
          backgroundColor: "#292524",
          color: "#FFFFFF",
          "&:hover": { backgroundColor: "#111111" },
        },
        outlined: {
          color: "#111827",
          borderColor: "#292524",
          borderWidth: 1,
          "&:hover": { backgroundColor: "#F9FAFB", borderColor: "#000000" },
        },
        containedSecondary: {
          backgroundColor: "#E5E7EB",
          color: "#111827",
          "&:hover": { backgroundColor: "#D1D5DB" },
        },
      },
      variants: [
        // primary (stretches with parent)
        {
          props: { variant: "primary" },
          style: {
            color: "#FFFFFF",
            backgroundColor: "#292524",
            border: "1.5px solid #000000",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#111111", boxShadow: "none" },
          },
        },
        // secondary (content-sized, hairline black)
        {
          props: { variant: "secondary" },
          style: ({ theme }) => ({
            ...secondaryBaseStyle({ theme }),
            color: "#111827",
            backgroundColor: "#FFFFFF",
            border: "1px solid #000000",
          }),
        },
        // legacy secondary colors map to mono so old usages don't look off
        {
          props: { variant: "secondary", color: "blue" },
          style: ({ theme }) => ({
            ...secondaryBaseStyle({ theme }),
            color: "#FFFFFF",
            backgroundColor: "#292524",
            border: "1px solid #000000",
          }),
        },
        {
          props: { variant: "secondary", color: "red" },
          style: ({ theme }) => ({
            ...secondaryBaseStyle({ theme }),
            color: "#FFFFFF",
            backgroundColor: "#292524",
            border: "1px solid #000000",
          }),
        },
        // bubble chips
        {
          props: { variant: "bubble" },
          style: ({ theme }) => ({
            ...bubbleBaseStyle({ theme }),
            color: "#6D7177",
            backgroundColor: "#F3F4F6",
            border: "1px solid #E5E7EB",
          }),
        },
        {
          props: { variant: "bubble", color: "green" },
          style: ({ theme }) => ({
            ...bubbleBaseStyle({ theme }),
            color: "#166534",
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
          }),
        },
        {
          props: { variant: "bubble", color: "red" },
          style: ({ theme }) => ({
            ...bubbleBaseStyle({ theme }),
            color: "#991B1B",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
          }),
        },
      ],
    },

    /* Tables */
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": { backgroundColor: "#FAFAFA" },
        },
        head: {
          backgroundColor: "#F3F4F6",
          "& .MuiTableCell-root": { color: "#111827", fontWeight: 700 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderRight: "1px solid #E5E7EB",
          borderLeft: "none",
          "&:first-of-type": { borderLeft: "1px solid #E5E7EB" },
          "&:last-child": { borderRight: "1px solid #E5E7EB" },
        },
      },
    },

    /* Text fields – remove blue focus ring */
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 0 },
        notchedOutline: { borderColor: "#E5E7EB" },
        input: { "&::placeholder": { opacity: 0.7 } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#111111",
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#000000",
              borderWidth: 1,
            },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: "#6B7280" },
        outlined: {
          "&.Mui-focused": { color: "#111827" },
        },
      },
    },

    /* Pagination chips */
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: "#292524",
            color: "#FFFFFF",
            "&:hover": { backgroundColor: "#111111" },
          },
        },
      },
    },
  },
};

const websiteTheme = createTheme(themeOptions);
export default websiteTheme;
