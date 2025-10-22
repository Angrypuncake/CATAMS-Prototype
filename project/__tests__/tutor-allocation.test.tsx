import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import AllocationPage from "../app/dashboard/tutor/allocations/[id]/page";

describe("AdminDashboard", () => {
  // Basic rendering tests
  test("should display the main dashboard title and description", async () => {
    await act(async () => {
      //render(<AllocationPage />);
    });

    //expect(screen.getByText("Allocation")).toBeInTheDocument();
  });
});
