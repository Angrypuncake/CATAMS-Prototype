"use client";

import type { ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    primary: true;
    secondary: true;
  }
}

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
            "&:hover": {
              filter: "brightness(110%)",
              boxShadow: theme.shadows[1],
            },
          }),
        },
      ],
    },
  },
};

const websiteTheme = createTheme(themeOptions);
export default websiteTheme;
