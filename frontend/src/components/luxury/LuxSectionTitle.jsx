import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/theme/animations";

/**
 * Dark-luxury section heading: gold eyebrow, serif title, muted description.
 * Wraps itself in a stagger reveal container for a slow, considered entrance.
 */
const LuxSectionTitle = ({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
  children,
}) => {
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";
  const center = align === "center";

  return (
    <motion.div
      variants={staggerContainer(0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className={`flex flex-col ${alignClass} ${className}`}
    >
      {eyebrow && (
        <motion.span
          variants={fadeInUp}
          className="lux-eyebrow mb-4 flex items-center gap-3"
        >
          <span className={`h-px w-10 bg-[#D4AF37]/60 ${center ? "" : ""}`} />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2 variants={fadeInUp} className="lux-title">
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeInUp}
          className={`lux-body  max-w-2xl ${center ? "mx-auto" : ""}`}
        >
          {description}
        </motion.p>
      )}
      {children && (
        <motion.div variants={fadeInUp} className="mt-2">
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

export default LuxSectionTitle;