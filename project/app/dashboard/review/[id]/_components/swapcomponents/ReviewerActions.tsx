import { Box, Button, TextField, Typography } from "@mui/material";

export default function ReviewerActions({
  note,
  onChange,
  onApprove,
  onReject,
  onForward,
  role,
  readOnly,
  loading,
}: {
  note: string;
  onChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onForward: () => void;
  role: "UC" | "TA" | "USER";
  readOnly: boolean;
  loading: boolean;
}) {
  const isActionDisabled = readOnly || loading;

  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Reviewer Note
      </Typography>

      <TextField
        fullWidth
        multiline
        minRows={3}
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add notes for this decision..."
        sx={{ mb: 3 }}
        disabled={readOnly}
      />

      {/* Only show action buttons if not read-only */}
      {!readOnly && (
        <Box display="flex" gap={2}>
          {role === "UC" ? (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={onApprove}
                disabled={isActionDisabled}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={onReject}
                disabled={isActionDisabled}
              >
                Reject
              </Button>
            </>
          ) : role === "TA" ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={onForward}
                disabled={isActionDisabled}
              >
                Forward to UC
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={onReject}
                disabled={isActionDisabled}
              >
                Reject
              </Button>
            </>
          ) : null}
        </Box>
      )}
    </>
  );
}
