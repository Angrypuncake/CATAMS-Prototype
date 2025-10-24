// Suppress specific console warnings during tests
const originalError = console.error;
const originalWarn = console.warn;

// Create wrapper functions that filter specific warnings
const filteredError = (...args: unknown[]) => {
  // Suppress React act() warnings - these are expected for async state updates
  if (
    typeof args[0] === "string" &&
    args[0].includes("not wrapped in act(...)")
  ) {
    return;
  }
  // Suppress React key prop warnings in tests
  if (
    typeof args[0] === "string" &&
    args[0].includes('Each child in a list should have a unique "key" prop')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

const filteredWarn = (...args: unknown[]) => {
  // Suppress MUI Grid v2 migration warnings - already fixed in code
  if (
    typeof args[0] === "string" &&
    args[0].includes("MUI Grid: The `md` prop has been removed")
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Only apply filters if console methods haven't been mocked by tests
beforeEach(() => {
  // Check if console.error is the original or our filtered version
  if (console.error === originalError || console.error === filteredError) {
    console.error = filteredError;
  }

  // Check if console.warn is the original or our filtered version
  if (console.warn === originalWarn || console.warn === filteredWarn) {
    console.warn = filteredWarn;
  }
});

// Restore only if our filters are still in place (not mocked by test)
afterEach(() => {
  if (console.error === filteredError) {
    console.error = originalError;
  }

  if (console.warn === filteredWarn) {
    console.warn = originalWarn;
  }
});
