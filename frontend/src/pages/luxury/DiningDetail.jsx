import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Icon from "@/components/ui/Icons";
import StarRating from "@/components/ui/StarRating";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import GalleryGrid from "@/components/luxury/GalleryGrid";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { DINING, getDiningById } from "@/data/luxury/dining";
import { ROUTES } from "@/constants/routes";

/**
 * /dining/:id — single restaurant or lounge.
 */
const DiningDetail = () => {
  const { id } = useParams();
  const item = getDiningById(id);

  if (!item) {
    return (
      <section className="bg-[#0B0B0B]">
        <Seo title="Restaurant not found" description="This restaurant isn't available." />
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <p className="lux-eyebrow">Dining unavailable</p>
          <h1 className="lux-title mt-4">We couldn't find that restaurant</h1>
          <Link to={ROUTES.DINING} className="lux-btn-gold mt-8">
            Back to dining
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <>
      <Seo title={item.name} description={item.tagline} />

      <section className="bg-[#0B0B0B]">
        <Container className="pt-28 sm:pt-32">
          <Breadcrumb
            className="mb-8"
            items={[
              { label: "Home", to: ROUTES.HOME },
              { label: "Dining", to: ROUTES.DINING },
              { label: item.name },
            ]}
          />
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="lux-eyebrow flex items-center gap-3">
                <span className="h-px w-10 bg-[#D4AF37]/60" aria-hidden="true" />
                {item.cuisine}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <h1 className="lux-title">{item.name}</h1>
                <StarRating value={item.rating} />
              </div>
              <p className="lux-muted mt-3 flex items-center gap-2 text-sm">
                <Icon name="mapPin" size={14} />
                {item.location}
              </p>
              <p className="lux-body mt-6 max-w-2xl">{item.description}</p>

              <div className="mt-10">
                <GalleryGrid images={item.gallery.map((src, i) => ({ src, alt: `${item.name} — view ${i + 1}` }))} />
              </div>

              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12">
                <h2 className="lux-h2">Signature dishes</h2>
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {item.signature.map((dish) => (
                    <li key={dish} className="lux-glass-soft px-4 py-3 text-sm text-[#F8F6F0]">
                      {dish}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <aside className="lg:pt-6">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="lux-glass sticky top-28 p-6">
                <h2 className="lux-h2">Plan your evening</h2>
                <div className="lux-hairline my-5" />
                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-[#A8A8A8]">
                      <Icon name="calendar" size={15} />
                      Hours
                    </dt>
                    <dd className="text-right font-medium text-[#F8F6F0]">{item.hours}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-[#A8A8A8]">
                      <Icon name="user" size={15} />
                      Dress code
                    </dt>
                    <dd className="font-medium text-[#F8F6F0]">{item.dressCode}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-[#A8A8A8]">
                      <Icon name="mapPin" size={15} />
                      Location
                    </dt>
                    <dd className="text-right font-medium text-[#F8F6F0]">{item.location}</dd>
                  </div>
                </dl>
                <div className="mt-7 flex flex-col gap-3">
                  <Link to={ROUTES.HOTELS} className="lux-btn-gold w-full">
                    Reserve a stay
                  </Link>
                  <a href="tel:+910000000000" className="lux-btn-ghost w-full">
                    Book a table
                  </a>
                </div>
              </motion.div>
            </aside>
          </motion.div>
        </Container>
      </section>

      <LuxuryCTA />
    </>
  );
};

export default DiningDetail;