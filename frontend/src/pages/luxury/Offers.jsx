import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import LuxuryHero from "@/components/luxury/LuxuryHero";
import LuxSectionTitle from "@/components/luxury/LuxSectionTitle";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import OfferCard from "@/components/luxury/OfferCard";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import Icon from "@/components/ui/Icons";
import useAsyncData from "@/pages/home/useAsyncData";
import { offerService } from "@/services";
import { staggerContainer } from "@/theme/animations";
import { ROUTES } from "@/constants/routes";

const OFFER_LIMIT = 6;

/**
 * /offers — live promotions and packages straight from the API. New offers
 * published from /admin/offers appear here (server cache is invalidated on
 * every admin create/update/upload), with loading, error, empty and
 * expired/unavailable states handled below.
 */
const Offers = () => {
  const { data: offers, loading, error, refetch } = useAsyncData(
    () => offerService.getActive({ limit: OFFER_LIMIT }),
    []
  );

  return (
    <>
      <Seo
        title="Offers"
        description="Curated Aurelia Stay offers — romantic escapes, weekend retreats, family suites and spa sanctuaries."
      />

      <LuxuryHero
        eyebrow="Offers & Packages"
        title="Stays worth celebrating"
        description="A considered collection of packages — each one an excuse to book the stay you've been putting off."
      >
        <Link to={ROUTES.HOTELS} className="lux-btn-gold">
          Browse all hotels
        </Link>
      </LuxuryHero>

      <section className="bg-[#0B0B0B]">
        <Container className="py-20 sm:py-24">
          <LuxSectionTitle
            eyebrow="Current offers"
            title="Chosen for the moment"
            description="Book directly to unlock the best rates and these handpicked packages. Offers change with the season — check back often."
          />

          {loading ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: OFFER_LIMIT }).map((_, i) => (
                <SkeletonLoader.OfferCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="mt-12 rounded-2xl border border-[#D4AF37]/20 bg-black/40 p-12 text-center backdrop-blur-xl">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F1D477]">
                <Icon name="info" size={24} />
              </span>
              <p className="mt-4 font-serif text-2xl text-[#F8F6F0]">
                Couldn't load offers
              </p>
              <p className="mt-2 text-sm text-[#A8A8A8]">
                {error}
              </p>
              <button
                type="button"
                onClick={refetch}
                className="lux-btn-ghost mt-6"
              >
                Try again
              </button>
            </div>
          ) : offers?.length ? (
            <motion.div
              variants={staggerContainer(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {offers.map((offer, index) => (
                <OfferCard key={offer._id} offer={offer} index={index} />
              ))}
            </motion.div>
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-[#D4AF37]/25 bg-black/30 p-12 text-center backdrop-blur-xl">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F1D477]">
                <Icon name="sparkles" size={24} />
              </span>
              <p className="mt-4 font-serif text-2xl text-[#F8F6F0]">
                No active offers right now
              </p>
              <p className="mt-2 text-sm text-[#A8A8A8]">
                New promotions are published regularly — check back soon or browse our stays.
              </p>
              <Link to={ROUTES.HOTELS} className="lux-btn-gold mt-6">
                Browse hotels
              </Link>
            </div>
          )}
        </Container>
      </section>

      <LuxuryCTA eyebrow="Prefer to choose yourself" title="Every stay, tailored to you" description="Speak to the concierge and we'll build a package around exactly what you need." />
    </>
  );
};

export default Offers;