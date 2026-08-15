import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import { fadeInUp, staggerContainer, scaleIn } from "@/theme/animations";
import { ROUTES } from "@/constants/routes";

/**
 * Premium 404 — the catch-all route. Styled as a luxury dead-end with a
 * hairline gold monogram and clear exits.
 */
const NotFound = () => (
  <>
    <Seo
      title="Page not found"
      description="This page doesn't exist — let's get you back to your stay."
    />

    <section className="luxury-bg relative flex min-h-screen items-center overflow-hidden">
      <div className="lux-glow absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent"
        aria-hidden="true"
      />
      <Container>
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-2xl flex-col items-center py-32 text-center"
        >
          <motion.div
            variants={scaleIn}
            className="relative"
            aria-hidden="true"
          >
            <div className="absolute inset-0 -m-8 rounded-full bg-[#D4AF37]/10 blur-2xl" />
            <motion.p
              animate={{ opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative font-serif text-8xl leading-none text-amber-300 sm:text-9xl"
            >
              404
            </motion.p>
          </motion.div>
          <motion.p variants={fadeInUp} className="lux-eyebrow mt-8">
            The page has left the resort
          </motion.p>
          <motion.h1 variants={fadeInUp} className="lux-title mt-4">
            This path doesn't exist
          </motion.h1>
          <motion.p variants={fadeInUp} className="lux-body mt-5 max-w-md">
            The page you're looking for may have been moved or never existed.
            Let us walk you back to somewhere wonderful.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link to={ROUTES.HOME} className="lux-btn-gold">
              Return home
            </Link>
            <Link to={ROUTES.HOTELS} className="lux-btn-ghost">
              Browse hotels
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  </>
);

export default NotFound;
