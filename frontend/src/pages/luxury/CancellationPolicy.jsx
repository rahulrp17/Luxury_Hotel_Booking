import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { CANCELLATION_SECTIONS } from "@/data/luxury/legal";

/**
 * /cancellation-policy — cancellation and refund document.
 */
const CancellationPolicy = () => (
  <>
    <Seo title="Cancellation Policy" description="Aurelia Stay cancellation and refund policy." />

    <section className="bg-[#0B0B0B]">
      <Container className="py-28 sm:py-32">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto max-w-3xl">
          <p className="lux-eyebrow flex items-center gap-3">
            <span className="h-px w-10 bg-[#D4AF37]/60" aria-hidden="true" />
            Legal
          </p>
          <h1 className="lux-title mt-4">Cancellation Policy</h1>
          <p className="lux-muted mt-3 text-sm">Last updated: August 2026</p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-12 max-w-3xl space-y-6"
        >
          {CANCELLATION_SECTIONS.map((section) => (
            <motion.div key={section.title} variants={fadeInUp} className="lux-glass p-6">
              <h2 className="lux-h2">{section.title}</h2>
              <div className="lux-hairline mt-4" />
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="lux-muted text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  </>
);

export default CancellationPolicy;