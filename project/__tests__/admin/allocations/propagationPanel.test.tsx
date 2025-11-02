/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PropagationPanel } from "../../../app/admin/allocations/components/PropagationPanel";

jest.mock("@/app/services/activityService", () => ({
  getActivityOccurrences: jest.fn(),
}));

import { getActivityOccurrences } from "@/app/services/activityService";

type OccurrenceRow = {
  occurrence_id: number;
  session_date: string;
  status: string | null;
};

const mockWeeks: OccurrenceRow[] = [
  { occurrence_id: 1, session_date: "2025-10-10", status: "confirmed" },
  { occurrence_id: 2, session_date: "2025-10-17", status: null },
];

const onChangeMock = jest.fn();

function setup(props?: Partial<React.ComponentProps<typeof PropagationPanel>>) {
  (getActivityOccurrences as jest.Mock).mockResolvedValueOnce(mockWeeks);
  onChangeMock.mockClear();
  return render(
    <PropagationPanel activityId={123} derivedDow="Mon" onChange={onChangeMock} {...props} />
  );
}

describe("PropagationPanel (no user-event)", () => {
  afterEach(() => jest.clearAllMocks());

  test("fetches occurrences and renders weeks; emits baseline onChange", async () => {
    setup();
    expect(getActivityOccurrences).toHaveBeenCalledWith(123);
    expect(await screen.findByText("Week 1")).toBeInTheDocument();
    expect(screen.getByText("Week 2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mon")).toBeInTheDocument();

    await waitFor(() => expect(onChangeMock).toHaveBeenCalled());
    const last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last).toEqual({
      fields: [],
      notesMode: undefined,
      dow: undefined,
      occurrenceIds: [],
    });
  });

  test("toggling field checkboxes updates payload", async () => {
    setup();
    await screen.findByText("Week 1");

    const tutor = screen.getByLabelText(/Tutor/i) as HTMLInputElement;
    fireEvent.click(tutor);
    let last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.fields).toEqual(["tutor"]);

    const paycode = screen.getByLabelText(/Paycode/i) as HTMLInputElement;
    fireEvent.click(paycode);
    last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.fields.sort()).toEqual(["paycode", "tutor"].sort());

    fireEvent.click(tutor);
    last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.fields).toEqual(["paycode"]);
  });

  test("notes field shows radios and payload includes notesMode", async () => {
    setup();
    await screen.findByText("Week 1");

    const notes = screen.getByLabelText(/Notes/i);
    fireEvent.click(notes);

    const overwrite = await screen.findByLabelText(/overwrite/i);
    const append = screen.getByLabelText(/append/i);
    expect(overwrite).toBeChecked();

    let last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.fields).toContain("note");
    expect(last.notesMode).toBe("overwrite");

    fireEvent.click(append);
    last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.notesMode).toBe("append");

    fireEvent.click(notes);
    last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.fields).not.toContain("note");
    expect(last.notesMode).toBeUndefined();
  });

  test("Move weekday checkbox controls dow", async () => {
    setup({ derivedDow: "Wed" });
    await screen.findByText("Week 1");

    let last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.dow).toBeUndefined();

    const moveDow = screen.getByLabelText(/Move to this weekday/i);
    fireEvent.click(moveDow);

    fireEvent.click(screen.getByLabelText(/Tutor/i));

    last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.dow).toBe("Wed");

    fireEvent.click(moveDow);
    fireEvent.click(screen.getByLabelText(/Tutor/i));

    last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.dow).toBeUndefined();
  });

  test("Select All / Clear All update occurrenceIds and summary", async () => {
    setup();
    await screen.findByText("Week 1");

    fireEvent.click(screen.getByRole("button", { name: /Select All/i }));
    let last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.occurrenceIds.sort()).toEqual([1, 2]);
    expect(screen.getByText(/Will apply to 2 occurrence\(s\)\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Clear All/i }));
    last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.occurrenceIds).toEqual([]);
    expect(screen.getByText(/No occurrences selected — this session only\./i)).toBeInTheDocument();
  });

  test("individual week checkbox updates occurrenceIds", async () => {
    setup();
    await screen.findByText("Week 1");

    const row1 = screen.getByText("Week 1").closest("tr")!;
    const cb1 = row1.querySelector('input[type="checkbox"]') as HTMLInputElement;

    fireEvent.click(cb1);
    let last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.occurrenceIds).toEqual([1]);
    expect(screen.getByText(/Will apply to 1 occurrence\(s\)\./i)).toBeInTheDocument();

    fireEvent.click(cb1);
    last = onChangeMock.mock.calls.at(-1)?.[0];
    expect(last.occurrenceIds).toEqual([]);
  });

  test("empty state when no weeks", async () => {
    (getActivityOccurrences as jest.Mock).mockResolvedValueOnce([]);
    render(<PropagationPanel activityId={456} derivedDow="Mon" onChange={onChangeMock} />);
    expect(
      await screen.findByText(/No existing weeks found for this activity\./i)
    ).toBeInTheDocument();
  });

  test("disabled applies styling", async () => {
    setup({ disabled: true });
    await screen.findByText("Week 1");

    const fieldset = screen
      .getByRole("group", { name: /Propagate across existing sessions/i })
      .closest("fieldset")!;
    expect(fieldset).toHaveClass("opacity-60", "pointer-events-none");
  });
});
