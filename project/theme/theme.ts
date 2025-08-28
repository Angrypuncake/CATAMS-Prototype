"use client";

import type { ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
  },
};

const websiteTheme = createTheme(themeOptions);
export default websiteTheme;
