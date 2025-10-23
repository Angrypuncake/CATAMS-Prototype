import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterControls } from "../../../app/admin/allocations/components/FilterControls";

describe("FilterControls Component", () => {
  const mockProps = {
    q: "",
    unitCode: "",
    activityType: "",
    status: "",
    limit: 50,
    onQChange: jest.fn(),
    onUnitCodeChange: jest.fn(),
    onActivityTypeChange: jest.fn(),
    onStatusChange: jest.fn(),
    onLimitChange: jest.fn(),
    onApply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render all filter inputs and labels", () => {
    render(<FilterControls {...mockProps} />);

    expect(
      screen.getByPlaceholderText("Search tutor, unit, or activity…"),
    ).toBeInTheDocument();
    expect(screen.getByText("Unit Code")).toBeInTheDocument();
    expect(screen.getByText("Activity Type")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Limit")).toBeInTheDocument();
    expect(screen.getByText("APPLY")).toBeInTheDocument();
  });

  test("should call onQChange when search input changes", () => {
    render(<FilterControls {...mockProps} />);

    const searchInput = screen.getByPlaceholderText(
      "Search tutor, unit, or activity…",
    );
    fireEvent.change(searchInput, { target: { value: "test search" } });

    expect(mockProps.onQChange).toHaveBeenCalledWith("test search");
  });

  test("should call onUnitCodeChange when unit code input changes", () => {
    render(<FilterControls {...mockProps} />);

    const inputs = screen.getAllByRole("textbox");
    const unitCodeInput = inputs[1];
    fireEvent.change(unitCodeInput, { target: { value: "INFO1110" } });

    expect(mockProps.onUnitCodeChange).toHaveBeenCalledWith("INFO1110");
  });

  test("should call onActivityTypeChange when activity type input changes", () => {
    render(<FilterControls {...mockProps} />);

    const inputs = screen.getAllByRole("textbox");
    const activityTypeInput = inputs[2];
    fireEvent.change(activityTypeInput, { target: { value: "Tutorial" } });

    expect(mockProps.onActivityTypeChange).toHaveBeenCalledWith("Tutorial");
  });

  test("should call onStatusChange when status input changes", () => {
    render(<FilterControls {...mockProps} />);

    const inputs = screen.getAllByRole("textbox");
    const statusInput = inputs[3];
    fireEvent.change(statusInput, { target: { value: "Confirmed" } });

    expect(mockProps.onStatusChange).toHaveBeenCalledWith("Confirmed");
  });

  test("should call onLimitChange when limit input changes", () => {
    render(<FilterControls {...mockProps} />);

    const limitInput = screen.getByDisplayValue("50");
    fireEvent.change(limitInput, { target: { value: "100" } });

    expect(mockProps.onLimitChange).toHaveBeenCalledWith(100);
  });

  test("should call onApply when apply button is clicked", () => {
    render(<FilterControls {...mockProps} />);

    const applyButton = screen.getByText("APPLY");
    fireEvent.click(applyButton);

    expect(mockProps.onApply).toHaveBeenCalledTimes(1);
  });

  test("should display current filter values", () => {
    const propsWithValues = {
      ...mockProps,
      q: "John Doe",
      unitCode: "INFO1110",
      activityType: "Tutorial",
      status: "Confirmed",
      limit: 100,
    };

    render(<FilterControls {...propsWithValues} />);

    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("INFO1110")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Tutorial")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Confirmed")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
  });
});
