import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Icon from "@/components/ui/Icons";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import GalleryGrid from "@/components/luxury/GalleryGrid";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { EXPERIENCES, getExperienceById } from "@/data/luxury/experiences";
import { ROUTES, buildPath } from "@/constants/routes";

/**
 * /experiences/:id — single curated experience.
 */
const ExperienceDetail = () => {
  const { id } = useParams();
  const item = getExperienceById(id);

  if (!item) {
    return (
      <section className="bg-[#0B0B0B]">
        <Seo title="Experience not found" description="This experience isn't available." />
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <p className="lux-eyebrow">Experience unavailable</p>
          <h1 className="lux-title mt-4">We couldn't find that experience</h1>
          <Link to={ROUTES.EXPERIENCES} className="lux-btn-gold mt-8">
            Browse all experiences
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <>
      <Seo title={item.title} description={item.tagline} />

      <section className="bg-[#0B0B0B]">
        <Container className="pt-28 sm:pt-32">
          <Breadcrumb
            className="mb-8"
            items={[
              { label: "Home", to: ROUTES.HOME },
              { label: "Experiences", to: ROUTES.EXPERIENCES },
              { label: item.title },
            ]}
          />
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="lux-eyebrow flex items-center gap-3">
                <span className="h-px w-10 bg-[#D4AF37]/60" aria-hidden="true" />
                {item.tag}
              </p>
              <h1 className="lux-title mt-4">{item.title}</h1>
              <p className="lux-body mt-5 max-w-2xl">{item.description}</p>

              <div className="mt-10">
                <GalleryGrid images={item.gallery.map((src, i) => ({ src, alt: `${item.title} — view ${i + 1}` }))} />
              </div>

              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12">
                <h2 className="lux-h2">What's included</h2>
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {item.highlights.map((highlight) => (
                    <li key={highlight} className="lux-glass-soft flex items-start gap-3 px-4 py-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                        <Icon name="check" size={13} className="text-[#F1D477]" />
                      </span>
                      <span className="text-sm text-[#F8F6F0]">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Booking side card */}
            <aside className="lg:pt-6">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="lux-glass sticky top-28 p-6">
                <p className="lux-eyebrow">From</p>
                <p className="font-serif text-4xl text-[#F1D477]">{item.price}</p>
                <p className="lux-muted mt-1 text-sm">per guest · {item.duration}</p>
                <div className="lux-hairline my-6" />
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-[#A8A8A8]">Duration</dt>
                    <dd className="font-medium text-[#F8F6F0]">{item.duration}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#A8A8A8]">Rating</dt>
                    <dd className="font-medium text-[#F8F6F0]">{item.rating} / 5</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#A8A8A8]">When</dt>
                    <dd className="font-medium text-[#F8F6F0]">Year round</dd>
                  </div>
                </dl>
                <div className="mt-7 flex flex-col gap-3">
                  <Link to={ROUTES.HOTELS} className="lux-btn-gold w-full">
                    Reserve with a stay
                  </Link>
                  <a href="tel:+910000000000" className="lux-btn-ghost w-full">
                    Ask the concierge
                  </a>
                </div>
              </motion.div>
            </aside>
          </motion.div>

          {/* Other experiences */}
          <div className="mt-20">
            <h2 className="lux-h2">Continue exploring</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {EXPERIENCES.filter((e) => e.id !== item.id)
                .slice(0, 3)
                .map((experience) => {
                  const to = buildPath(ROUTES.EXPERIENCE_DETAIL, { id: experience.id });
                  return (
                    <Link key={experience.id} to={to} className="lux-glass group block overflow-hidden">
                      <div className="relative aspect-[3/2] overflow-hidden">
                        <img
                          src={experience.poster}
                          alt={experience.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <h3 className="lux-h2 absolute bottom-4 left-4 right-4">{experience.title}</h3>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </Container>
      </section>

      <LuxuryCTA />
    </>
  );
};

export default ExperienceDetail;