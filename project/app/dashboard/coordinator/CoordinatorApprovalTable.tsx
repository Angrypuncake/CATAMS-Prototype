import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { TutorRequestRow } from "./types";

interface CoordinatorApprovalTableProps {
  pendingRequests: TutorRequestRow[];
}

const CoordinatorApprovalTable = ({
  pendingRequests,
}: CoordinatorApprovalTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Request Id</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Related Session</TableCell>
            <TableCell>By</TableCell>
            <TableCell>Approve</TableCell>
            <TableCell>Reject</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingRequests.map((row) => (
            <TableRow key={row.requestID}>
              <TableCell>{row.requestID}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{row.relatedSession}</TableCell>
              <TableCell>
                {row.creatorRole}: {row.creator} ({row.user_id})
              </TableCell>

              <TableCell>
                <Button variant="contained" color="primary" size="small">
                  Approve
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="contained" color="secondary" size="small">
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CoordinatorApprovalTable;
