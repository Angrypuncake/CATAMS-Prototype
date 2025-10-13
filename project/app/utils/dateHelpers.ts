export function getCurrentYearAndSession() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JS months are 0-indexed

  // Simple rule: Jan–Jun = S1, Jul–Dec = S2
  const session = month >= 7 ? "S2" : "S1";

  return { year, session };
}
