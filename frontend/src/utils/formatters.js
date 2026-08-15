/**
 * Formatting helpers (currency, dates, text).
 */

const CURRENCY = "INR";

export const formatCurrency = (amount, currency = CURRENCY) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

export const formatDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "—";
  return `${formatDate(checkIn)} → ${formatDate(checkOut)}`;
};

export const formatDateTime = (date) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

export const truncate = (text = "", length = 120) =>
  text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
