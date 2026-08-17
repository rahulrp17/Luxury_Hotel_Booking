import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icons";
import Image from "@/components/ui/Image";
import useEscapeKey from "@/hooks/useEscapeKey";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import useFocusTrap from "@/hooks/useFocusTrap";
import { offerService } from "@/services";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/constants/routes";
import { getFallbackAsset } from "@/constants/assets";
import { getOfferDiscountLabel, getOfferValidityLabel } from "@/utils/offerUtils";
import { EASE } from "@/theme/animations";

const OPEN_DELAY_MS = 1600;

// Session-only dismissal: a module-level flag (not localStorage) so the popup
// re-appears on every page refresh, while still not re-opening right after the
// user closes it during the current page / SPA session.
let dismissedOfferId = null;

/** Has the user already dismissed this offer in this page session? */
const isDismissed = (offer) => dismissedOfferId === offer?._id;

/**
 * Premium entrance-offer popup for the homepage.
 *
 * Once the page has finished loading it fetches the single latest *active*
 * offer (GET /offers/active?limit=1 — the API only returns currently valid,
 * redeemable offers, newest first, so `data[0]` is the one to feature) and
 * presents it as a black-and-gold luxury modal using the offer's own banner
 * image. Dismissal (✕ / Escape / backdrop) is remembered only for the current
 * page session, so the popup returns on the next refresh while not re-opening
 * immediately after closing. Rendered through a portal at the top overlay
 * layer, centered and responsive, with a dimmed/blurred backdrop, body scroll
 * lock and a focus trap — so it never shifts layout, never duplicates, and
 * never opens beneath another modal.
 */
const OfferWelcomeModal = () => {
  const panelRef = useRef(null);
  const [pageReady, setPageReady] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: response } = useQuery({
    queryKey: [QUERY_KEYS.ACTIVE_OFFERS, "welcome"],
    queryFn: () => offerService.getActive({ limit: 1 }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const latest = response?.data?.[0] || null;

  // "After initial page loading completes" — wait for the window `load` event.
  // SPA navigations to Home already have readyState === "complete".
  useEffect(() => {
    if (document.readyState === "complete") {
      setPageReady(true);
      return undefined;
    }
    const onLoad = () => setPageReady(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Auto-open once: page ready + an active offer + not already dismissed + no
  // other dialog is already on top. A short delay lets the hero settle first.
  useEffect(() => {
    if (!pageReady || !latest || isDismissed(latest)) return undefined;
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return undefined;

    const timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pageReady, latest]);

  const close = useCallback(() => {
    if (latest) dismissedOfferId = latest._id;
    setOpen(false);
  }, [latest]);

  useEscapeKey(close, open);
  useLockBodyScroll(open);
  useFocusTrap(panelRef, open);

  if (!latest) return null;

  const titleId = "offer-welcome-title";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-overlay flex items-center justify-center p-4">
          {/* Backdrop — dimmed + blurred */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-[#D4AF37]/30 bg-[#0B0B0B]/95 text-[#F8F6F0] shadow-[0_0_80px_rgba(212,175,55,0.18)] backdrop-blur-xl sm:max-w-lg"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.96 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {/* Offer banner image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={latest.banner?.url}
                alt={latest.title}
                fallbackSrc={getFallbackAsset("offer", 0)}
                kind="offer"
                cover
                rounded="rounded-none"
                aspect="aspect-auto"
                className="absolute inset-0"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/25 to-transparent"
                aria-hidden="true"
              />

              {/* Close */}
              <button
                type="button"
                onClick={close}
                aria-label="Close offer"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#F1D477]/40 bg-black/60 text-[#F1D477] backdrop-blur-md transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-[#F1D477]/70"
              >
                <Icon name="close" size={18} />
              </button>

              {/* Discount badge */}
              <span className="absolute left-4 top-4 z-10 rounded-full border border-[#F1D477]/60 bg-black/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#F1D477] backdrop-blur-md">
                {getOfferDiscountLabel(latest)}
              </span>
            </div>

            {/* Body */}
            <div className="px-6 pb-7 pt-5 sm:px-8 sm:pb-8">
              <p className="lux-eyebrow">Limited-Time Offer</p>
              <h2 id={titleId} className="lux-h2 mt-2">
                {latest.title}
              </h2>

              {latest.description && (
                <p className="lux-muted mt-3 text-sm leading-relaxed">
                  {latest.description}
                </p>
              )}

              {latest.code && (
                <p className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C9AB4B]">
                  <span>Use code</span>
                  <span className="rounded border border-[#D4AF37]/30 bg-black/40 px-2.5 py-1 font-mono tracking-[0.25em] text-[#F1D477]">
                    {latest.code}
                  </span>
                </p>
              )}

              <p className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#A8892D]">
                <Icon name="calendar" size={13} />
                {getOfferValidityLabel(latest)}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={ROUTES.OFFERS}
                  onClick={close}
                  className="lux-btn-gold flex-1 px-6 py-3 text-sm"
                >
                  View all offers
                </Link>
                <Link
                  to={ROUTES.HOTELS}
                  onClick={close}
                  className="lux-btn-ghost flex-1 px-6 py-3 text-sm"
                >
                  Explore stays
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default OfferWelcomeModal;