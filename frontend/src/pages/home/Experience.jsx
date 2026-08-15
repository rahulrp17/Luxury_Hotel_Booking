import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Star,
  ArrowRight,
} from "lucide-react";

import { fadeInUp, staggerContainer, EASE } from "@/theme/animations";
import { Container, Section } from "@/components/layout";
import { Image } from "@/components/ui";
import Magnetic from "@/components/ui/Magnetic";

const EXPERIENCE_POINTS = [
  {
    icon: ShieldCheck,
    title: "Private Luxury Villas",
    description:
      "Architectural masterpieces offering complete privacy, panoramic views and exceptional comfort.",
  },
  {
    icon: Award,
    title: "Award-Winning Hospitality",
    description:
      "Personalized butler service, curated experiences and world-class hospitality at every destination.",
  },
  {
    icon: Star,
    title: "Michelin-Level Dining",
    description:
      "Extraordinary culinary journeys crafted by internationally celebrated chefs.",
  },
];

const Experience = ({
  image = "/assets/hotels/hotel-01.jpg",
}) => {
  return (
    <Section className="relative flex min-h-[75vh] overflow-hidden bg-[#070707] py-20 lg:py-24">

      {/* Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-10%] top-20 h-[420px] w-[420px] rounded-full bg-gold-500/8 blur-[170px]" />

        <div className="absolute right-[-5%] bottom-10 h-[350px] w-[350px] rounded-full bg-gold-500/5 blur-[150px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,.06),transparent_50%)]" />

      </div>

      <Container>

        <div className="items-center gap-16 lg:grid lg:grid-cols-[1.05fr_0.95fr]">

          {/* LEFT */}

          <motion.div
            initial={{
              opacity: 0,
              x: -60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.8,
              ease: EASE,
            }}
            className="relative mx-auto w-full max-w-[620px]"
          >

            <div className="overflow-hidden rounded-[28px] shadow-[0_28px_70px_rgba(0,0,0,.45)]">

              <Image
                src={image}
                alt="Luxury Resort"
                kind="hotel"
                hover={false}
                className="h-[350px] lg:h-[620px] md:h-[600px]  w-full object-cover transition duration-[8s] hover:scale-110"
              />

            </div>

            {/* Floating Card */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.35,
              }}
              className="absolute bottom-8 left-8 hidden rounded-3xl border border-white/10 bg-black/65 px-6 py-5 backdrop-blur-xl lg:block"
            >

              <div className="flex items-center gap-2">

                <Sparkles
                  size={17}
                  className="text-gold-400"
                />

                <span className="text-[11px] uppercase tracking-[0.28em] text-gold-300">
                  Signature Collection
                </span>

              </div>

              <h3 className="mt-3 font-serif text-4xl text-white">
                150+
              </h3>

              <p className="mt-1 text-sm text-white/60">
                Curated Luxury Hotels
              </p>

            </motion.div>

          </motion.div>
          {/* RIGHT CONTENT */}

          <motion.div
            variants={staggerContainer(0.14)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            className="mx-auto flex max-w-[540px] mt-5 flex-col justify-center"
          >

            {/* Badge */}

            <motion.div variants={fadeInUp}>

              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300">

                <Sparkles size={14} />

                The Aurelia Experience

              </span>

            </motion.div>

            {/* Heading */}

            <motion.h2
              variants={fadeInUp}
              className="mt-7 font-serif text-[30px] leading-[1.08] text-white"
            >

              Crafted for

              <span className="block text-gold-400 italic">

                Extraordinary

              </span>

              <span className="block">

                Moments

              </span>

            </motion.h2>

            {/* Description */}

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-[15px] leading-8 text-white/65"
            >

              Every AureliaStay destination is thoughtfully selected to deliver timeless architecture, discreet hospitality, exceptional comfort and unforgettable experiences for travellers seeking more than simply a place to stay.

            </motion.p>

            {/* Divider */}

            <motion.div
              variants={fadeInUp}
              className="my-4 h-px w-24 bg-gradient-to-r from-gold-500 to-transparent"
            />

            {/* Features */}

            <motion.div
              variants={staggerContainer(0.12)}
              className="space-y-6"
            >

              {EXPERIENCE_POINTS.map((item) => {

                const Icon = item.icon;

                return (

                  <motion.div
                    key={item.title}
                    variants={fadeInUp}
                    className="flex items-start gap-4"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10">

                      <Icon
                        size={20}
                        className="text-gold-400"
                      />

                    </div>

                    <div>

                      <h3 className="font-serif text-[22px] text-gold-500">

                        {item.title}

                      </h3>

                      <p className="mt-2 text-[14px] leading-7 text-white/60">

                        {item.description}

                      </p>

                    </div>

                  </motion.div>

                );

              })}

            </motion.div>
          </motion.div>

        </div>

      </Container>

    </Section>
  );
};

export default Experience;