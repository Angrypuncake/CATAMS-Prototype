import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Portal from "../app/portal/page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe("Portal Page", () => {
  test("should render the first button (Tutor Dashboard)", () => {
    render(<Portal />);

    const tutorCard = screen.getByText("Tutor");
    expect(tutorCard).toBeInTheDocument();

    const enterButton = tutorCard.closest(".MuiCard-root")?.querySelector("a");
    expect(enterButton).toHaveAttribute("href", "/dashboard/tutor");
  });

  test("should render all 4 portal buttons with correct links", () => {
    render(<Portal />);

    const tutorCard = screen.getByText("Tutor");
    expect(tutorCard).toBeInTheDocument();
    const tutorEnterButton = tutorCard
      .closest(".MuiCard-root")
      ?.querySelector("a");
    expect(tutorEnterButton).toHaveAttribute("href", "/dashboard/tutor");

    const assistantCard = screen.getByText("Teaching Assistant");
    expect(assistantCard).toBeInTheDocument();
    const assistantEnterButton = assistantCard
      .closest(".MuiCard-root")
      ?.querySelector("a");
    expect(assistantEnterButton).toHaveAttribute(
      "href",
      "/dashboard/assistant",
    );

    const coordinatorCard = screen.getByText("Coordinator");
    expect(coordinatorCard).toBeInTheDocument();
    const coordinatorEnterButton = coordinatorCard
      .closest(".MuiCard-root")
      ?.querySelector("a");
    expect(coordinatorEnterButton).toHaveAttribute(
      "href",
      "/dashboard/coordinator",
    );

    const adminCard = screen.getByText("System Admin");
    expect(adminCard).toBeInTheDocument();
    const adminEnterButton = adminCard
      .closest(".MuiCard-root")
      ?.querySelector("a");
    expect(adminEnterButton).toHaveAttribute("href", "/dashboard/admin");
  });

  test("should have proper layout styling", () => {
    const { container } = render(<Portal />);
    const mainContainer = container.firstElementChild;

    expect(mainContainer).toHaveClass("min-h-screen", "w-full");

    expect(
      screen.getByText("Casual Academic Time Allocation System"),
    ).toBeInTheDocument();

    const cards = container.querySelectorAll(".MuiCard-root");
    expect(cards.length).toBe(4);
  });
});
