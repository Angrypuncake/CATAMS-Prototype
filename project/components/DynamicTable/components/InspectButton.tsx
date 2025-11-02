import React, { useState, useMemo } from "react";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface InspectButtonProps {
  value: unknown;
}

export const InspectButton = ({ value }: InspectButtonProps) => {
  const [open, setOpen] = useState(false);
  const stringified = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  return (
    <>
      <Tooltip title="Expand">
        <IconButton size="small" onClick={() => setOpen(true)}>
          <SearchIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Cell details</DialogTitle>
        <DialogContent dividers>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 12,
            }}
          >
            {stringified}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
