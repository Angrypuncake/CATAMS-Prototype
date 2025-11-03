import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DetailRow from "../../../../app/dashboard/tutor/allocations/_components/DetailRow";

describe("DetailRow Component", () => {
  test("should render label and string value", () => {
    render(<DetailRow label="Unit Code" value="INFO1110" />);

    expect(screen.getByText("Unit Code:")).toBeInTheDocument();
    expect(screen.getByText("INFO1110")).toBeInTheDocument();
  });

  test("should render label and number value", () => {
    render(<DetailRow label="Hours" value={2.5} />);

    expect(screen.getByText("Hours:")).toBeInTheDocument();
    expect(screen.getByText("2.5")).toBeInTheDocument();
  });

  test("should render label and null value", () => {
    render(<DetailRow label="Location" value={null} />);

    expect(screen.getByText("Location:")).toBeInTheDocument();
  });

  test("should render with zero as value", () => {
    render(<DetailRow label="Count" value={0} />);

    expect(screen.getByText("Count:")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("should render with empty string value", () => {
    const { container } = render(<DetailRow label="Note" value="" />);

    expect(screen.getByText("Note:")).toBeInTheDocument();
    const valueElements = container.querySelectorAll(".MuiTypography-root");
    expect(valueElements.length).toBeGreaterThan(0);
  });

  test("should handle long label text", () => {
    render(<DetailRow label="Very Long Label Name That Might Wrap" value="Test Value" />);

    expect(screen.getByText("Very Long Label Name That Might Wrap:")).toBeInTheDocument();
    expect(screen.getByText("Test Value")).toBeInTheDocument();
  });

  test("should handle long value text", () => {
    render(
      <DetailRow
        label="Description"
        value="This is a very long description that might wrap across multiple lines in the display"
      />
    );

    expect(screen.getByText("Description:")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is a very long description that might wrap across multiple lines in the display"
      )
    ).toBeInTheDocument();
  });
});
