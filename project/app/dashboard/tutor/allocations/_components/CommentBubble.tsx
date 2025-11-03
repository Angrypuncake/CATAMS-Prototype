"use client";
import { Box, Button, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CommentItem } from "@/app/_types/allocations";

export default function CommentBubble({ comment }: { comment: CommentItem }) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>
          {comment.author}
          {comment.role ? ` – ${comment.role}` : ""} ({comment.time})
        </Typography>
        {comment.mine && (
          <Stack direction="row" spacing={0.5}>
            <Button size="small" variant="outlined" startIcon={<EditIcon />}>
              Edit
            </Button>
            <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </Stack>
        )}
      </Stack>
      <Typography variant="body2" color="text.primary">
        {comment.body}
      </Typography>
    </Box>
  );
}
