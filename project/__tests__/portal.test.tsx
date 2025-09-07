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
});
