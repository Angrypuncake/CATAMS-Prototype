import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchBarProps {
  searchTerm: string;
  searchPlaceholder: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  filteredCount: number;
  totalCount: number;
}

export const SearchBar = ({
  searchTerm,
  searchPlaceholder,
  onSearchChange,
  onClearSearch,
  filteredCount,
  totalCount,
}: SearchBarProps) => {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <TextField
        fullWidth
        size="small"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={onSearchChange}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onClearSearch} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      {searchTerm && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Found {filteredCount} of {totalCount} results
        </Typography>
      )}
    </Box>
  );
};
