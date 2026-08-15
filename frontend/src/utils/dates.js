/**
 * Date helpers shared by the room availability widget and the booking flow.
 * All day-level math is done in LOCAL time so UI dates stay aligned with the
 * user's calendar (backend compares date strings/ISO instants independently).
 */

const pad = (n) => String(n).padStart(2, "0");

/** Date → "YYYY-MM-DD" (local). */
export const toISODate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** "YYYY-MM-DD" → local Date at midnight. */
export const fromISODate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** Return a new Date `days` later (or earlier when negative). */
export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Whole days between two dates (end - start), local. */
export const daysBetween = (startIso, endIso) => {
  const start = fromISODate(startIso);
  const end = fromISODate(endIso);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
};

/** Inclusive list of local Dates from startIso to endIso. */
export const getDateRange = (startIso, endIso) => {
  const start = fromISODate(startIso);
  const end = fromISODate(endIso);
  const range = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) range.push(new Date(d));
  return range;
};

/** "YYYY-MM-DD" → long human label, e.g. "14 Aug 2026". */
export const formatISODate = (iso) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fromISODate(iso));
