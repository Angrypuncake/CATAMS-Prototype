import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MinimalNav from "../../components/MinimalNav";
import axios from "axios";

// Mock Next.js navigation
const mockPush = jest.fn();
const mockPathname = jest.fn(() => "/dashboard");

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("MinimalNav Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue("/dashboard");
  });

  test("should render with default props", () => {
    render(<MinimalNav />);

    expect(screen.getByAltText("University of Sydney")).toBeInTheDocument();
    expect(screen.getByText("CATAMS")).toBeInTheDocument();
    expect(screen.getByText("HELP")).toBeInTheDocument();
  });

  test("should render custom right title", () => {
    render(<MinimalNav rightTitle="TEST SYSTEM" />);

    expect(screen.getByText("TEST SYSTEM")).toBeInTheDocument();
    expect(screen.queryByText("CATAMS")).not.toBeInTheDocument();
  });

  test("should render custom actions with href", () => {
    const actions = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
    ];

    render(<MinimalNav actions={actions} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  test("should render custom actions with onClick handler", () => {
    const handleClick = jest.fn();
    const actions = [{ label: "Custom Action", onClick: handleClick }];

    render(<MinimalNav actions={actions} />);

    const button = screen.getByText("Custom Action");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("should filter out logout action from custom actions", () => {
    const actions = [
      { label: "Home", href: "/" },
      { label: "Logout", href: "/logout" },
      { label: "Help", href: "/help" },
    ];

    render(<MinimalNav actions={actions} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
    // Should only show the Sign-out button, not the custom Logout action
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  test("should show Portal button when not on portal page", () => {
    mockPathname.mockReturnValue("/dashboard");

    render(<MinimalNav />);

    expect(screen.getByText("Portal")).toBeInTheDocument();
    expect(screen.getByLabelText("Go back to portal")).toBeInTheDocument();
  });

  test("should hide Portal button when on portal page", () => {
    mockPathname.mockReturnValue("/portal/admin");

    render(<MinimalNav />);

    expect(screen.queryByText("Portal")).not.toBeInTheDocument();
  });

  test("should show Sign-out button when not on login page", () => {
    mockPathname.mockReturnValue("/dashboard");

    render(<MinimalNav />);

    expect(screen.getByText("Sign-out")).toBeInTheDocument();
    expect(screen.getByLabelText("Log out")).toBeInTheDocument();
  });

  test("should hide Sign-out button on login page", () => {
    mockPathname.mockReturnValue("/login");

    render(<MinimalNav />);

    expect(screen.queryByText("Sign-out")).not.toBeInTheDocument();
  });

  test("should hide Sign-out button on login subpages", () => {
    mockPathname.mockReturnValue("/login/forgot-password");

    render(<MinimalNav />);

    expect(screen.queryByText("Sign-out")).not.toBeInTheDocument();
  });

  test("should handle logout successfully", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    mockPathname.mockReturnValue("/dashboard");

    render(<MinimalNav />);

    const logoutButton = screen.getByText("Sign-out");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  test("should handle logout error", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedAxios.post.mockRejectedValue(new Error("Logout failed"));
    mockPathname.mockReturnValue("/dashboard");

    render(<MinimalNav />);

    const logoutButton = screen.getByText("Sign-out");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Logout error:", expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test("should render with custom logo source", () => {
    render(<MinimalNav logoSrc="/custom_logo.png" />);

    const logo = screen.getByAltText("University of Sydney");
    expect(logo).toHaveAttribute("src", "/custom_logo.png");
  });

  test("should render orange accent by default", () => {
    const { container } = render(<MinimalNav />);

    // Find the orange accent div by checking for background-color in style
    const divs = container.querySelectorAll("div");
    const orangeAccent = Array.from(divs).find((div) =>
      div.style.backgroundColor.includes("rgb(249, 115, 22)")
    );
    expect(orangeAccent).toBeTruthy();
  });

  test("should hide orange accent when showOrangeAccent is false", () => {
    const { container } = render(<MinimalNav showOrangeAccent={false} />);

    // Find the orange accent div by checking for background-color in style
    const divs = container.querySelectorAll("div");
    const orangeAccent = Array.from(divs).find((div) =>
      div.style.backgroundColor.includes("rgb(249, 115, 22)")
    );
    expect(orangeAccent).toBeFalsy();
  });

  test("should apply custom max width class", () => {
    const { container } = render(<MinimalNav maxWidthClass="max-w-4xl" />);

    const element = container.querySelector(".max-w-4xl");
    expect(element).toBeInTheDocument();
  });

  test("should not render right title when rightTitle is empty string", () => {
    render(<MinimalNav rightTitle="" />);

    expect(screen.queryByText("CATAMS")).not.toBeInTheDocument();
  });

  test("should apply edge gap styles when edgeGapCm is provided", () => {
    const { container } = render(<MinimalNav edgeGapCm={2} />);

    // Find element with inline width style - check for computed style
    const divs = container.querySelectorAll("div");
    const elementWithGap = Array.from(divs).find((div) => {
      // Check both inline style attribute and computed width
      return (
        div.style.width.includes("calc") ||
        div.style.marginInline === "2cm" ||
        div.style.width.includes("4cm")
      );
    });
    expect(elementWithGap).toBeTruthy();
  });

  test("should render logo with draggable=false", () => {
    render(<MinimalNav />);

    const logo = screen.getByAltText("University of Sydney");
    expect(logo).toHaveAttribute("draggable", "false");
  });
});
