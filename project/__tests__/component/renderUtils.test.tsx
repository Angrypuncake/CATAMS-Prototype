import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { defaultRender } from "../../components/DynamicTable/renderUtils";

describe("renderUtils - defaultRender", () => {
  describe("Edge cases for exotic types", () => {
    test("should render function as string", () => {
      const testFunction = function testFunc() {
        return "test";
      };

      const result = defaultRender(testFunction);
      const { container } = render(<div>{result}</div>);

      // Functions should be converted to string
      expect(container.textContent).toContain("function");
    });

    test("should render symbol as string", () => {
      const testSymbol = Symbol("test");

      const result = defaultRender(testSymbol);
      const { container } = render(<div>{result}</div>);

      // Symbols should be converted to string
      expect(container.textContent).toContain("Symbol");
    });

    test("should handle arrow function", () => {
      const arrowFunc = () => "test";

      const result = defaultRender(arrowFunc);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBeTruthy();
    });

    test("should handle bigint", () => {
      const bigIntValue = BigInt(9007199254740991);

      const result = defaultRender(bigIntValue);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe("9007199254740991");
    });

    test("should handle async function", () => {
      const asyncFunc = async () => "test";

      const result = defaultRender(asyncFunc);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toContain("async");
    });
  });

  describe("Standard type coverage", () => {
    test("should render null as dash", () => {
      const result = defaultRender(null);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe("—");
    });

    test("should render undefined as dash", () => {
      const result = defaultRender(undefined);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe("—");
    });

    test("should render boolean as chip", () => {
      const trueResult = defaultRender(true);
      const { container: trueContainer } = render(<div>{trueResult}</div>);
      expect(trueContainer.textContent).toBe("True");

      const falseResult = defaultRender(false);
      const { container: falseContainer } = render(<div>{falseResult}</div>);
      expect(falseContainer.textContent).toBe("False");
    });

    test("should render string with truncation", () => {
      const shortString = "Hello";
      const result = defaultRender(shortString);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe("Hello");
    });

    test("should render number as string", () => {
      const result = defaultRender(42);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe("42");
    });

    test("should render date with formatting", () => {
      const date = new Date("2023-01-15");
      const result = defaultRender(date);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toContain("2023");
    });

    test("should render primitive array with chips", () => {
      const arr = ["react", "typescript"];
      const result = defaultRender(arr, 5);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toContain("react");
      expect(container.textContent).toContain("typescript");
    });

    test("should render non-primitive array with inspect button", () => {
      const arr = [{ name: "test" }, { name: "test2" }];
      const result = defaultRender(arr);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toContain("name");
    });

    test("should render object with inspect button", () => {
      const obj = { name: "Elvis", age: 30 };
      const result = defaultRender(obj);
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toContain("Elvis");
    });
  });
});
