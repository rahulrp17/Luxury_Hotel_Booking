import { useMemo } from "react";
import { motion } from "framer-motion";
import { Container, Section, SectionTitle } from "@/components/layout";
import { Reveal, SkeletonLoader, Icon, Image } from "@/components/ui";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { getFallbackAsset } from "@/constants/assets";

// Rhythm of aspect ratios gives the masonry its staggered, editorial feel.
const ASPECTS = ["aspect-[3/4]", "aspect-[4/3]", "aspect-square"];

/**
 * Gallery assembled from the real image sets of featured hotels, laid out as a
 * premium masonry column layout with per-image fallback + caption.
 */
const Gallery = ({ hotels = [], loading = false }) => {
  const images = useMemo(() => {
    const out = [];
    (hotels || []).forEach((hotel) => {
      (hotel.images || []).forEach((img, index) => {
        if (index < 3) out.push({ url: img.url, alt: img.alt || hotel.name, hotel: hotel.name });
      });
    });
    return out;
  }, [hotels]);

  return (
    <Section className="bg-white">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Gallery"
            title="Moments from across our stays"
            description="A glimpse of the spaces and views that define AureliaStay."
            align="center"
          />
        </Reveal>

        <div className="mt-10">
          {loading ? (
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonLoader.Image
                  key={i}
                  className={`mb-4 ${ASPECTS[i % 3]}`}
                />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="columns-2 gap-4 sm:columns-3 lg:columns-4"
            >
              {images.map((img, index) => (
                <motion.figure
                  key={`${img.url}-${index}`}
                  variants={fadeInUp}
                  className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl shadow-lg"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fallbackSrc={getFallbackAsset("gallery", index)}
                    kind="gallery"
                    cover
                    hover
                    rounded="rounded-none"
                    aspect="aspect-auto"
                    className={ASPECTS[index % 3]}
                  />
                  <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-950/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="flex items-center gap-1 text-xs text-cream">
                      <Icon name="mapPin" size={13} /> {img.hotel}
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </motion.div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default Gallery;
