"use client";

import type { Theme, ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    primary: true;
    secondary: true;
  }
  interface ButtonPropsColorOverrides {
    blue: true;
    red: true;
  }
}

const secondaryBaseStyle = ({ theme }: { theme: Theme }) => ({
  boxShadow: theme.shadows[8],
  fontWeight: 700,
  width: "auto",
  alignSelf: "flex-start",
  justifyContent: "flex-start",
  "&:hover": {
    filter: "brightness(110%)",
    boxShadow: theme.shadows[1],
  },
});

const themeOptions: ThemeOptions = {
  components: {
    MuiButton: {
      variants: [
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
            textTransform: "none",
          }),
        },
        {
          props: { variant: "secondary", color: "red" },
          style: ({ theme }) => ({
            ...secondaryBaseStyle({ theme }),
            color: theme.palette.common.white,
            backgroundColor: theme.palette.error.main,
            border: `1.5px solid ${theme.palette.error.main}`,
            textTransform: "none",
          }),
        },
      ],
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "#f5f5f5", // gray for odd rows
          },
        },
        head: {
          backgroundColor: "#1976a2", // header row
          "& .MuiTableCell-root": {
            color: "white",
            fontWeight: 700,
          },
        },
      },
    },
  },
};

const websiteTheme = createTheme(themeOptions);
export default websiteTheme;
