import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import LuxuryHero from "@/components/luxury/LuxuryHero";
import LuxSectionTitle from "@/components/luxury/LuxSectionTitle";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import DestinationCard from "@/components/luxury/DestinationCard";
import { staggerContainer } from "@/theme/animations";
import { DESTINATIONS } from "@/data/luxury/destinations";
import { ROUTES } from "@/constants/routes";

/**
 * /destinations — the Aurelia Stay collection.
 */
const Destinations = () => (
  <>
    <Seo
      title="Destinations"
      description="Discover Aurelia Stay destinations — lakeside Udaipur, coastal Goa, mountain Shimla and palace Jaipur."
    />

    <LuxuryHero
      eyebrow="Destinations"
      title="Places that stay with you"
      description="A small collection of exceptional addresses across India — each rooted in its place, each unmistakably Aurelia Stay."
    >
      <Link to={ROUTES.HOTELS} className="lux-btn-gold">
        Browse all hotels
      </Link>
    </LuxuryHero>

    <section className="bg-[#0B0B0B]">
      <Container className="py-20 sm:py-24">
        <LuxSectionTitle
          eyebrow="The collection"
          title="Four regions, one standard"
          description="From mirror lakes to mountain orchards — choose your landscape and we'll handle the rest."
        />
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {DESTINATIONS.map((destination) => (
            <DestinationCard key={destination.slug} item={destination} />
          ))}
        </motion.div>
      </Container>
    </section>

    <LuxuryCTA eyebrow="Not sure where to start?" title="Tell us your mood" description="Beach, lake, mountain or palace — our concierge will point you to the right address." />
  </>
);

export default Destinations;