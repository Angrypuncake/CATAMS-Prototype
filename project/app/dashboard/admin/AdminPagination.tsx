import { Button } from "@mui/material";
import React from "react";
interface AdminPaginationProps {
  page: number;
  setPage: (arg0: number) => void;
  itemTotal: number;
  itemLimit: number;
}
const AdminPagination: React.FC<AdminPaginationProps> = ({
  page,
  setPage,
  itemTotal,
  itemLimit,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="bubble"
        onClick={() => {
          setPage(page - 1);
        }}
        disabled={page === 1}
      >
        Prev
      </Button>
      <Button
        variant="bubble"
        onClick={() => {
          setPage(page + 1);
        }}
        disabled={page * itemLimit >= itemTotal}
      >
        Next
      </Button>
    </div>
  );
};

export default AdminPagination;
