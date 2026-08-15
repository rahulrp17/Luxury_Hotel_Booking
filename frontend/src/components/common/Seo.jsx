import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import config from "@/config";

const BRAND = "AureliaStay";
const DEFAULT_TITLE = "Luxury Hotel Booking";
const DEFAULT_DESCRIPTION =
  "AureliaStay — curated luxury hotels and resorts with seamless booking, guaranteed rates and white-glove service.";

/** Resolve the absolute canonical URL from the configured site URL (or origin). */
const canonicalUrl = (path) =>
  `${(config.siteUrl || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "")}${path}`;

/**
 * SEO/head manager wrapper. Each page renders <Seo title="..." description="..." />
 * and the async Helmet provider (wired in main.jsx) updates <head>.
 *
 * Adds per-route canonical URLs and Open Graph / X (Twitter) card metadata so
 * shared links render well across Google, WhatsApp, X and LinkedIn.
 */
const Seo = ({ title, description, image, type = "website" }) => {
  const { pathname } = useLocation();
  const fullTitle = title ? `${BRAND} | ${title}` : `${BRAND} | ${DEFAULT_TITLE}`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const canonical = canonicalUrl(pathname);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={BRAND} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default Seo;