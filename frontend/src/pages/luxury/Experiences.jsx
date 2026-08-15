import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import LuxuryHero from "@/components/luxury/LuxuryHero";
import LuxSectionTitle from "@/components/luxury/LuxSectionTitle";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import ExperienceCard from "@/components/luxury/ExperienceCard";
import { staggerContainer } from "@/theme/animations";
import { EXPERIENCES } from "@/data/luxury/experiences";
import { ROUTES } from "@/constants/routes";

/**
 * /experiences — curated experiences index.
 */
const Experiences = () => (
  <>
    <Seo
      title="Experiences"
      description="Curated experiences at Aurelia Stay — sunset sailing, midnight spa rituals, dawn safaris and the chef's table."
    />

    <LuxuryHero
      eyebrow="Curated Experiences"
      title="Moments worth remembering"
      description="Every Aurelia Stay experience is composed by hand — from a champagne sail into the sunset to an eight-course performance at the chef's table."
    >
      <Link to={ROUTES.HOTELS} className="lux-btn-gold">
        Reserve a stay
      </Link>
      <a href="#all-experiences" className="lux-btn-ghost">
        Explore experiences
      </a>
    </LuxuryHero>

    {/* Experience grid */}
    <section id="all-experiences" className="bg-[#0B0B0B]">
      <Container className="py-20 sm:py-24">
        <LuxSectionTitle
          eyebrow="Signature experiences"
          title="Chosen slowly, felt deeply"
          description="From the water to the kitchen to the wild — each experience is a small ceremony, guided by people who love what they do."
        />
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {EXPERIENCES.map((item) => (
            <ExperienceCard key={item.id} item={item} />
          ))}
        </motion.div>
      </Container>
    </section>

    <LuxuryCTA />
  </>
);

export default Experiences;