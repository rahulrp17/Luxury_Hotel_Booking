import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { hotelService, amenityService, offerService } from "@/services";
import { Container, Section } from "@/components/layout";
import { Pagination, SkeletonLoader, Icon, Drawer } from "@/components/ui";
import EmptyState from "@/components/common/EmptyState";
import Seo from "@/components/common/Seo";
import { toErrorMessage } from "@/api";
import { useAppSelector } from "@/store/hooks";
import { selectSearch } from "@/store/slices/searchSlice";
import useDebounce from "@/hooks/useDebounce";
import useMediaQuery from "@/hooks/useMediaQuery";
import HotelsHero from "./hotels/HotelsHero";
import FilterSidebar from "./hotels/FilterSidebar";
import Toolbar from "./hotels/Toolbar";
import HotelCard from "./hotels/HotelCard";
import { staggerContainer } from "@/theme/animations";
import { getFallbackAsset } from "@/constants/assets";

const LIMIT = 9;
const QUERY_STALE_TIME = 60 * 1000;

const buildParams = (filters, sort, page) => {
  const p = { page, limit: LIMIT };

  if (filters.destination) p.destination = filters.destination;
  if (filters.checkIn) p.checkIn = filters.checkIn;
  if (filters.checkOut) p.checkOut = filters.checkOut;
  if (filters.adults) p.guests = filters.adults;
  if (filters.minPrice) p.minPrice = filters.minPrice;
  if (filters.maxPrice) p.maxPrice = filters.maxPrice;
  if (filters.starRating) p.starRating = filters.starRating;
  if (filters.category) p.category = filters.category;
  if (filters.amenities.length) p.amenities = filters.amenities.join(",");
  if (sort) p.sort = sort;

  return p;
};

const initialFilters = (search) => ({
  destination: search.destination || "",
  checkIn: search.checkIn || "",
  checkOut: search.checkOut || "",
  adults: search.guests?.adults || 2,
  minPrice: search.minPrice || "",
  maxPrice: search.maxPrice || "",
  starRating: search.rating || "",
  category: search.category || "",
  amenities: [],
});

