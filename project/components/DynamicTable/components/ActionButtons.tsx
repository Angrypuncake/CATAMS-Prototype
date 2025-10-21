import React from "react";
import { TableCell, Stack, Button } from "@mui/material";
import type { ActionButton, TableRowData } from "../types";

interface ActionButtonsProps<T> {
  actions: ActionButton<T>[];
  row: TableRowData<T>;
}

export const ActionButtons = <T,>({ actions, row }: ActionButtonsProps<T>) => {
  return (
    <TableCell align="right">
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {actions.map((action, actionIdx) => {
          const isDisabled = action.disabled?.(row) ?? false;
          return (
            <Button
              key={actionIdx}
              size="small"
              variant={action.variant ?? "text"}
              color={action.color ?? "primary"}
              onClick={() => action.onClick(row)}
              disabled={isDisabled}
              startIcon={action.icon}
            >
              {action.label}
            </Button>
          );
        })}
      </Stack>
    </TableCell>
  );
};
