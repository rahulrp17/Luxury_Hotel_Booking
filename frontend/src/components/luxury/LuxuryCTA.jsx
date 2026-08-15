import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeInUp } from "@/theme/animations";

/**
 * Full-width gold call-to-action band. Reused at the foot of marketing pages
 * to draw guests towards booking or contacting the concierge. Internal paths
 * render as client-side <Link>s; anything else (hash anchors, external) falls
 * back to a plain anchor so both keep working.
 */
const LuxuryCTA = ({
  eyebrow = "Begin your journey",
  title = "Your private stays, moments away",
  description = "Speak to our concierge or reserve a suite tonight — the Aurelia Stay standard is yours to discover.",
  primaryLabel = "Reserve a stay",
  primaryTo = "/hotels",
  secondaryLabel = "Contact the concierge",
  secondaryTo = "/contact",
}) => {
  const internal = (path) => typeof path === "string" && path.startsWith("/") && !path.startsWith("#") && !path.startsWith("http");
  const Primary = internal(primaryTo) ? Link : "a";
  const Secondary = internal(secondaryTo) ? Link : "a";
  const primaryProps = internal(primaryTo) ? { to: primaryTo } : { href: primaryTo };
  const secondaryProps = internal(secondaryTo) ? { to: secondaryTo } : { href: secondaryTo };

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="lux-glow absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 container-lux py-16 sm:py-20">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="lux-glass flex flex-col items-center gap-8 px-6 py-12 text-center sm:px-12 lg:flex-row lg:justify-between lg:text-left"
        >
          <div className="max-w-xl">
            <p className="lux-eyebrow mb-3">{eyebrow}</p>
            <h2 className="lux-title">{title}</h2>
            <p className="lux-body mt-4">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Primary className="lux-btn-gold" {...primaryProps}>
              {primaryLabel}
            </Primary>
            <Secondary className="lux-btn-ghost" {...secondaryProps}>
              {secondaryLabel}
            </Secondary>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LuxuryCTA;