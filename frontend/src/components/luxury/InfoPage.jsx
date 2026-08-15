import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import Icon from "@/components/ui/Icons";
import { ROUTES } from "@/constants/routes";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import LuxuryHero from "./LuxuryHero";
import LuxSectionTitle from "./LuxSectionTitle";
import LuxuryCTA from "./LuxuryCTA";

/**
 * Shared premium layout for informational pages — the About family (philosophy,
 * awards, sustainability, press, careers) and the contact-service family
 * (reservations, support, locations, weddings, corporate). Renders a consistent
 * luxury structure — hero → intro (split w/ points) → sections (cards / rows)
 * → CTA — entirely driven by a `page` content object from
 * data/luxury/aboutCollections.js or serviceCollections.js.
 */
const InfoPage = ({ page, primaryTo = ROUTES.HOTELS, primaryLabel = "Reserve a Stay", secondaryTo = ROUTES.CONTACT, secondaryLabel = "Contact the Concierge" }) => {
  const { seo, hero, intro, sections, cta } = page;

  const ctaProps = {
    eyebrow: cta?.eyebrow || "Begin your journey",
    title: cta?.title || "Reserve your stay",
    description: cta?.description || "",
    primaryLabel: cta?.primaryLabel || primaryLabel,
    primaryTo: cta?.primaryTo || primaryTo,
    secondaryLabel: cta?.secondaryLabel || secondaryLabel,
    secondaryTo: cta?.secondaryTo || secondaryTo,
  };

  return (
    <>
      <Seo title={seo.title} description={seo.description} image={hero.image} />

      {/* Hero */}
      <LuxuryHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} image={hero.image}>
        <Link to={ROUTES.HOTELS} className="lux-btn-gold">
          Reserve a Stay
        </Link>
        <Link to={ROUTES.CONTACT} className="lux-btn-ghost">
          Speak to the Concierge
        </Link>
      </LuxuryHero>

      {/* Introduction */}
      <section className="bg-black">
        <Container className="py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <LuxSectionTitle
                eyebrow={intro.eyebrow}
                title={intro.title}
                description={intro.description}
              />
              {intro.points?.length > 0 && (
                <motion.ul
                  variants={staggerContainer(0.08)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="mt-8 grid gap-3 sm:grid-cols-2"
                >
                  {intro.points.map((point) => (
                    <motion.li key={point} variants={fadeInUp} className="flex items-start gap-3 text-sm text-[#A8A8A8]">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F1D477]">
                        <Icon name="check" size={13} strokeWidth={2} />
                      </span>
                      {point}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/15 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                <img
                  src={intro.image}
                  alt={intro.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#D4AF37]/10" />
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Sections */}
      {(sections || []).map((section, index) => {
        const bg = index % 2 === 0 ? "bg-[#0B0B0B]" : "bg-black";
        return (
          <section key={section.title} className={bg}>
            <Container className="py-20 sm:py-28">
              <LuxSectionTitle
                eyebrow={section.eyebrow}
                title={section.title}
                description={section.description}
                align="center"
                className="mx-auto max-w-3xl"
              />
              {section.type === "cards" ? (
                <motion.div
                  variants={staggerContainer(0.06)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className={`mt-14 grid gap-5 sm:grid-cols-2 ${section.cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
                >
                  {section.items.map((item) => (
                    <motion.div
                      key={item.title}
                      variants={fadeInUp}
                      className="lux-glass-soft group p-6 transition-colors duration-300 hover:border-[#D4AF37]/40"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F1D477] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-[#0B0B0B]">
                        <Icon name={item.icon} size={22} />
                      </span>
                      <h3 className="mt-4 font-serif text-xl font-medium text-[#F8F6F0]">{item.title}</h3>
                      <p className="lux-muted mt-2 text-sm leading-relaxed">{item.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  variants={staggerContainer(0.08)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="mx-auto mt-14 max-w-3xl"
                >
                  <div className="divide-y divide-[#D4AF37]/10 rounded-2xl border border-[#D4AF37]/15 bg-black/30">
                    {section.items.map((item) => (
                      <motion.div key={item.title} variants={fadeInUp} className="group flex flex-col gap-1 px-6 py-6 transition-colors duration-300 hover:bg-[#D4AF37]/5 sm:flex-row sm:items-start sm:gap-8">
                        <span className="lux-chip shrink-0 sm:mt-1">{item.meta}</span>
                        <div>
                          <h3 className="font-serif text-xl font-medium text-[#F8F6F0]">{item.title}</h3>
                          <p className="lux-muted mt-1 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Container>
          </section>
        );
      })}

      {/* CTA */}
      <LuxuryCTA {...ctaProps} />
    </>
  );
};

export default InfoPage;