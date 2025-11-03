import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Table, TableBody } from "@mui/material";
import { TableHeader } from "@/components/DynamicTable/components/TableHeader";

function renderWithTable(ui: React.ReactNode) {
  return render(<Table>{[ui, <TableBody key="body" />]}</Table>);
}

type Row = { name: string; age: number };

describe("TableHeader", () => {
  test("renders plain labels when enableSorting=false (covers 34–37)", () => {
    const columns: Array<{ key: keyof Row & string; label: string }> = [
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
    ];

    renderWithTable(
      <TableHeader<Row>
        columns={columns}
        enableSorting={false}
        sortColumn={null}
        sortDirection="asc"
        onSort={(_: keyof Row & string) => {}}
        hasActions={true}
        actionsLabel="Actions"
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /name/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /age/i })).not.toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  test("renders TableSortLabel when enableSorting=true and triggers onSort", () => {
    const columns: Array<{ key: keyof Row & string; label: string }> = [
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
    ];
    const onSort: (col: keyof Row & string) => void = jest.fn();

    renderWithTable(
      <TableHeader<Row>
        columns={columns}
        enableSorting={true}
        sortColumn={"name"}
        sortDirection="desc"
        onSort={onSort}
        hasActions={false}
        actionsLabel="Actions"
      />
    );

    const nameSortBtn = screen.getByRole("button", { name: "Name" });
    const ageSortBtn = screen.getByRole("button", { name: "Age" });

    fireEvent.click(ageSortBtn);
    expect(onSort).toHaveBeenCalledWith("age");

    fireEvent.click(nameSortBtn);
    expect(onSort).toHaveBeenCalledWith("name");
  });

  test("shows key as fallback label when no label provided (non-sorting branch)", () => {
    const columns: Array<{ key: keyof Row & string }> = [{ key: "name" }, { key: "age" }];

    renderWithTable(
      <TableHeader<Row>
        columns={columns}
        enableSorting={false}
        sortColumn={null}
        sortDirection="asc"
        onSort={(_: keyof Row & string) => {}}
        hasActions={false}
        actionsLabel="Actions"
      />
    );

    const row = screen.getByRole("row");
    expect(within(row).getByText("name")).toBeInTheDocument();
    expect(within(row).getByText("age")).toBeInTheDocument();
  });
});
