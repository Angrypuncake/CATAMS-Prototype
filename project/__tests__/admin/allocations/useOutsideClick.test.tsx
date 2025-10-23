import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { useOutsideClick } from "../../../app/admin/allocations/hooks/useOutsideClick";

function Demo({ onAway }: { onAway: jest.Mock }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  useOutsideClick(ref, onAway);
  return (
    <div>
      <div data-testid="panel" ref={ref}>
        <span data-testid="inside-child">inside</span>
      </div>
      <div data-testid="outside">outside</div>
    </div>
  );
}

describe("useOutsideClick", () => {
  test("calls onClickAway only when clicking outside the referenced element", () => {
    const onAway = jest.fn();
    render(<Demo onAway={onAway} />);

    fireEvent.mouseDown(screen.getByTestId("panel"));
    expect(onAway).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByTestId("inside-child"));
    expect(onAway).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(onAway).toHaveBeenCalledTimes(1);

    fireEvent.mouseDown(document.body);
    expect(onAway).toHaveBeenCalledTimes(2);
  });

  test("removes event listener on unmount (no further calls)", () => {
    const onAway = jest.fn();
    const { unmount } = render(<Demo onAway={onAway} />);

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(onAway).toHaveBeenCalledTimes(1);

    unmount();

    fireEvent.mouseDown(document.body);
    expect(onAway).toHaveBeenCalledTimes(1);
  });
});
