import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import Icon from "@/components/ui/Icons";
import LuxuryHero from "@/components/luxury/LuxuryHero";
import LuxSectionTitle from "@/components/luxury/LuxSectionTitle";
import LuxuryCTA from "@/components/luxury/LuxuryCTA";
import GalleryGrid from "@/components/luxury/GalleryGrid";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { ABOUT_STORY, ABOUT_VALUES, ABOUT_STATS, ABOUT_TIMELINE, ABOUT_GALLERY } from "@/data/luxury/about";
import { ROUTES } from "@/constants/routes";

/**
 * /about — the brand story.
 */
const About = () => (
  <>
    <Seo
      title="About"
      description="Aurelia Stay — a small collection of exceptional addresses built on stillness, beauty and the quiet craft of hospitality."
    />

    <LuxuryHero
      eyebrow="About Aurelia Stay"
      title="A stay beyond expectations"
      description="Twelve exceptional addresses, each chosen for the same reasons — stillness, beauty and the quiet craft of hospitality."
    >
      <Link to={ROUTES.HOTELS} className="lux-btn-gold">
        Discover our hotels
      </Link>
      <a href="#our-story" className="lux-btn-ghost">
        Read our story
      </a>
    </LuxuryHero>

    {/* Story */}
    <section id="our-story" className="bg-[#0B0B0B]">
      <Container className="py-20 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <LuxSectionTitle
              eyebrow={ABOUT_STORY.eyebrow}
              title={ABOUT_STORY.title}
              description={ABOUT_STORY.description}
            />
            <div className="mt-8 flex flex-col gap-4">
              {ABOUT_VALUES.map((value) => (
                <div key={value.title} className="lux-glass-soft flex items-start gap-4 px-5 py-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                    <Icon name={value.icon} size={18} className="text-[#F1D477]" />
                  </span>
                  <div>
                    <h3 className="font-medium text-[#F8F6F0]">{value.title}</h3>
                    <p className="lux-muted mt-1 text-sm">{value.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div>
            <GalleryGrid images={ABOUT_GALLERY} />
          </div>
        </div>
      </Container>
    </section>

    {/* Stats */}
    <section className="bg-black">
      <Container className="py-16 sm:py-20">
        <motion.dl
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {ABOUT_STATS.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-serif text-4xl text-[#F1D477] sm:text-5xl">{stat.value}</dd>
              <p className="lux-muted mt-2 text-xs uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </motion.dl>
      </Container>
    </section>

    {/* Timeline */}
    <section className="bg-[#0B0B0B]">
      <Container className="py-20 sm:py-24">
        <LuxSectionTitle eyebrow="The journey" title="From one lake to many" align="center" />
        <motion.ol
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-3xl"
        >
          {ABOUT_TIMELINE.map((entry, index) => (
            <motion.li key={entry.year} variants={fadeInUp} className="relative flex gap-6 pb-10 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black font-serif text-sm text-[#F1D477]">
                  {index + 1}
                </span>
                {index < ABOUT_TIMELINE.length - 1 && (
                  <span className="w-px flex-1 bg-[#D4AF37]/20" aria-hidden="true" />
                )}
              </div>
              <div className="pt-2">
                <p className="lux-eyebrow">{entry.year}</p>
                <h3 className="mt-1 font-serif text-xl text-[#F8F6F0]">{entry.title}</h3>
                <p className="lux-muted mt-1 text-sm">{entry.body}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </section>

    <LuxuryCTA eyebrow="Write your own chapter" title="Your stay is waiting" description="Twelve addresses, one standard — find the one that feels like yours." />
  </>
);

export default About;