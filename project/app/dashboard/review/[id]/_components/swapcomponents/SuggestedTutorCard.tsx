import { Paper, Typography, Box } from "@mui/material";
import { Tutor } from "@/app/_types/tutor";

export default function SuggestedTutorCard({ tutor }: { tutor: Tutor | null }) {
  return (
    <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        Suggested Tutor
      </Typography>

      {tutor ? (
        <>
          <Typography color="text.secondary">ID: {tutor.user_id}</Typography>
          <Typography color="text.secondary">
            Name: {tutor.first_name} {tutor.last_name}
          </Typography>
          <Typography color="text.secondary">Email: {tutor.email}</Typography>

          {tutor.units && tutor.units.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2" fontWeight={600}>
                Units:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tutor.units.join(", ")}
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Typography color="text.disabled">No suggested tutor</Typography>
      )}
    </Paper>
  );
}
