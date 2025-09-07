import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Portal from "../app/portal/page";

describe("Portal Page", () => {
  test("should render the first button (Tutor Dashboard)", () => {
    render(<Portal />);

    const tutorButton = screen.getByText("Tutor Dashboard");
    expect(tutorButton).toBeInTheDocument();
    expect(tutorButton.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/tutor",
    );
  });

  test("should render all 4 portal buttons with correct links", () => {
    render(<Portal />);

    const tutorButton = screen.getByText("Tutor Dashboard");
    expect(tutorButton).toBeInTheDocument();
    expect(tutorButton.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/tutor",
    );

    const assistantButton = screen.getByText("Teaching Assistant Dashboard");
    expect(assistantButton).toBeInTheDocument();
    expect(assistantButton.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/assistant",
    );

    const coordinatorButton = screen.getByText("Coordinator Dashboard");
    expect(coordinatorButton).toBeInTheDocument();
    expect(coordinatorButton.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/coordinator",
    );

    const adminButton = screen.getByText("System Admin Dashboard");
    expect(adminButton).toBeInTheDocument();
    expect(adminButton.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin",
    );
  });

  test("should have proper layout styling", () => {
    const { container } = render(<Portal />);
    const mainContainer = container.firstElementChild;

    expect(mainContainer).toHaveClass("flex", "flex-col", "gap-2");
    expect(screen.getByText("Portal Page")).toBeInTheDocument();
  });
});
