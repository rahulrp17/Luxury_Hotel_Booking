import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import LuxuryHero from "@/components/luxury/LuxuryHero";
import LuxSectionTitle from "@/components/luxury/LuxSectionTitle";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import OfferCard from "@/components/luxury/OfferCard";
import { staggerContainer } from "@/theme/animations";
import { OFFERS } from "@/data/luxury/offers";
import { ROUTES } from "@/constants/routes";

/**
 * /offers — curated packages and promotions.
 */
const Offers = () => (
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
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {OFFERS.map((offer) => (
            <OfferCard key={offer.id} item={offer} />
          ))}
        </motion.div>
      </Container>
    </section>

    <LuxuryCTA eyebrow="Prefer to choose yourself" title="Every stay, tailored to you" description="Speak to the concierge and we'll build a package around exactly what you need." />
  </>
);

export default Offers;