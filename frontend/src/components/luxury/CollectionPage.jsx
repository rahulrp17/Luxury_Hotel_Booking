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
import GalleryGrid from "./GalleryGrid";

/**
 * Shared premium layout for the 16 collection pages (8 hotel collections,
 * 4 experience collections, 4 dining collections). Renders a consistent
 * luxury structure — hero → intro → cards → featured → amenities → gallery →
 * CTA — entirely driven by a `collection` content object from
 * data/luxury/*Collections.js. Each page stays unique through its own data
 * and imagery while sharing one considered layout.
 */
const CollectionPage = ({ collection }) => {
  const { seo, hero, intro, cards, featured, amenities, gallery, cta } = collection;

  const ctaProps = {
    eyebrow: cta?.eyebrow || "Begin your journey",
    title: cta?.title || "Reserve your stay",
    description: cta?.description || "",
    primaryLabel: cta?.primaryLabel || "Reserve Your Stay",
    primaryTo: ROUTES.HOTELS,
    secondaryLabel: cta?.secondaryLabel || "Contact the Concierge",
    secondaryTo: ROUTES.CONTACT,
  };

  const cardCols = cards.cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <>
      <Seo title={seo.title} description={seo.description} image={hero.image} />

      {/* Hero */}
      <LuxuryHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} image={hero.image}>
        <Link to={ROUTES.HOTELS} className="lux-btn-gold">
          Reserve Your Stay
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

      {/* Collection cards */}
      <section className="bg-[#0B0B0B]">
        <Container className="py-20 sm:py-28">
          <LuxSectionTitle
            eyebrow={cards.eyebrow}
            title={cards.title}
            description={cards.description}
            align="center"
            className="mx-auto max-w-3xl"
          />
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className={`mt-14 grid gap-6 sm:grid-cols-2 ${cardCols}`}
          >
            {cards.items.map((card) => (
              <motion.article
                key={card.title}
                variants={fadeInUp}
                className="lux-glass group relative flex flex-col overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_60px_-15px_rgba(212,175,55,0.45)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={card.poster}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {card.meta && <span className="absolute left-4 top-4 lux-chip">{card.meta}</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-2xl font-medium text-[#F8F6F0]">{card.title}</h3>
                  <p className="lux-muted mt-2 text-sm leading-relaxed">{card.description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-[#F1D477]">
                    Discover <Icon name="arrowRight" size={16} />
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Featured experience / property */}
      <section className="bg-black">
        <Container className="py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-5">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/15 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                <img
                  src={featured.image}
                  alt={featured.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/11] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#D4AF37]/10" />
              </div>
            </motion.div>
            <div className="lg:col-span-2">
              <LuxSectionTitle
                eyebrow={featured.eyebrow}
                title={featured.title}
                description={featured.description}
              />
              <motion.ul
                variants={staggerContainer(0.08)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-7 space-y-3"
              >
                {featured.points.map((point) => (
                  <motion.li key={point} variants={fadeInUp} className="flex items-start gap-3 text-sm text-[#A8A8A8]">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F1D477]">
                      <Icon name="check" size={13} strokeWidth={2} />
                    </span>
                    {point}
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-9"
              >
                <Link to={ROUTES.HOTELS} className="lux-btn-gold">
                  Reserve Your Stay
                </Link>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* Amenities */}
      <section className="bg-[#0B0B0B]">
        <Container className="py-20 sm:py-28">
          <LuxSectionTitle
            eyebrow={amenities.eyebrow}
            title={amenities.title}
            description={amenities.description}
            align="center"
            className="mx-auto max-w-3xl"
          />
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {amenities.items.map((amenity) => (
              <motion.div
                key={amenity.title}
                variants={fadeInUp}
                className="lux-glass-soft group p-6 transition-colors duration-300 hover:border-[#D4AF37]/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F1D477] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-[#0B0B0B]">
                  <Icon name={amenity.icon} size={22} />
                </span>
                <h3 className="mt-4 font-serif text-xl font-medium text-[#F8F6F0]">{amenity.title}</h3>
                <p className="lux-muted mt-2 text-sm leading-relaxed">{amenity.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Gallery */}
      <section className="bg-black">
        <Container className="py-20 sm:py-28">
          <LuxSectionTitle
            eyebrow={gallery.eyebrow}
            title={gallery.title}
            description={gallery.description}
            align="center"
            className="mx-auto max-w-3xl"
          />
          <GalleryGrid images={gallery.images} className="mt-14" />
        </Container>
      </section>

      {/* CTA */}
      <LuxuryCTA {...ctaProps} />
    </>
  );
};

export default CollectionPage;