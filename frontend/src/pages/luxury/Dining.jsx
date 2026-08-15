import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import LuxuryHero from "@/components/luxury/LuxuryHero";
import LuxSectionTitle from "@/components/luxury/LuxSectionTitle";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import DiningCard from "@/components/luxury/DiningCard";
import { staggerContainer } from "@/theme/animations";
import { DINING } from "@/data/luxury/dining";
import { ROUTES } from "@/constants/routes";

/**
 * /dining — restaurants, bars and lounges index.
 */
const Dining = () => (
  <>
    <Seo
      title="Dining"
      description="Exceptional dining at Aurelia Stay — modern Indian, coastal Mediterranean, farm-to-table and rooftop cocktails."
    />

    <LuxuryHero
      eyebrow="Exceptional Dining"
      title="Tastes that stay with you"
      description="Four kitchens, one standard — regional ingredients, fire and patience. From lakeside terraces to rooftop bars, dining at Aurelia Stay is an evening in itself."
    >
      <Link to={ROUTES.HOTELS} className="lux-btn-gold">
        Reserve a stay
      </Link>
      <a href="#restaurants" className="lux-btn-ghost">
        See the restaurants
      </a>
    </LuxuryHero>

    <section id="restaurants" className="bg-[#0B0B0B]">
      <Container className="py-20 sm:py-24">
        <LuxSectionTitle
          eyebrow="Restaurants & lounges"
          title="A table for every evening"
          description="Each outlet is a destination of its own — choose your mood and we'll take care of the rest."
        />
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2"
        >
          {DINING.map((item) => (
            <DiningCard key={item.id} item={item} />
          ))}
        </motion.div>
      </Container>
    </section>

    <LuxuryCTA />
  </>
);

export default Dining;