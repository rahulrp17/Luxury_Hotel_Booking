import { useEffect } from "react";

const BRAND = "Luxury Hotel Booking";

/**
 * Lightweight document-title hook. Prefer the <Seo /> component for richer
 * meta; this is handy for quick imperative title updates.
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : BRAND;
  }, [title]);
};

export default useDocumentTitle;