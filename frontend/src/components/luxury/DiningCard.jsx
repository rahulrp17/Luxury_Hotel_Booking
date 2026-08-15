import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/Icons";
import StarRating from "@/components/ui/StarRating";
import { fadeInUp } from "@/theme/animations";

/**
 * Dining/restaurant card used in the Dining index.
 * @param {object} item { id, name, cuisine, poster, rating, tagline, price }
 */
const DiningCard = ({ item, index = 0 }) => {
  const to = `/dining/${item.id}`;

  return (
    <motion.article
      variants={fadeInUp}
      className="lux-glass group overflow-hidden"
    >
      <Link to={to} className="block">
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={item.poster || ""}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute left-4 top-4 lux-chip">{item.cuisine}</span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="lux-h2">{item.name}</h3>
            <StarRating value={item.rating || 5} />
          </div>
          <p className="lux-muted mt-2 line-clamp-2 text-sm">{item.tagline}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-[#E7C977]">
              <Icon name="mapPin" size={14} />
              {item.location || "All resorts"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F1D477]">
              Explore <Icon name="arrowRight" size={15} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default DiningCard;