import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/Icons";
import { fadeInUp } from "@/theme/animations";

/**
 * Premium experience / activity card. Sits on LuxuryCard glass.
 * item: { id, title, poster, duration, price, tagline, tag }
 */
const ExperienceCard = ({ item, index = 0 }) => {
  const to = `/experiences/${item.id}`;

  return (
    <motion.article
      variants={fadeInUp}
      className="lux-glass group overflow-hidden"
    >
      <Link to={to} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.poster || ""}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {item.tag && (
            <span className="absolute left-4 top-4 lux-chip">{item.tag}</span>
          )}
          {item.price && (
            <span className="absolute bottom-4 left-4 font-serif text-lg text-[#F1D477]">
              <span className="text-xs uppercase tracking-wider text-[#E7C977]">from </span>
              {item.price}
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#A8892D]">
            <Icon name="calendar" size={14} />
            <span>{item.duration}</span>
          </div>
          <h3 className="lux-h2 mt-3">{item.title}</h3>
          <p className="lux-muted mt-2 line-clamp-2 text-sm">{item.tagline}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#F1D477]">
            Explore <Icon name="arrowRight" size={16} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

export default ExperienceCard;