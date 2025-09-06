"use client";

import type { Theme, ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

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

const secondaryBaseStyle = ({ theme }: { theme: Theme }) => ({
  boxShadow: theme.shadows[8],
  fontWeight: 700,
  width: "auto",
  alignSelf: "flex-start",
  justifyContent: "flex-start",
  borderRadius: "16px",
  padding: "2px 12px",
  "&:hover": {
    filter: "brightness(110%)",
    boxShadow: theme.shadows[1],
  },
});

const bubbleBaseStyle = ({ theme }: { theme: Theme }) => ({
  borderRadius: "16px",
  fontSize: "0.85rem",
  paddingLeft: "10px",
  paddingRight: "10px",
  paddingTop: "3px",
  paddingBottom: "3px",
});

const themeOptions: ThemeOptions = {
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h1: { fontSize: "2.25rem", fontWeight: 700 }, // 36px
    h2: { fontSize: "1.75rem", fontWeight: 600 }, // 28px
    h3: { fontSize: "1.5rem", fontWeight: 600 }, // 24px
    h4: { fontSize: "1.375rem", fontWeight: 600, lineHeight: 1.4 }, // 22px
    h5: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5 }, // 20px
    h6: { fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.5 }, // 18px

    body1: { fontSize: "1rem", lineHeight: 1.6 }, // ~16px (default)
    body2: { fontSize: "0.875rem", lineHeight: 1.57 }, // ~14px

    subtitle1: {
      fontSize: "1rem",
      color: "#666666",
      fontWeight: "bold",
      textTransform: "uppercase",
    },
  },
  components: {
    MuiButton: {
      variants: [
        //primary button, stretches with the parent container
        {
          props: { variant: "primary" },
          style: ({ theme }) => ({
            color: theme.palette.common.black,
            boxShadow: theme.shadows[8],
            border: "1.5px solid black",
            textTransform: "none",
            fontWeight: 500,
            justifyContent: "flex-start",
            "&:hover": {
              filter: "brightness(110%)",
              boxShadow: theme.shadows[1],
            },
          }),
        },
        //secondary button, the size stretch with the contents, can set color blue/red
        {
          props: { variant: "secondary" },
          style: ({ theme }) => ({
            ...secondaryBaseStyle({ theme }),
            color: theme.palette.common.black,
            border: "1.5px solid black",
            textTransform: "none",
          }),
        },
        {
          props: { variant: "secondary", color: "blue" },
          style: ({ theme }) => ({
            ...secondaryBaseStyle({ theme }),
            color: theme.palette.common.white,
            backgroundColor: theme.palette.primary.main,
            border: `1.5px solid ${theme.palette.primary.main}`,
          }),
        },
        {
          props: { variant: "secondary", color: "red" },
          style: ({ theme }) => ({
            ...secondaryBaseStyle({ theme }),
            color: theme.palette.common.white,
            backgroundColor: theme.palette.error.main,
            border: `1.5px solid ${theme.palette.error.main}`,
          }),
        },
        {
          props: { variant: "bubble" },
          style: ({ theme }) => ({
            ...bubbleBaseStyle({ theme }),
            color: "#6d7177",
            backgroundColor: "#f3f4f6",
            textTransform: "none",
          }),
        },
        {
          props: { variant: "bubble", color: "green" },
          style: ({ theme }) => ({
            ...bubbleBaseStyle({ theme }),
            color: "#59A56C",
            backgroundColor: "#ebf7ef",
            textTransform: "none",
          }),
        },
        {
          props: { variant: "bubble", color: "red" },
          style: ({ theme }) => ({
            ...bubbleBaseStyle({ theme }),
            color: "#c6332c",
            backgroundColor: "#faeceb",
            textTransform: "none",
          }),
        },
      ],
    },
    MuiTableRow: {
      //table styling, follows Elvis' design
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "#f5f5f5", // gray for odd rows
          },
        },
        head: {
          backgroundColor: "#e8e8e8",
          "& .MuiTableCell-root": {
            color: "black",
            fontWeight: 700,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderRight: "1px solid #ccc",
          borderLeft: "none",
          "&:first-of-type": {
            borderLeft: "1px solid #ccc", // left border for the first column
          },
          "&:last-child": {
            borderRight: "1px solid #ccc", // keep right border on last column
          },
        },
      },
    },
  },
};

const websiteTheme = createTheme(themeOptions);
export default websiteTheme;
