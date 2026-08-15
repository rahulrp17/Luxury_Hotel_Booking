import { motion } from "framer-motion";
import useAsyncData from "./useAsyncData";
import { offerService } from "@/services";
import { Container, Section, SectionTitle } from "@/components/layout";
import { Reveal, SkeletonLoader, Image } from "@/components/ui";
import { formatDate } from "@/utils/formatters";
import { getOfferDiscountLabel } from "@/utils/offerUtils";
import { fadeInUp, staggerContainer, EASE } from "@/theme/animations";
import { getFallbackAsset } from "@/constants/assets";

const OfferCard = ({ offer, fallback }) => (
  <motion.article
    variants={fadeInUp}
    whileHover={{ y: -6 }}
    transition={{ duration: 0.35, ease: EASE }}
    className="card flex h-full flex-col overflow-hidden"
  >
    <div className="relative aspect-[16/9] overflow-hidden">
      <Image
        src={offer.banner?.url}
        alt={offer.title}
        fallbackSrc={fallback}
        kind="offer"
        cover
        hover
        overlay
        rounded="rounded-none"
        aspect="aspect-auto"
        className="absolute inset-0"
      />
      <span className="absolute left-3 top-3 z-10 badge bg-gold-500 text-brand-950">
        {getOfferDiscountLabel(offer)}
      </span>
    </div>
    <div className="flex flex-1 flex-col p-6">
      <h3 className="font-serif text-xl font-semibold text-brand-900">{offer.title}</h3>
      {offer.description && <p className="mt-2 flex-1 text-sm text-brand-500">{offer.description}</p>}
      <div className="mt-4 flex items-center justify-between border-t border-brand-100 pt-4 text-xs text-brand-400">
        <span>
          Valid {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
        </span>
        <span className="rounded bg-brand-50 px-2 py-0.5 font-mono text-brand-700">{offer.code}</span>
      </div>
    </div>
  </motion.article>
);

const Offers = () => {
  const { data: offers, loading } = useAsyncData(() => offerService.getActive({ limit: 6 }), []);

  return (
    <Section className="bg-white">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Exclusive Offers"
            title="Members-only rates & indulgences"
            description="Limited-time offers across featured properties."
            align="center"
          />
        </Reveal>
        <div className="mt-10">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLoader.Card key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {offers?.map((offer, index) => (
                <OfferCard key={offer._id} offer={offer} fallback={getFallbackAsset("offer", index)} />
              ))}
            </motion.div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default Offers;
