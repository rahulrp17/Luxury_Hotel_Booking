/**
 * Escape a user-supplied string so it can be embedded in a RegExp literal
 * safely. Prevents ReDoS/operator-characters from reaching the engine when a
 * query value is turned into a case-insensitive match.
 */
const escapeRegex = (value) =>
  String(value == null ? "" : value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { escapeRegex };