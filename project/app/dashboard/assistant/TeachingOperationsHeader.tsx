// src/components/TeachingOperationsHeader.tsx
"use client";

import {
  Typography,
  Button,
  InputAdornment,
  Stack,
  Box,
  TextField,
} from "@mui/material";
import {
  Download,
  Download as DownloadIcon,
  Search,
  Search as SearchIcon,
} from "@mui/icons-material";
import SelectField from "./SelectField";

type TeachingOperationsHeaderProps = {
  termValue: string;
  unitValue: string;
  viewValue: string;
  onTermChange: (val: string) => void;
  onUnitChange: (val: string) => void;
  onViewChange: (val: string) => void;
  onSearch?: (query: string) => void;
  onExport?: () => void;
};

export default function TeachingOperationsHeader({
  termValue,
  unitValue,
  viewValue,
  onTermChange,
  onUnitChange,
  onViewChange,
  onSearch,
  onExport,
}: TeachingOperationsHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        px: { xs: 2.5, sm: 3 },
        py: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        boxShadow: "sm",
        width: "100%",
      }}
    >
      <Stack spacing={2}>
        {/* Title Row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          rowGap={1.5}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ lineHeight: 1.15, letterSpacing: "-0.01em" }}
          >
            Teaching Operations
          </Typography>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={onExport}
            sx={{
              textTransform: "none",
              bgcolor: "black",
              color: "white",
              "&:hover": { bgcolor: "#111" },
            }}
          >
            Export CSV
          </Button>
        </Stack>

        {/* Filters Row */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <SelectField
            value={termValue}
            label="Term"
            options={["S1 2025", "S2 2025", "S1 2026"]}
            onChange={onTermChange}
          />
          <SelectField
            value={unitValue}
            label="Unit"
            options={["All", "INFO1110", "INFO1910", "INFO3333"]}
            onChange={onUnitChange}
          />
          <SelectField
            value={viewValue}
            label="View"
            options={["All", "Allocations", "Claims", "Requests"]}
            onChange={onViewChange}
          />

          <TextField
            placeholder="Search tutors / requests / units"
            onChange={(e) => onSearch?.(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
