/**
 * Date utility helpers for booking date logic
 */

/**
 * Get number of nights between two dates
 */
const getNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Get all dates in a range (inclusive start, exclusive end)
 */
const getDateRange = (checkIn, checkOut) => {
  const dates = [];
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const current = new Date(start);
  while (current < end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * Check if a date is a weekend
 */
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Check if date is in the past
 */
const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
};

/**
 * Format date to YYYY-MM-DD string
 */
const toDateString = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

/**
 * Get start of day (00:00:00)
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day (23:59:59)
 */
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Add hours to a date
 */
const addHours = (date, hours) => {
  const result = new Date(date);
  result.setTime(result.getTime() + hours * 60 * 60 * 1000);
  return result;
};

/**
 * Check if cancellation is allowed based on hours before check-in
 */
const isCancellationAllowed = (checkIn, deadlineHours = 24) => {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const deadlineMs = deadlineHours * 60 * 60 * 1000;
  return checkInDate.getTime() - now.getTime() >= deadlineMs;
};

module.exports = {
  getNights,
  getDateRange,
  isWeekend,
  isPastDate,
  toDateString,
  startOfDay,
  endOfDay,
  addHours,
  isCancellationAllowed,
};
