import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import Page from "../../app/dashboard/tutor/page";

describe("AdminDashboard", () => {
  // Basic rendering tests
  test("should display the main dashboard title and description", async () => {
    await act(async () => {
      render(<Page />);
    });

    expect(screen.getByText("Tutor Dashboard")).toBeInTheDocument();
  });
});
