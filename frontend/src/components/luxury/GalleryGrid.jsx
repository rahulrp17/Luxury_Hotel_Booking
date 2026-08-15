import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/theme/animations";

/**
 * Responsive luxury image grid with layered glass frames and a captioning
 * quote strip. `images` are `{ src, alt }`; `quote` optionally renders a
 * rotatable caption overlaid on the featured cell.
 */
const GalleryGrid = ({ images = [], className = "" }) => {
  if (!images.length) return null;

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {images.map((image, index) => {
        const featured = index === 0;
        return (
          <motion.div
            key={image.src}
            variants={fadeInUp}
            className={`group relative overflow-hidden ${
              featured ? "sm:col-span-2 lg:col-span-1 sm:row-span-2" : ""
            }`}
          >
            <div
              className={`overflow-hidden rounded-2xl border border-[#D4AF37]/15 ${
                featured ? "h-full min-h-64" : "aspect-[4/3]"
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-sm font-medium text-[#F8F6F0]">{image.alt}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default GalleryGrid;