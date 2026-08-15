import { OFFER_TYPES } from "@/constants/enums";
import { formatCurrency, formatDate } from "@/utils/formatters";

/**
 * Shared offer display helpers. These are presentation-only (labels, status,
 * validity, usage counts) — the authoritative discount math stays server-side
 * in the booking / validate flow.
 */

/**
 * Whether an offer is currently redeemable: active, within its date window,
 * and not fully used up. Mirrors the backend `Offer.isValid` virtual.
 */
export const isOfferValid = (offer, now = new Date()) => {
  if (!offer || offer.isActive === false) return false;

  const start = offer.startDate ? new Date(offer.startDate) : null;
  const end = offer.endDate ? new Date(offer.endDate) : null;

  if (start && start > now) return false;
  if (end && end < now) return false;

  if (offer.usageLimit && (offer.usedCount || 0) >= offer.usageLimit) return false;

  return true;
};

/**
 * Remaining uses before an offer is fully redeemed. `null` = unlimited.
 */
export const getOfferUsageLeft = (offer) => {
  if (!offer?.usageLimit) return null;
  return Math.max(0, offer.usageLimit - (offer.usedCount || 0));
};

/**
 * Human-readable discount summary, e.g. "20% off (up to ₹1,000)",
 * "₹500 off" or "Free night" — mirrors the backend formatOfferDiscount.
 */
export const getOfferDiscountLabel = (offer) => {
  const value = Number(offer?.value) || 0;

  switch (offer?.type) {
    case OFFER_TYPES.PERCENTAGE:
      return offer.maxDiscountAmount
        ? `${value}% off (up to ${formatCurrency(offer.maxDiscountAmount)})`
        : `${value}% off`;
    case OFFER_TYPES.FREE_NIGHT:
      return "Free night";
    case OFFER_TYPES.FLAT:
    default:
      return `${formatCurrency(value)} off`;
  }
};

/**
 * Compact validity label for a card footer.
 */
export const getOfferValidityLabel = (offer) => {
  if (!offer) return "—";

  if (offer.startDate && offer.endDate) {
    return `${formatDate(offer.startDate)} → ${formatDate(offer.endDate)}`;
  }

  return `Valid until ${formatDate(offer.endDate)}`;
};