import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/Icons";
import Image from "@/components/ui/Image";
import { getFallbackAsset } from "@/constants/assets";
import { ROUTES } from "@/constants/routes";
import { notify } from "@/services";
import { formatCurrency } from "@/utils/formatters";
import { fadeInUp } from "@/theme/animations";
import {
  getOfferDiscountLabel,
  getOfferUsageLeft,
  getOfferValidityLabel,
  isOfferValid,
} from "@/utils/offerUtils";

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    notify.success(`Code ${code} copied — apply it at checkout.`);
  } catch {
    notify.error(`Couldn't copy automatically — please note the code: ${code}`);
  }
};

/**
 * Live offer / promotion card matching the AdminOffers model.
 * @param {object} offer - Offer document from the API (code, title, description,
 *   type, value, maxDiscountAmount, minBookingAmount, startDate, endDate,
 *   usageLimit, perUserLimit, isActive, banner).
 * @param {number} index - Rotates the local fallback image.
 */
const OfferCard = ({ offer, index = 0 }) => {
  const valid = isOfferValid(offer);
  const usageLeft = getOfferUsageLeft(offer);
  const fallback = getFallbackAsset("offer", index);

  return (
    <motion.article
      variants={fadeInUp}
      className={`lux-glass group relative overflow-hidden ${valid ? "" : "opacity-60"}`}
    >
      {/* Banner */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={offer.banner?.url}
          alt={offer.title}
          fallbackSrc={fallback}
          kind="offer"
          cover
          hover
          overlay
          rounded="rounded-none"
          aspect="aspect-auto"
          className="absolute inset-0"
        />

        {/* Discount badge */}
        <span className="absolute left-4 top-4 z-10 rounded-full border border-[#F1D477]/60 bg-black/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#F1D477] backdrop-blur-md">
          {getOfferDiscountLabel(offer)}
        </span>

        {/* Code pill / status pill */}
        {offer.code && (
          <span
            className={`absolute right-4 top-4 z-10 rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] backdrop-blur-md ${
              valid
                ? "border-[#F1D477]/60 bg-black/50 text-[#F1D477]"
                : "border-white/20 bg-black/60 text-white/60"
            }`}
          >
            {offer.code}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="lux-h2">{offer.title}</h3>

        {offer.description && (
          <p className="lux-muted mt-2 flex-1 text-sm leading-relaxed">{offer.description}</p>
        )}

        {/* Meta */}
        <div className="mt-5 space-y-1.5 text-xs text-[#A8892D]">
          <p className="flex items-center gap-2 uppercase tracking-[0.18em]">
            <Icon name="calendar" size={13} />
            {getOfferValidityLabel(offer)}
          </p>
          <p className="flex items-center gap-2 uppercase tracking-[0.18em]">
            <Icon name="users" size={13} />
            {usageLeft === null
              ? "Unlimited redemptions"
              : usageLeft === 0
                ? "Fully redeemed"
                : `${usageLeft} redemption${usageLeft === 1 ? "" : "s"} left`}
          </p>
          {offer.minBookingAmount > 0 && (
            <p className="flex items-center gap-2 uppercase tracking-[0.18em]">
              <Icon name="shield" size={13} />
              Min. booking {formatCurrency(offer.minBookingAmount)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#D4AF37]/15 pt-5">
          <Link
            to={ROUTES.HOTELS}
            className={`lux-btn-gold px-5 py-2.5 text-xs ${valid ? "" : "pointer-events-none opacity-50"}`}
          >
            Claim this offer <span aria-hidden="true">→</span>
          </Link>

          {offer.code && (
            <button
              type="button"
              onClick={() => copyCode(offer.code)}
              disabled={!valid}
              className="lux-btn-ghost px-5 py-2.5 text-xs"
              aria-label={`Copy offer code ${offer.code}`}
            >
              Copy code
            </button>
          )}
        </div>

        {!valid && (
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            This offer is currently unavailable
          </p>
        )}
      </div>
    </motion.article>
  );
};

export default OfferCard;