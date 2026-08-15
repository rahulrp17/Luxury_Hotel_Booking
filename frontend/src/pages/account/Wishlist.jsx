import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Icon from "@/components/ui/Icons";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { useWishlist } from "@/hooks/useWishlist";
import { ROUTES, buildPath } from "@/constants/routes";
import { formatCurrency } from "@/utils/formatters";

/**
 * /account/wishlist — saved hotels & rooms in the dashboard shell. Client-side
 * wishlist persisted to localStorage (no backend endpoint exists); remove and
 * clear are instant.
 */
const Wishlist = () => {
  const { items, remove, clear, count } = useWishlist();

  return (
    <div className="lux-canvas">
      <div className="lux-inner">
        <Seo title="Wishlist" description="Your saved AureliaStay hotels and rooms." />

        <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="mx-auto max-w-6xl">
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Curated for you</p>
              <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">Saved stays</h1>
              <p className="mt-1 text-sm text-[#B8B2A5]">
                {count > 0 ? `${count} saved ${count === 1 ? "stay" : "stays"} — ready when you are.` : "Nothing saved yet."}
              </p>
            </div>
            {count > 0 && (
              <Button type="button" variant="ghost" onClick={clear}>Clear wishlist</Button>
            )}
          </motion.div>

          {count === 0 ? (
            <motion.div variants={fadeInUp} className="mt-6 rounded-2xl border border-dashed border-[#D4AF37]/25 bg-white/[0.02] py-20 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#E7C977]">
                <Icon name="star" size={24} />
              </span>
              <p className="mt-4 font-serif text-2xl text-[#F5F1E8]">You haven't saved a stay yet</p>
              <p className="mt-1 text-sm text-[#B8B2A5]">Browse our collection and save the stays that feel like yours.</p>
              <Link to={ROUTES.HOTELS} className="lux-btn-gold mt-6 inline-flex">Explore Hotels</Link>
            </motion.div>
          ) : (
            <motion.ul variants={staggerContainer(0.08)} className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const isRoom = Boolean(item.roomType) || Boolean(item.pricePerNight);
                const to = isRoom
                  ? buildPath(ROUTES.ROOM_DETAIL, { id: item._id })
                  : buildPath(ROUTES.HOTEL_DETAIL, { id: item._id });
                const price = item.pricing?.baseAmount ?? item.pricePerNight ?? item.minPrice;
                return (
                  <motion.li key={item._id} variants={fadeInUp}>
                    <div className="group relative overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/45 hover:shadow-[0_30px_80px_rgba(0,0,0,0.55),0_0_35px_rgba(212,175,55,0.16)]">
                      <Link to={to} className="block">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={item.images?.[0]?.url || ""}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(0,0,0,0.55),transparent_70%)]" />
                          <span className="absolute left-4 top-4 rounded-full border border-[#D4AF37]/30 bg-black/60 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-[#F1D477] backdrop-blur-md">
                            {isRoom ? "Room" : "Hotel"}
                          </span>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between gap-2">
                            <h2 className="truncate font-serif text-lg font-medium text-[#F5F1E8]">{item.name}</h2>
                            {item.rating > 0 && (
                              <span className="flex shrink-0 items-center gap-1 text-xs text-[#F1D477]">
                                <Icon name="star" size={12} /> {item.rating}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[#B8B2A5]">
                            {[item.address?.city, item.address?.country].filter(Boolean).join(", ") || "AureliaStay"}
                          </p>
                          {price > 0 && (
                            <p className="mt-3 font-serif text-lg font-medium text-[#F1D477]">
                              {formatCurrency(price)}
                              <span className="text-xs font-normal text-[#77736B]"> / night</span>
                            </p>
                          )}
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(item._id)}
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-[#B8B2A5] backdrop-blur-md transition-colors hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <Icon name="close" size={16} />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;