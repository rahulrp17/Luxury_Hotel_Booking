/**
 * Normalise an Axios / runtime error into a human-readable message.
 */
export const extractErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  const raw =
    error.response?.data?.message ||
    error.response?.data?.errors ||
    error.message ||
    fallback;

  if (Array.isArray(raw)) {
    const joined = raw
      .map((item) => (typeof item === "string" ? item : item?.message))
      .filter(Boolean)
      .join(", ");
    return joined || fallback;
  }

  return typeof raw === "string" ? raw : fallback;
};

/** Convenience for thunks to pull an error message for toasts. */
export const toErrorMessage = (error, fallback) =>
  extractErrorMessage(error, fallback);
