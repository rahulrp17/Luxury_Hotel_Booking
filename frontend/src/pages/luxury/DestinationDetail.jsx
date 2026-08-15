import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Icon from "@/components/ui/Icons";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import GalleryGrid from "@/components/luxury/GalleryGrid";
import { fadeInUp } from "@/theme/animations";
import { getDestinationBySlug } from "@/data/luxury/destinations";
import { ROUTES } from "@/constants/routes";

/**
 * /destinations/:slug — a single destination overview.
 */
const DestinationDetail = () => {
  const { slug } = useParams();
  const destination = getDestinationBySlug(slug);

  if (!destination) {
    return (
      <section className="bg-[#0B0B0B]">
        <Seo title="Destination not found" description="This destination isn't available." />
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <p className="lux-eyebrow">Destination unavailable</p>
          <h1 className="lux-title mt-4">We couldn't find that destination</h1>
          <Link to={ROUTES.DESTINATIONS} className="lux-btn-gold mt-8">
            Back to destinations
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <>
      <Seo title={destination.name} description={destination.tagline} />

      <section className="bg-[#0B0B0B]">
        <Container className="pt-28 sm:pt-32">
          <Breadcrumb
            className="mb-8"
            items={[
              { label: "Home", to: ROUTES.HOME },
              { label: "Destinations", to: ROUTES.DESTINATIONS },
              { label: destination.name },
            ]}
          />
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="lux-eyebrow flex items-center gap-3">
                <span className="h-px w-10 bg-[#D4AF37]/60" aria-hidden="true" />
                {destination.country}
              </p>
              <h1 className="lux-title mt-4">{destination.name}</h1>
              <p className="lux-body mt-5 max-w-2xl">{destination.description}</p>

              <div className="mt-10">
                <GalleryGrid images={destination.gallery.map((src, i) => ({ src, alt: `${destination.name} — view ${i + 1}` }))} />
              </div>

              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12">
                <h2 className="lux-h2">Why {destination.name}</h2>
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {destination.highlights.map((highlight) => (
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

            <aside className="lg:pt-6">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="lux-glass sticky top-28 p-6 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/15">
                  <Icon name="mapPin" size={24} className="text-[#F1D477]" />
                </span>
                <h2 className="lux-h2 mt-5">{destination.name}</h2>
                <p className="lux-muted mt-1 text-sm">{destination.country}</p>
                <p className="mt-4 font-serif text-3xl text-[#F1D477]">{destination.hotels}</p>
                <p className="lux-muted text-xs uppercase tracking-[0.2em]">Resorts & hotels</p>
                <div className="mt-7 flex flex-col gap-3">
                  <Link to={ROUTES.HOTELS} className="lux-btn-gold w-full">
                    View stays here
                  </Link>
                  <Link to={ROUTES.CONTACT} className="lux-btn-ghost w-full">
                    Ask the concierge
                  </Link>
                </div>
              </motion.div>
            </aside>
          </motion.div>
        </Container>
      </section>

      <LuxuryCTA eyebrow={`Discover ${destination.name}`} title="Stay where it feels right" description="Browse live availability across our properties and book in moments." />
    </>
  );
};

export default DestinationDetail;