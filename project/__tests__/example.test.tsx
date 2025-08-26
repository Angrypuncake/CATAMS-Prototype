import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

function add(a: number, b: number) {
  return a + b;
}

test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});

test("works with negatives", () => {
  expect(add(-1, 4)).toBe(3);
});

describe("Home page", () => {
  it("renders heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /welcome to the home page/i }),
    ).toBeInTheDocument();
  });
});
