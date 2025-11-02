import React from "react";
import { render, screen } from "@testing-library/react";
import HomePortalButton from "../../components/HomePortalButton";
import "@testing-library/jest-dom";
// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock next/link since it might need router context
jest.mock("next/link", () => {
  const MockedLink = ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  MockedLink.displayName = "MockedLink";
  return MockedLink;
});

import { usePathname } from "next/navigation";
const mockedUsePathname = usePathname as jest.Mock;

describe("HomePortalButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns null if pathname is falsy", () => {
    mockedUsePathname.mockReturnValue(undefined);
    const { container } = render(<HomePortalButton />);
    expect(container.firstChild).toBeNull();
  });

  test("returns null if pathname is '/portal'", () => {
    mockedUsePathname.mockReturnValue("/portal");
    const { container } = render(<HomePortalButton />);
    expect(container.firstChild).toBeNull();
  });

  test("renders Link when pathname is not '/portal'", () => {
    mockedUsePathname.mockReturnValue("/dashboard");
    render(<HomePortalButton />);

    const link = screen.getByRole("link", { name: /go to portal/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/portal");
    expect(link).toHaveClass("fixed", "left-4", "bottom-4", "z-[1000]", "inline-flex");

    // The SVG icon should also exist
    const svg = link.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("width")).toBe("22");
    expect(svg?.getAttribute("height")).toBe("22");
  });
});
