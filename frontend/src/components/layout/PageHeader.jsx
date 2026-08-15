import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import Breadcrumb from "@/components/ui/Breadcrumb";

const ALIGN = {
  left: "text-left",
  center: "text-center mx-auto",
};

/**
 * Page hero header with optional eyebrow, breadcrumb, title and description.
 * Entrance is a staggered fade-up via Framer Motion.
 */
const PageHeader = ({
  eyebrow,
  title,
  description,
  breadcrumb,
  align = "left",
  className = "",
}) => {
  const alignClass = ALIGN[align] || ALIGN.left;
  const centerWrap = align === "center" ? "flex justify-center" : "";

  return (
    <motion.header
      variants={staggerContainer(0.12)}
      initial="hidden"
      animate="visible"
      className={`container-lux pb-8 pt-12 sm:pt-16 ${className}`}
    >
      {breadcrumb && (
        <motion.div variants={fadeInUp} className={centerWrap}>
          <Breadcrumb items={breadcrumb} />
        </motion.div>
      )}
      {eyebrow && (
        <motion.p
          variants={fadeInUp}
          className={`mb-2 text-sm font-semibold uppercase tracking-widest text-gold-600 ${alignClass}`}
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h1
        variants={fadeInUp}
        className={`font-serif text-3xl font-semibold text-brand-900 sm:text-4xl lg:text-5xl ${alignClass}`}
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p variants={fadeInUp} className={`mt-3 max-w-2xl text-brand-500 ${alignClass}`}>
          {description}
        </motion.p>
      )}
    </motion.header>
  );
};

export default PageHeader;
