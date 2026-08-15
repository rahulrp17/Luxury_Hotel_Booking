import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/Icons";
import { fadeInUp } from "@/theme/animations";

/**
 * Destination card (Discover page). Links to the destination overview.
 * @param {object} item { slug, name, country, tagline, poster, hotels }
 */
const DestinationCard = ({ item, index = 0 }) => {
  const to = `/destinations/${item.slug}`;

  return (
    <motion.article variants={fadeInUp} className="lux-glass group relative overflow-hidden">
      <Link to={to} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={item.poster || ""}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="lux-chip mb-3 opacity-90">
              <Icon name="mapPin" size={13} />
              {item.country}
            </p>
            <h3 className="lux-h2">{item.name}</h3>
            <p className="lux-muted mt-1.5 line-clamp-2 text-sm">{item.tagline}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#F1D477]">
              View {item.hotels?.length || 0} resorts
              <Icon name="arrowRight" size={15} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default DestinationCard;