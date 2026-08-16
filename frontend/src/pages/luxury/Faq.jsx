import { useState } from "react";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import LuxuryCard from "@/components/luxury/LuxuryCard";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { FAQ_CATEGORIES } from "@/data/luxury/faqs";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";

/**
 * /faq — grouped accordion of frequently asked questions.
 */
const Faq = () => {
  const [active, setActive] = useState({ group: 0, index: 0 });

  const toggle = (groupIndex, index) =>
    setActive((prev) =>
      prev.group === groupIndex && prev.index === index
        ? { group: -1, index: -1 }
        : { group: groupIndex, index }
    );

  return (
    <>
      <Seo title="FAQs" description="Answers to common questions about bookings, stays, payments and getting to Aurelia Stay." />

      <section className="bg-[#0B0B0B]">
        <Container className="py-28 sm:py-32">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <p className="lux-eyebrow flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-[#D4AF37]/60" aria-hidden="true" />
              Frequently asked
              <span className="h-px w-10 bg-[#D4AF37]/60" aria-hidden="true" />
            </p>
            <h1 className="lux-title mt-4">Everything you need to know</h1>
            <p className="lux-body mt-5 mx-auto max-w-xl">
              From bookings and refunds to getting here — if you can't find your answer, the concierge is one message away.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-14 max-w-3xl space-y-10"
          >
            {FAQ_CATEGORIES.map((group, groupIndex) => (
              <motion.section key={group.category} variants={fadeInUp}>
                <h2 className="lux-h2">{group.category}</h2>
                <div className="lux-hairline mt-4" />
                <div className="mt-4 space-y-3">
                  {group.questions.map((item, index) => {
                    const open = active.group === groupIndex && active.index === index;
                    return (
                      <LuxuryCard key={item.q} className="overflow-hidden p-0">
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => toggle(groupIndex, index)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:ring-2 focus-visible:ring-[#F1D477]"
                        >
                          <span className="font-medium text-amber-200">{item.q}</span>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 text-[#F1D477] transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </button>
                        {open && (
                          <p className="lux-muted px-5 pb-5 text-sm leading-relaxed">{item.a}</p>
                        )}
                      </LuxuryCard>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </motion.div>

          <div className="mx-auto mt-14 max-w-3xl text-center">
            <p className="lux-muted text-sm">Still have a question?</p>
            <Link to={ROUTES.CONTACT} className="lux-btn-gold mt-5">
              Contact the concierge
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Faq;