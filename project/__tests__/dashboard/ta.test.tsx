import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import TeachingOperations from "../../app/dashboard/assistant/page";

// Mock Next.js useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

describe("TADashboard", () => {
  // Basic rendering tests
  test("should display the main dashboard title and description", async () => {
    await act(async () => {
      render(<TeachingOperations />);
    });

    expect(screen.getByText("Teaching Operations")).toBeInTheDocument();
  });
});
