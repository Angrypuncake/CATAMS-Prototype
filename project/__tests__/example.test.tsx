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
