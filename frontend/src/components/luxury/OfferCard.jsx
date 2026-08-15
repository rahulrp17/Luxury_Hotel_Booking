import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/Icons";
import { fadeInUp } from "@/theme/animations";

/**
 * Curated offer / package card with gold code pill.
 * @param {object} item { id, title, tagline, code, poster, terms, validUntil }
 */
const OfferCard = ({ item, index = 0 }) => {
  return (
    <motion.article variants={fadeInUp} className="lux-glass group relative overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={item.poster || ""}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {item.code && (
          <span className="absolute right-4 top-4 rounded-full border border-[#F1D477]/60 bg-black/50 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-[#F1D477] backdrop-blur-md">
            {item.code}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="lux-h2">{item.title}</h3>
        <p className="lux-muted mt-2 text-sm leading-relaxed">{item.tagline}</p>
        {item.terms && item.terms.length > 0 && (
          <ul className="lux-muted mt-4 space-y-1.5 text-xs opacity-70">
            {item.terms.slice(0, 3).map((term) => (
              <li key={term} className="flex items-start gap-2">
                <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-[#D4AF37]" aria-hidden="true" />
                {term}
              </li>
            ))}
          </ul>
        )}
        {item.validUntil && (
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#A8892D]">
            Valid until {item.validUntil}
          </p>
        )}
        <Link to="/hotels" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F1D477]">
          Claim this offer <span aria-hidden="true">→</span>
        </Link>
      </div>
    </motion.article>
  );
};

export default OfferCard;