const Hotels = () => {
  const search = useAppSelector(selectSearch);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [filters, setFilters] = useState(() => initialFilters(search));
  const [sort, setSort] = useState(search.sort || "recommended");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const resultsRef = useRef(null);

  // Keep the listing in sync with a search submitted from the global search
  // modal (SearchModal). The modal only ever writes to the store, so whenever
  // the slice changes we re-seed the local filters/sort and fetch fresh results
  // — even when the user is already on this page.
  useEffect(() => {
    setFilters(initialFilters(search));
    setSort(search.sort || "recommended");
    setPage(1);
    setFiltersOpen(false);
  }, [search]);

  const params = useMemo(() => buildParams(filters, sort, page), [filters, sort, page]);

  const debouncedParams = useDebounce(params, 250);

  const hotelsQuery = useQuery({
    queryKey: ["hotels", debouncedParams],
    queryFn: () => hotelService.getHotels(debouncedParams),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  const amenitiesQuery = useQuery({
    queryKey: ["amenities", "all"],
    queryFn: () => amenityService.getAll({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const offersQuery = useQuery({
    queryKey: ["offers", "active"],
    queryFn: () => offerService.getActive({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const result = hotelsQuery.data;

  const amenities = amenitiesQuery.data?.data || [];
  const offers = offersQuery.data?.data || [];
  const hotels = result?.data || [];
  const pagination = result?.pagination || null;

  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const loading = hotelsQuery.isLoading;
  const isFetching = hotelsQuery.isFetching;

  const error = hotelsQuery.isError ? toErrorMessage(hotelsQuery.error, "Could not load hotels.") : null;

  const offerHotelIds = useMemo(() => {
    const set = new Set();

    (offers || []).forEach((offer) => {
      if (!offer.applicableHotels?.length) {
        set.add("*");
      } else {
        offer.applicableHotels.forEach((id) => set.add(String(id)));
      }
    });

    return set;
  }, [offers]);

  const hasOffer = useCallback((hotel) => offerHotelIds.has("*") || offerHotelIds.has(String(hotel._id)), [offerHotelIds]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters(search));
    setPage(1);
  }, [search]);

  const handleSearch = useCallback(({ destination, checkIn, checkOut, adults }) => {
    setFilters((prev) => ({ ...prev, destination, checkIn, checkOut, adults }));
    setPage(1);
    setFiltersOpen(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }, []);

  const applyMobileFilters = useCallback(() => {
    setFiltersOpen(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }, []);

  const handleSort = useCallback((next) => {
    setSort(next);
    setPage(1);
  }, []);

  const handleOpenFilters = useCallback(() => {
    setFiltersOpen(true);
  }, []);

  const filtersContent = (
    <FilterSidebar
      filters={filters}
      amenities={amenities}
      onChange={updateFilter}
      onReset={resetFilters}
      onApply={isMobile ? applyMobileFilters : undefined}
      mobile={isMobile}
    />
  );

  return (
    <>
      <Seo title="Luxury Hotels & Stays | Aurelia Stay" description="Discover premium luxury hotels and unforgettable stays with Aurelia Stay." />

      <HotelsHero initial={{ destination: filters.destination, checkIn: filters.checkIn, checkOut: filters.checkOut, adults: filters.adults }} onSearch={handleSearch} />

      <Section className="bg-[#f8f5ed] py-8 bg-black sm:py-10 lg:py-14">
        <Container>
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-10">

            <aside className="hidden lg:block">
              <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="sticky top-24 overflow-hidden rounded-[28px] border border-[#d4af37]/20 bg-[#090909] shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
                <div className="border-b border-[#d4af37]/15 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d4af37]">Aurelia Stay</p>
                      <h2 className="mt-1 flex items-center gap-2 font-serif text-xl font-medium text-white">
                        <Icon name="filter" size={17} className="text-[#d4af37]" />
                        Refine Your Stay
                      </h2>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/25 bg-[#d4af37]/5">
                      <Icon name="search" size={17} className="text-[#d4af37]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-white/45">Curate your perfect luxury escape with our refined filters.</p>
                </div>

                <div className="max-h-[calc(100vh-150px)] overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#d4af37]/40">
                  {filtersContent}
                </div>
              </motion.div>
            </aside>

            <div ref={resultsRef} className="min-w-0 scroll-mt-24">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white">Luxury Collection</p>
                    <h1 className="mt-1 font-serif text-2xl font-medium text-gold-500 sm:text-3xl">Exceptional Stays</h1>
                    <p className="mt-1 text-sm text-black/45">{total === 1 ? "1 luxury stay found" : `${total} luxury stays found`}</p>
                  </div>

                  <div className="w-full sm:w-auto">
                    <Toolbar total={total} sort={sort} onSort={handleSort} view={view} onView={setView} onOpenFilters={handleOpenFilters} />
                  </div>
                </div>
              </motion.div>

              <div className="relative">
                {isFetching && !loading && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex w-fit items-center gap-3 rounded-full border border-[#d4af37]/25 bg-[#090909] px-4 py-2.5 text-xs font-medium tracking-wide text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                    <span>Updating luxury stays...</span>
                  </motion.div>
                )}

                <div>
                  {loading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={view === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" : "flex flex-col gap-5"}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonLoader.Card key={i} tone="dark" />
                      ))}
                    </motion.div>
                  ) : error ? (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-[#d4af37]/15 bg-[#090909] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:p-12">
                      <EmptyState icon={<Icon name="info" size={28} className="text-[#d4af37]" />} title="Couldn't load hotels" description={error} />
                    </motion.div>
                  ) : hotels.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-[#d4af37]/15 bg-[#090909] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:p-12">
                      <EmptyState icon={<Icon name="search" size={28} className="text-[#d4af37]" />} title="No stays match your filters" description="Try adjusting your destination, dates or price range." />
                    </motion.div>
                  ) : (
                    <>
                      <motion.div variants={staggerContainer(0.08)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={view === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" : "flex flex-col gap-5"}>
                        {hotels.map((hotel, index) => (
                          <motion.div key={hotel._id} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -7 }} transition={{ duration: 0.3, ease: "easeOut" }} className="min-w-0">
                            <HotelCard hotel={hotel} view={view} hasOffer={hasOffer(hotel)} fallback={getFallbackAsset("hotel", index)} />
                          </motion.div>
                        ))}
                      </motion.div>

                      {totalPages > 1 && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-10 flex justify-center rounded-[24px] border border-black/5 bg-white/75 px-4 py-5 shadow-[0_15px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:mt-12">
                          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Refine Your Stay" width="max-w-md" side="left">
        <div className="min-h-full bg-[#090909] p-1 text-white">
          {filtersContent}
        </div>
      </Drawer>
    </>
  );
};

export default Hotels;