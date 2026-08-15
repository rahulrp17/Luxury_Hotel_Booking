import { useEffect, useMemo, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { Container, Section } from "@/components/layout";

const Counter = ({ value, decimals = 0, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals, suffix]);

  return (
    <span ref={ref} className="font-serif text-4xl font-semibold text-gold-500 sm:text-5xl">
      0{suffix}
    </span>
  );
};

/**
 * Live statistics derived from real featured-hotel data (no mock numbers).
 */
const Stats = ({ hotels = [] }) => {
  const stats = useMemo(() => {
    const valid = hotels.filter((h) => h);
    const ratings = valid.map((h) => h.avgRating || 0).filter((r) => r > 0);
    const avgRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
    const reviews = valid.reduce((sum, h) => sum + (h.totalReviews || 0), 0);
    const destinations = new Set(valid.map((h) => h.address?.city).filter(Boolean)).size;
    return {
      properties: valid.length,
      avgRating,
      reviews,
      destinations: destinations || valid.length,
    };
  }, [hotels]);

  const items = [
    { label: "Curated properties", value: stats.properties, suffix: "+" },
    { label: "Average guest rating", value: stats.avgRating, decimals: 1, suffix: "/5" },
    { label: "Verified guest reviews", value: stats.reviews, suffix: "+" },
    { label: "Destinations", value: stats.destinations, suffix: "+" },
  ];

  return (
    <Section className="bg-brand-950 text-cream">
      <Container>
        <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <Counter value={item.value} decimals={item.decimals || 0} suffix={item.suffix || ""} />
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand-300">{item.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Stats;
