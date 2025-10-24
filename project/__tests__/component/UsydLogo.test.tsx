import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import UsydLogo from "../../components/UsydLogo";

describe("UsydLogo Component", () => {
  test("should render with default props (non-white logo)", () => {
    render(<UsydLogo />);

    const logo = screen.getByAltText("University of Sydney");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/usyd_logo_white.png");
    expect(logo).toHaveClass("object-contain");
  });

  test("should render white logo when white prop is true", () => {
    render(<UsydLogo white />);

    const logo = screen.getByAltText("University of Sydney");
    expect(logo).toHaveAttribute("src", "/usyd_logo_white.svg");
    expect(logo).toHaveClass("object-contain");
    expect(logo.className).toContain("[filter:brightness(0)_invert(1)]");
  });

  test("should apply custom className", () => {
    render(<UsydLogo className="custom-class" />);

    const logo = screen.getByAltText("University of Sydney");
    expect(logo).toHaveClass("custom-class");
    expect(logo).toHaveClass("object-contain");
  });

  test("should apply custom className with white filter", () => {
    render(<UsydLogo white className="custom-class" />);

    const logo = screen.getByAltText("University of Sydney");
    expect(logo).toHaveClass("custom-class");
    expect(logo).toHaveClass("object-contain");
    expect(logo.className).toContain("[filter:brightness(0)_invert(1)]");
  });

  test("should fallback to white PNG on error when white SVG is missing", () => {
    render(<UsydLogo white />);

    const logo = screen.getByAltText("University of Sydney");
    expect(logo).toHaveAttribute("src", "/usyd_logo_white.svg");

    // Simulate image load error
    fireEvent.error(logo);

    expect(logo).toHaveAttribute("src", "/usyd_logo_white.png");
  });

  test("should not change src on error if already showing fallback", () => {
    render(<UsydLogo white />);

    const logo = screen.getByAltText("University of Sydney");

    // First error - should fallback to white png
    fireEvent.error(logo);
    expect(logo).toHaveAttribute("src", "/usyd_logo_white.png");

    // Second error - should stay on white png
    fireEvent.error(logo);
    expect(logo).toHaveAttribute("src", "/usyd_logo_white.png");
  });

  test("should pass additional img props", () => {
    render(
      <UsydLogo
        width={200}
        height={100}
        style={{ margin: "10px" }}
        draggable={false}
      />,
    );

    const logo = screen.getByAltText("University of Sydney");
    expect(logo).toHaveAttribute("width", "200");
    expect(logo).toHaveAttribute("height", "100");
    expect(logo).toHaveAttribute("draggable", "false");
    expect(logo).toHaveStyle({ margin: "10px" });
  });

  test("should always use alt text 'University of Sydney'", () => {
    render(<UsydLogo />);

    expect(screen.getByAltText("University of Sydney")).toBeInTheDocument();
  });

  test("should handle custom alt text override", () => {
    render(<UsydLogo alt="Custom Alt Text" />);

    expect(screen.getByAltText("Custom Alt Text")).toBeInTheDocument();
  });

  test("should not have white filter on non-white logo", () => {
    render(<UsydLogo white={false} />);

    const logo = screen.getByAltText("University of Sydney");
    expect(logo.className).not.toContain("[filter:brightness(0)_invert(1)]");
  });

  test("should render with empty className when not provided", () => {
    const { container } = render(<UsydLogo />);

    const logo = container.querySelector("img");
    expect(logo).toHaveClass("object-contain");
  });

  test("should maintain white filter after fallback", () => {
    render(<UsydLogo white />);

    const logo = screen.getByAltText("University of Sydney");

    // Trigger fallback
    fireEvent.error(logo);

    // Should still have white filter even with fallback image
    expect(logo.className).toContain("[filter:brightness(0)_invert(1)]");
    expect(logo).toHaveAttribute("src", "/usyd_logo_white.png");
  });
});
