import { memo, useCallback, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { roomService, offerService, paymentService, notify } from "@/services";
import { Container, Section } from "@/components/layout";
import { SkeletonLoader, Icon, Breadcrumb } from "@/components/ui";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import EmptyState from "@/components/common/EmptyState";
import Seo from "@/components/common/Seo";
import { ROUTES, buildPath } from "@/constants/routes";
import { formatCurrency } from "@/utils/formatters";
import {
  toISODate,
  fromISODate,
  addDays,
  daysBetween,
  formatISODate,
} from "@/utils/dates";
import { toErrorMessage } from "@/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createBooking, setCurrentBooking } from "@/store/slices/bookingSlice";
import { selectUser } from "@/store/slices/authSlice";
import { loadRazorpay } from "@/utils/razorpay";
import config from "@/config";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { getFallbackAsset } from "@/constants/assets";

const QUERY_STALE_TIME = 60 * 1000;

/* ════════════════════════════════════════════════════════════════════════════
   Order summary sidebar
   ════════════════════════════════════════════════════════════════════════════ */

const PriceRow = ({ label, value, className = "" }) => (
  <div className={`flex items-center justify-between text-sm ${className}`}>
    <span className="text-[#8A8A8A]">{label}</span>
    <span className="font-medium text-[#F5F1E8]">{value}</span>
  </div>
);

const OrderSummary = memo(function OrderSummary({
  room,
  hotel,
  checkIn,
  checkOut,
  nights,
  adults,
  children,
  pricing,
  offer,
}) {
  const image = room?.primaryImage?.url || room?.images?.[0]?.url || "";

  const discount = offer?.discountAmount || 0;
  const base = pricing?.baseAmount || 0;
  const tax = pricing?.taxAmount || 0;
  const estimatedTotal = Math.max(base - discount + tax, 0);

  return (
    <motion.div variants={fadeInUp} className="lux-glass overflow-hidden">
      <div className="flex gap-4 p-5">
        <img
          src={image || getFallbackAsset("room", 0)}
          alt={room?.name}
          className="h-20 w-24 shrink-0 rounded-lg border border-[#D4AF37]/20 object-cover"
          loading="lazy"
        />
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-semibold text-[#F8F6F0]">
            {room?.name}
          </h2>
          <p className="mt-0.5 line-clamp-1 text-sm text-[#A8A8A8]">
            {hotel?.name}
          </p>
          {hotel?.address && (
            <p className="mt-0.5 text-xs text-[#77736B]">
              {[hotel.address.city, hotel.address.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="divide-y divide-[#D4AF37]/10 border-t border-[#D4AF37]/15 px-5 py-4 text-sm">
        <div className="flex items-center justify-between py-1.5">
          <span className="flex items-center gap-2 text-[#A8A8A8]">
            <Icon name="calendar" size={15} className="text-[#E7C977]" />{" "}
            Check-in
          </span>
          <span className="font-medium text-[#F5F1E8]">
            {formatISODate(checkIn)}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="flex items-center gap-2 text-[#A8A8A8]">
            <Icon name="calendar" size={15} className="text-[#E7C977]" />{" "}
            Check-out
          </span>
          <span className="font-medium text-[#F5F1E8]">
            {formatISODate(checkOut)}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="flex items-center gap-2 text-[#A8A8A8]">
            <Icon name="user" size={15} className="text-[#E7C977]" /> Guests
          </span>
          <span className="font-medium text-[#F5F1E8]">
            {adults} adult{adults > 1 ? "s" : ""}
            {children > 0
              ? `, ${children} child${children > 1 ? "ren" : ""}`
              : ""}
          </span>
        </div>
      </div>

      <div className="space-y-2 border-t border-[#D4AF37]/15 p-5">
        <PriceRow
          label={`${nights} night${nights > 1 ? "s" : ""} · Subtotal`}
          value={formatCurrency(base)}
        />
        {(pricing?.breakdown || []).length > 0 && (
          <ul className="space-y-1 border-b border-[#D4AF37]/10 pb-3">
            {pricing.breakdown.slice(0, nights).map((row) => (
              <li
                key={row.date}
                className="flex items-center justify-between text-xs text-[#77736B]"
              >
                <span>
                  {formatISODate(row.date)}
                  {row.isWeekend ? " (weekend)" : ""}
                </span>
                <span>{formatCurrency(row.price)}</span>
              </li>
            ))}
          </ul>
        )}
        {discount > 0 && (
          <PriceRow
            label={`Offer ${offer.code} · discount`}
            value={`− ${formatCurrency(discount)}`}
            className="text-[#E7C977]"
          />
        )}
        <PriceRow label="Taxes & fees" value={formatCurrency(tax)} />
        <div className="mt-2 flex items-center justify-between border-t border-[#D4AF37]/15 pt-3">
          <span className="font-semibold text-[#F8F6F0]">Estimated total</span>
          <span className="font-serif text-xl font-semibold text-[#F1D477]">
            {formatCurrency(estimatedTotal)}
          </span>
        </div>
        <p className="text-xs text-[#77736B]">
          Final amount is confirmed by the hotel at the time of payment.
        </p>
      </div>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Booking page
   ════════════════════════════════════════════════════════════════════════════ */

const Booking = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [processing, setProcessing] = useState(false);
  const [offer, setOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState(null);

  const checkIn = searchParams.get("checkIn") || toISODate(new Date());
  const checkOut =
    checkIn && searchParams.get("checkOut")
      ? searchParams.get("checkOut")
      : toISODate(addDays(fromISODate(checkIn), 1));
  const adultsParam = Number(searchParams.get("adults")) || 2;
  const childrenParam = Number(searchParams.get("children")) || 0;
  const nights = daysBetween(checkIn, checkOut);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      specialRequests: "",
      offerCode: "",
    },
  });

  const roomQuery = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomService.getRoom(roomId),
    enabled: Boolean(roomId),
    staleTime: QUERY_STALE_TIME,
  });
  const room = roomQuery.data?.data;
  const hotel = room?.hotel;

  const datesValid = nights >= 1;
  const availabilityQuery = useQuery({
    queryKey: ["room", roomId, "availability", checkIn, checkOut],
    queryFn: () => roomService.getAvailability(roomId, { checkIn, checkOut }),
    enabled: Boolean(roomId) && datesValid,
    staleTime: QUERY_STALE_TIME,
  });
  const availability = availabilityQuery.data?.data;
  const pricing = availability?.pricing;

  const adults = Math.min(adultsParam, room?.maxOccupancy?.adults || 99);
  const children = Math.min(childrenParam, room?.maxOccupancy?.children || 6);

  const roomError = roomQuery.isError
    ? toErrorMessage(roomQuery.error, "Could not load this room.")
    : null;

  const applyOffer = useCallback(async () => {
    const code = watch("offerCode")?.trim();
    if (!code) return;
    if (!pricing) {
      notify.error(
        "Please ensure valid dates are selected before applying an offer.",
      );
      return;
    }
    setOfferLoading(true);
    setOfferError(null);
    try {
      const res = await offerService.validate(
        code,
        pricing.baseAmount,
        hotel?._id,
        room?._id,
      );
      const data = res?.data || res;
      setOffer({
        code: data.offerCode,
        discountAmount: data.discountAmount,
        ...data.offerDetails,
      });
      notify.success(
        `Offer applied — ${data.offerDetails?.title || "discount added"}!`,
      );
    } catch (err) {
      setOffer(null);
      setOfferError(toErrorMessage(err, "Invalid or expired offer code."));
      notify.errorFrom(err, "We couldn't apply that offer code.");
    } finally {
      setOfferLoading(false);
    }
  }, [watch, pricing, hotel, room]);

  const onValidPay = useCallback(
    async (formData) => {
      if (!room || !hotel || processing) return;
      if (datesValid && availability?.isAvailable === false) {
        notify.error(
          "This room is no longer available for the selected dates.",
        );
        return;
      }

      setProcessing(true);
      const toastId = notify.loading("Creating your booking…");
      try {
        const payload = {
          hotel: hotel._id,
          room: room._id,
          checkIn,
          checkOut,
          guests: { adults, children },
          guestDetails: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          offerCode: offer?.code || formData.offerCode?.trim() || undefined,
          specialRequests: formData.specialRequests?.trim() || undefined,
        };

        const created = await dispatch(createBooking(payload)).unwrap();
        const booking = created?.data || created;
        // Never attempt payment if booking creation did not actually yield a
        // booking. The backend only issues an order for a real PENDING booking.
        if (!booking?._id) {
          throw new Error("Booking was not created. Payment cannot start.");
        }
        notify.update(
          toastId,
          "Booking created — starting secure payment…",
          "success",
        );

        const orderRes = await paymentService.createOrder(booking._id);
        const order = orderRes?.data || orderRes;

        const Razorpay = await loadRazorpay();
        const rzp = new Razorpay({
          key: config.razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: hotel.name,
          description: `${room.name} · ${nights} night${nights > 1 ? "s" : ""}`,
          order_id: order.orderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: { color: "#D4AF37" },
          modal: {
            ondismiss: () => {
              setProcessing(false);
              notify.info(
                "Payment window closed. You can retry whenever you're ready.",
              );
            },
          },
          handler: async (response) => {
            try {
              const verifiedRes = await paymentService.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              const verified = verifiedRes?.data || verifiedRes;
              dispatch(setCurrentBooking(verified.booking));
              notify.success("Payment successful — your stay is booked!");
              navigate(ROUTES.BOOKING_SUCCESS, {
                state: { booking: verified.booking },
              });
            } catch (err) {
              notify.errorFrom(
                err,
                "Payment was received but we couldn't confirm it. Please contact support.",
              );
              setProcessing(false);
            }
          },
        });

        rzp.on("payment.failed", () => {
          notify.error(
            "Payment failed. You can retry — pending bookings expire shortly.",
          );
          setProcessing(false);
        });
        rzp.open();
      } catch (err) {
        notify.update(
          toastId,
          toErrorMessage(
            err,
            "We couldn't start the booking. Please try again.",
          ),
          "error",
        );
        setProcessing(false);
      }
    },
    [
      room,
      hotel,
      processing,
      datesValid,
      availability,
      checkIn,
      checkOut,
      adults,
      children,
      nights,
      offer,
      dispatch,
      navigate,
    ],
  );

  const handlePay = handleSubmit(onValidPay);

  return (
    <>
      <Seo
        title={room ? `Book ${room.name} · ${hotel?.name}` : "Booking"}
        description="Secure your luxury hotel stay — confirm your details and pay online."
      />

      <div className="luxury-bg min-h-screen pt-10">
        {roomQuery.isLoading ? (
          <Container className="py-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="min-w-0">
                <SkeletonLoader.Block className="mb-6 h-8 w-64" />
                <SkeletonLoader.Form fields={5} columns={2} />
                <SkeletonLoader.Block className="mt-8 h-3 w-40" />
                <SkeletonLoader.Block className="mt-4 h-14 w-full rounded-xl" />
                <SkeletonLoader.Button className="mt-8 w-48" />
              </div>
              <div>
                <SkeletonLoader.Summary className="lg:sticky lg:top-24" />
              </div>
            </div>
          </Container>
        ) : roomError ? (
          <Container className="py-24">
            <EmptyState
              tone="dark"
              icon={<Icon name="info" size={32} className="text-[#E7C977]" />}
              title="Room not found"
              description={roomError}
              action={
                <Link to={ROUTES.HOTELS} className="lux-btn-gold">
                  Browse hotels
                </Link>
              }
            />
          </Container>
        ) : room && hotel ? (
          <>
            <section className="container-lux pt-10 sm:pt-14">
              <Breadcrumb
                tone="dark"
                items={[
                  { label: "Home", to: ROUTES.HOME },
                  { label: "Hotels", to: ROUTES.HOTELS },
                  {
                    label: hotel.name,
                    to: buildPath(ROUTES.HOTEL_DETAIL, { id: hotel._id }),
                  },
                  {
                    label: room.name,
                    to: buildPath(ROUTES.ROOM_DETAIL, { id: room._id }),
                  },
                  { label: "Reserve" },
                ]}
              />
              <div className="mt-8">
                <p className="lux-eyebrow">Reserve your stay</p>
                <h1 className="mt-3 font-serif text-3xl font-medium leading-tight text-[#F8F6F0] sm:text-4xl">
                  Your private reservation
                </h1>
                <p className="mt-3 text-sm text-[#A8A8A8]">
                  Confirm your details and securely pay to lock in this rate.
                </p>
                <div className="lux-hairline mt-8" />
              </div>
            </section>

            <Section className="pt-12">
              <Container>
                <form onSubmit={handlePay} noValidate>
                  <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
                    {/* Guest details */}
                    <motion.div
                      variants={staggerContainer(0.06)}
                      initial="hidden"
                      animate="visible"
                      className="min-w-0"
                    >
                      <motion.div
                        variants={fadeInUp}
                        className="lux-glass p-6 sm:p-7"
                      >
                        <h2 className="flex items-center gap-3 font-serif text-xl font-medium text-[#F8F6F0]">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-sm font-bold text-[#F1D477]">
                            1
                          </span>
                          Guest details
                        </h2>
                        <div className="mt-6">
                          <Input
                            tone="dark"
                            label="Full name"
                            id="booking-name"
                            error={errors.name?.message}
                            placeholder="Your full name"
                            autoComplete="name"
                            {...register("name", {
                              required: "Full name is required",
                            })}
                          />
                          <Input
                            tone="dark"
                            label="Email"
                            id="booking-email"
                            type="email"
                            autoComplete="email"
                            error={errors.email?.message}
                            placeholder="you@example.com"
                            {...register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: "Enter a valid email address",
                              },
                            })}
                          />
                          <Input
                            tone="dark"
                            label="Phone"
                            id="booking-phone"
                            type="tel"
                            autoComplete="tel"
                            error={errors.phone?.message}
                            placeholder="+91 98765 43210"
                            {...register("phone", {
                              required: "Phone number is required",
                              pattern: {
                                value: /^[+\d][\d\s-]{7,}$/,
                                message: "Enter a valid phone number",
                              },
                            })}
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        variants={fadeInUp}
                        className="lux-glass mt-5 p-6 sm:p-7"
                      >
                        <h2 className="flex items-center gap-3 font-serif text-xl font-medium text-[#F8F6F0]">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-sm font-bold text-[#F1D477]">
                            2
                          </span>
                          Offer code{" "}
                          <span className="text-sm font-normal text-[#77736B]">
                            (optional)
                          </span>
                        </h2>
                        <div className="mt-6 flex gap-3">
                          <div className="flex-1">
                            <input
                              id="offer-code"
                              className="lux-input"
                              placeholder="e.g. WELCOME10"
                              autoComplete="off"
                              disabled={offerLoading}
                              {...register("offerCode")}
                            />
                            {offerError && (
                              <p className="mt-2 text-sm text-[#E8A2A2]">
                                {offerError}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => applyOffer()}
                            disabled={offerLoading}
                            loading={offerLoading}
                          >
                            Apply
                          </Button>
                        </div>
                        {offer && (
                          <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#E7C977]">
                            <Icon name="star" size={14} />{" "}
                            {offer.title || offer.code} applied —{" "}
                            {formatCurrency(offer.discountAmount)} off
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        variants={fadeInUp}
                        className="lux-glass mt-5 p-6 sm:p-7"
                      >
                        <h2 className="flex items-center gap-3 font-serif text-xl font-medium text-[#F8F6F0]">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-sm font-bold text-[#F1D477]">
                            3
                          </span>
                          Special requests
                        </h2>
                        <div className="mt-6">
                          <label
                            htmlFor="special-requests"
                            className="lux-label"
                          >
                            Anything we should know?
                          </label>
                          <textarea
                            id="special-requests"
                            className="lux-input min-h-24 resize-y"
                            placeholder="Early check-in, high floor, airport transfer…"
                            maxLength={500}
                            {...register("specialRequests")}
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="gold"
                          size="lg"
                          className="mt-7 w-full"
                          disabled={
                            processing ||
                            (datesValid && availability?.isAvailable === false)
                          }
                          loading={processing}
                        >
                          {datesValid && availability?.isAvailable === false
                            ? "Sold out on these dates"
                            : "Proceed to secure payment"}
                        </Button>
                        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#77736B]">
                          <Icon
                            name="shield"
                            size={14}
                            className="text-[#E7C977]"
                          />
                          Encrypted, secure payment powered by Razorpay
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Summary sidebar */}
                    <aside className="lg:pt-1">
                      <div className="space-y-5 lg:sticky lg:top-24">
                        <OrderSummary
                          room={room}
                          hotel={hotel}
                          checkIn={checkIn}
                          checkOut={checkOut}
                          nights={nights}
                          adults={adults}
                          children={children}
                          pricing={pricing}
                          offer={offer}
                        />
                        {availability?.isAvailable === false && (
                          <motion.p
                            variants={fadeInUp}
                            className="rounded-xl border border-[#E8A2A2]/30 bg-[#E8A2A2]/5 p-4 text-sm text-[#E8A2A2]"
                          >
                            This room is sold out on your chosen dates. Try
                            different dates.
                          </motion.p>
                        )}
                      </div>
                    </aside>
                  </div>
                </form>
              </Container>
            </Section>
          </>
        ) : null}
      </div>
    </>
  );
};

export default Booking;
