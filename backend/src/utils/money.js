/**
 * Format a numeric amount into a human-readable currency string.
 * Used by in-app notification messages and email templates so amounts render
 * consistently (e.g. ₹35,400.00).
 */
const formatMoney = (amount, currency = "INR") => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${currency} 0`;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (err) {
    return `${currency} ${value}`;
  }
};

module.exports = { formatMoney };