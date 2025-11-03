import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { TutorCombo } from "../../../app/admin/allocations/components/TutorCombo";
import type { Tutor } from "../../../app/_types/tutor";

describe("TutorCombo", () => {
  const mockTutors: Tutor[] = [
    {
      user_id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
    },
    {
      user_id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
    },
    {
      user_id: 3,
      first_name: "Bob",
      last_name: "Wilson",
      email: "bob.wilson@example.com",
    },
  ];

  const mockOnChange = jest.fn();

  const renderTutorCombo = (props?: Partial<React.ComponentProps<typeof TutorCombo>>) =>
    render(<TutorCombo options={mockTutors} valueId={null} onChange={mockOnChange} {...props} />);

  beforeEach(() => jest.clearAllMocks());

  describe("basic rendering", () => {
    test("shows placeholder when no tutor selected", () => {
      renderTutorCombo();
      expect(screen.getByText("Select tutor…")).toBeInTheDocument();
    });

    test("displays selected tutor name and email", () => {
      renderTutorCombo({ valueId: 1 });
      expect(screen.getByText("John Doe (john.doe@example.com)")).toBeInTheDocument();
    });
  });

  describe("dropdown behavior", () => {
    test("opens on click and closes after selection", () => {
      renderTutorCombo();
      fireEvent.click(screen.getByText("Select tutor…"));
      expect(screen.getByPlaceholderText("Search name or email…")).toBeInTheDocument();

      fireEvent.click(screen.getByText("John Doe"));
      expect(mockOnChange).toHaveBeenCalledWith(mockTutors[0]);
      expect(screen.queryByPlaceholderText("Search name or email…")).not.toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it.each([
      ["name", "Jane", "Jane Smith"],
      ["email", "bob.wilson", "Bob Wilson"],
    ])("filters tutors by %s", (_, query, expectedName) => {
      renderTutorCombo();
      fireEvent.click(screen.getByText("Select tutor…"));
      fireEvent.change(screen.getByPlaceholderText("Search name or email…"), {
        target: { value: query },
      });
      expect(screen.getByText(expectedName)).toBeInTheDocument();
    });

    test("ignores tutors without matching email", () => {
      const tutors = [
        {
          user_id: 7,
          first_name: "Has",
          last_name: "Email",
          email: "has@example.com",
        },
        { user_id: 8, first_name: "No", last_name: "Email", email: null },
      ] as unknown as Tutor[];

      renderTutorCombo({ options: tutors });
      fireEvent.click(screen.getByText("Select tutor…"));
      fireEvent.change(screen.getByPlaceholderText("Search name or email…"), {
        target: { value: "has@" },
      });
      expect(screen.getByText("Has Email")).toBeInTheDocument();
      expect(screen.queryByText("No Email")).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it.each([
      [
        "missing first_name",
        {
          user_id: 4,
          first_name: null,
          last_name: "Incomplete",
          email: "incomplete@example.com",
        },
        "Incomplete (incomplete@example.com)",
      ],
      [
        "missing email",
        { user_id: 5, first_name: "NoEmail", last_name: "User", email: null },
        "NoEmail User",
      ],
      [
        "empty email",
        { user_id: 6, first_name: "Empty", last_name: "Email", email: "" },
        "Empty Email",
      ],
    ])("handles tutor with %s", (_, tutorData, expectedText) => {
      renderTutorCombo({
        options: [tutorData as unknown as Tutor],
        valueId: tutorData.user_id,
      });
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it.each([
      [
        "null first_name",
        {
          user_id: 9,
          first_name: null,
          last_name: "LastOnly",
          email: "last@example.com",
        },
        "LastOnly",
      ],
      [
        "null last_name",
        {
          user_id: 10,
          first_name: "FirstOnly",
          last_name: null,
          email: "first@example.com",
        },
        "FirstOnly",
      ],
    ])("handles %s in dropdown", (_, tutorData, expectedText) => {
      renderTutorCombo({ options: [tutorData as unknown as Tutor] });
      fireEvent.click(screen.getByText("Select tutor…"));
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    test("filters tutors with null names correctly", () => {
      const tutorsWithNullNames = [
        {
          user_id: 11,
          first_name: null,
          last_name: "Searchable",
          email: "search@example.com",
        },
        {
          user_id: 12,
          first_name: "Other",
          last_name: "Tutor",
          email: "other@example.com",
        },
      ] as unknown as Tutor[];

      renderTutorCombo({ options: tutorsWithNullNames });
      fireEvent.click(screen.getByText("Select tutor…"));
      fireEvent.change(screen.getByPlaceholderText("Search name or email…"), {
        target: { value: "searchable" },
      });

      expect(screen.getByText("Searchable")).toBeInTheDocument();
      expect(screen.queryByText("Other Tutor")).not.toBeInTheDocument();
    });
  });
});
