import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Icon from "@/components/ui/Icons";
import { fadeInUp } from "@/theme/animations";

/**
 * Generic route stub used by the foundation router. Real pages will replace
 * these; this confirms routing + guards + layout work end-to-end.
 */
const Placeholder = ({ title = "Coming soon" }) => (
  <div className="container-lux flex flex-col items-center justify-center py-24 text-center">
    <Seo title={title} />
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center"
    >
      <div className="mb-4 rounded-full bg-gold-100 p-4 text-gold-600">
        <Icon name="info" size={28} />
      </div>
      <h1 className="text-2xl font-semibold text-brand-900">{title}</h1>
      <p className="mt-2 max-w-md text-brand-500">
        This section is part of the app foundation and is ready to be built out.
      </p>
    </motion.div>
  </div>
);

export default Placeholder;