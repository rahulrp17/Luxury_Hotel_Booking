import { lazy, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { hotelService, roomService } from "@/services";
import Seo from "@/components/common/Seo";
import { LazySection } from "@/components/ui";
import { queryClient } from "@/api/queryClient";
import Hero from "./home/Hero";
import FeaturedHotels from "./home/FeaturedHotels";
import FeaturedRooms from "./home/FeaturedRooms";
import FloatingContactButtons from "./home/FloatingContactButtons";

/**
 * Below-the-fold sections are code-split (React.lazy) and deferred until they
 * approach the viewport (LazySection + IntersectionObserver). Only the hero and
 * featured carousels are eager so the first paint is fast and the heavy
 * `swiper` chunks load on demand.
 */
const Experience = lazy(() => import("./home/Experience"));
const Amenities = lazy(() => import("./home/Amenities"));
const Dining = lazy(() => import("./home/Dining"));
const Reviews = lazy(() => import("./home/Reviews"));
const Newsletter = lazy(() => import("./home/Newsletter"));
const Cta = lazy(() => import("./home/Cta"));

/** Placeholder shown while a lazy chunk is still downloading. */
const SectionFallback = ({ height = 600 }) => (
  <div
    className="w-full animate-pulse rounded-3xl bg-white/5"
    style={{ minHeight: height }}
    aria-hidden="true"
  />
);

/**
 * Home page. Fetches featured hotels once (cross-cutting data for the hero,
 * experience, dining, stats, reviews and map) and composes every section.
 * Data-heavy sections are fed from the same fetch; rooms/amenities/offers/
 * reviews fetch their own live data through the service layer.
 */
const Home = () => {
  const { data: hotels, isLoading, error } = useQuery({
    queryKey: ["featured-hotels", 8],
    // Cached fetch: hits the same GET /hotels/featured?limit=8 endpoint but
    // dedupes concurrent callers and reuses the in-flight/Redis response.
    queryFn: () => hotelService.getFeaturedHotels({ limit: 8 }),
  });

  // Warm the shared cache so FeaturedRooms renders without a loading gap.
  // Query keys match the section's own useQuery → deduplicated, single request.
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["featured-rooms", 8],
      queryFn: () => roomService.getFeaturedRooms({ limit: 8 }),
    });
  }, []);

  // getFeatured returns { success, message, data }. Unwrap the array.
  const featured = hotels?.data || hotels || [];
  const primary = featured[0];
  const heroImage =
    primary?.primaryImage?.url || primary?.images?.[0]?.url || "";

  return (
    <>
      <Seo
        title="Luxury Hotel Booking"
        description="AureliaStay — luxury hotels, curated suites, fine dining and exclusive offers."
      />
      <Hero hotel={primary} />
      {/* <div className="h-24 bg-gradient-to-b from-brand-950 to-cream" aria-hidden="true" /> */}
      <LazySection minHeight={840} rootMargin="800px">
        <Suspense fallback={<SectionFallback height={840} />}>
          <Experience />
        </Suspense>
      </LazySection>
      <FeaturedHotels hotels={featured} loading={isLoading} error={error} />
      <FeaturedRooms />
      <LazySection minHeight={720}>
        <Suspense fallback={<SectionFallback height={720} />}>
          <Amenities />
        </Suspense>
      </LazySection>
      {/* <Gallery hotels={featured} loading={loading} /> */}
      <LazySection minHeight={760}>
        <Suspense fallback={<SectionFallback height={760} />}>
          <Dining image={featured[1]?.primaryImage?.url || heroImage} />
        </Suspense>
      </LazySection>
      {/* <Offers /> */}
      <LazySection minHeight={880}>
        <Suspense fallback={<SectionFallback height={880} />}>
          <Reviews hotelId={primary?._id} />
        </Suspense>
      </LazySection>
      {/* <Stats hotels={featured} />
      <MapSection hotel={primary} />
      <Faq /> */}
      <LazySection minHeight={560}>
        <Suspense fallback={<SectionFallback height={560} />}>
          <Newsletter />
        </Suspense>
      </LazySection>
      <LazySection minHeight={480}>
        <Suspense fallback={<SectionFallback height={480} />}>
          <Cta />
        </Suspense>
      </LazySection>

      {/* Home-only floating concierge buttons (WhatsApp + phone) */}
      <FloatingContactButtons />
    </>
  );
};

export default Home;
