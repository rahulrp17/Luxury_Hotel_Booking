import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

import {
  Wifi,
  Waves,
  Dumbbell,
  Utensils,
  CircleParking,
  Snowflake,
  Tv,
  Wind,
  Coffee,
  Bath,
  ShowerHead,
  BedDouble,
  ConciergeBell,
  Sparkles,
  ShieldCheck,
  Lock,
  KeyRound,
  BriefcaseBusiness,
  Plane,
  Accessibility,
  Baby,
  PawPrint,
  Wine,
  Martini,
  Bell,
  Phone,
  MapPin,
  Globe,
  Building2,
  Hotel,
  DoorOpen,
  Users,
  Heart,
  Star,
  CalendarDays,
  Grid3X3,
} from "lucide-react";

import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Icon from "@/components/ui/Icons";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

import { amenityService, notify } from "@/services";
import { AMENITY_CATEGORIES } from "@/constants/enums";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PAGE_SIZE = 8;

/* ========================================================================= */
/* Form                                                                      */
/* ========================================================================= */

const EMPTY_FORM = {
  name: "",
  icon: "",
  category: AMENITY_CATEGORIES.ROOM,
  description: "",
};

/* ========================================================================= */
/* Lucide Amenity Icons                                                      */
/*                                                                           */
/* IMPORTANT:                                                                */
/* Only the string key is stored in MongoDB.                                */
/*                                                                           */
/* Example:                                                                  */
/* {                                                                        */
/*   name: "WiFi",                                                          */
/*   icon: "wifi",                                                           */
/*   category: "HOTEL"                                                       */
/* }                                                                        */
/*                                                                           */
/* "wifi" -> Wifi component                                                  */
/* "gym"  -> Dumbbell component                                              */
/* "pool" -> Waves component                                                 */
/* ========================================================================= */

const AMENITY_ICON_MAP = {
  wifi: Wifi,
  pool: Waves,
  gym: Dumbbell,
  restaurant: Utensils,
  parking: CircleParking,
  ac: Snowflake,
  tv: Tv,
  ventilation: Wind,
  coffee: Coffee,
  bathtub: Bath,
  shower: ShowerHead,
  bed: BedDouble,
  room_service: ConciergeBell,
  housekeeping: Sparkles,
  security: ShieldCheck,
  safe: Lock,
  key_card: KeyRound,
  business_center: BriefcaseBusiness,
  airport_shuttle: Plane,
  accessibility: Accessibility,
  family: Baby,
  pet_friendly: PawPrint,
  bar: Wine,
  lounge: Martini,
  bell_service: Bell,
  telephone: Phone,
  location: MapPin,
  internet: Globe,
  building: Building2,
  hotel: Hotel,
  room_access: DoorOpen,
  guests: Users,
  wellness: Heart,
  premium: Star,
  booking: CalendarDays,
};

/* ========================================================================= */
/* Amenity icon options                                                      */
/*                                                                           */
/* These values are what will be stored in MongoDB.                         */
/* ========================================================================= */

const AMENITY_ICONS = [
  {
    value: "wifi",
    label: "WiFi",
  },
  {
    value: "pool",
    label: "Swimming Pool",
  },
  {
    value: "gym",
    label: "Fitness Center",
  },
  {
    value: "restaurant",
    label: "Restaurant",
  },
  {
    value: "parking",
    label: "Parking",
  },
  {
    value: "ac",
    label: "Air Conditioning",
  },
  {
    value: "tv",
    label: "Television",
  },
  {
    value: "ventilation",
    label: "Air / Ventilation",
  },
  {
    value: "coffee",
    label: "Coffee Maker",
  },
  {
    value: "bathtub",
    label: "Bathtub",
  },
  {
    value: "shower",
    label: "Shower",
  },
  {
    value: "bed",
    label: "Bed",
  },
  {
    value: "room_service",
    label: "Room Service",
  },
  {
    value: "housekeeping",
    label: "Housekeeping",
  },
  {
    value: "security",
    label: "Security",
  },
  {
    value: "safe",
    label: "Safe",
  },
  {
    value: "key_card",
    label: "Key Card",
  },
  {
    value: "business_center",
    label: "Business Center",
  },
  {
    value: "airport_shuttle",
    label: "Airport Shuttle",
  },
  {
    value: "accessibility",
    label: "Accessibility",
  },
  {
    value: "family",
    label: "Family Friendly",
  },
  {
    value: "pet_friendly",
    label: "Pet Friendly",
  },
  {
    value: "bar",
    label: "Bar",
  },
  {
    value: "lounge",
    label: "Lounge / Drinks",
  },
  {
    value: "bell_service",
    label: "Bell Service",
  },
  {
    value: "telephone",
    label: "Telephone",
  },
  {
    value: "location",
    label: "Location",
  },
  {
    value: "internet",
    label: "Internet",
  },
  {
    value: "building",
    label: "Hotel Building",
  },
  {
    value: "hotel",
    label: "Hotel",
  },
  {
    value: "room_access",
    label: "Room Access",
  },
  {
    value: "guests",
    label: "Guests",
  },
  {
    value: "wellness",
    label: "Wellness",
  },
  {
    value: "premium",
    label: "Premium",
  },
  {
    value: "booking",
    label: "Booking",
  },
];

/* ========================================================================= */
/* Helper                                                                    */
/* ========================================================================= */

/**
 * Converts icon names into a consistent lookup key.
 *
 * Supports both:
 *
 * "wifi"
 * "Wifi"
 * "WIFI"
 *
 * and also:
 *
 * "CircleParking"
 * "circle_parking"
 *
 * This is useful because you already have some old MongoDB records
 * containing values such as "Wifi" and "Dumbbell".
 */
const normalizeIconName = (name = "") => {
  return String(name)
    .trim()
    .replace(/[-_\s]/g, "")
    .toLowerCase();
};

/**
 * Resolve MongoDB icon string -> Lucide component.
 */
const getAmenityIcon = (name) => {
  const normalized = normalizeIconName(name);

  const normalizedMap = Object.entries(AMENITY_ICON_MAP).reduce(
    (acc, [key, component]) => {
      acc[normalizeIconName(key)] = component;
      return acc;
    },
    {}
  );

  return normalizedMap[normalized] || Grid3X3;
};

/**
 * Renders a Lucide amenity icon.
 */
const AmenityIcon = ({
  name,
  size = 21,
  strokeWidth = 1.8,
  ...props
}) => {
  const LucideIcon = getAmenityIcon(name);

  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

/* ========================================================================= */
/* Delete button                                                             */
/* ========================================================================= */

const deleteIconCls =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-white/[0.03] text-[#B8B2A5] transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60";

/* ========================================================================= */
/* Component                                                                 */
/* ========================================================================= */

const AdminAmenities = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  /* ======================================================================= */
  /* React Hook Form                                                         */
  /* ======================================================================= */

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: EMPTY_FORM,
  });

  const selectedIcon = watch("icon");

  /* ======================================================================= */
  /* Fetch amenities                                                         */
  /* ======================================================================= */

  const query = useQuery({
    queryKey: ["admin", "amenities", page],

    queryFn: () =>
      amenityService.getAll({
        page,
        limit: PAGE_SIZE,
      }),

    staleTime: 60 * 1000,
  });

  const amenities = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  /* ======================================================================= */
  /* Invalidate                                                              */
  /* ======================================================================= */

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["admin", "amenities"],
    });
  }, [queryClient]);

  /* ======================================================================= */
  /* Create / Update                                                         */
  /* ======================================================================= */

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (editing) {
        return amenityService.adminUpdate(editing._id, payload);
      }

      return amenityService.adminCreate(payload);
    },

    onSuccess: () => {
      notify.success(
        editing
          ? "Amenity updated successfully."
          : "Amenity created successfully."
      );

      setModalOpen(false);
      setEditing(null);

      reset(EMPTY_FORM);

      invalidate();
    },

    onError: (err) => {
      notify.errorFrom(
        err,
        editing
          ? "We couldn't update this amenity."
          : "We couldn't create this amenity."
      );
    },
  });

  /* ======================================================================= */
  /* Delete                                                                  */
  /* ======================================================================= */

  const deleteMutation = useMutation({
    mutationFn: (id) => amenityService.adminDelete(id),

    onSuccess: () => {
      notify.success("Amenity deleted successfully.");

      invalidate();
    },

    onError: (err) => {
      notify.errorFrom(err, "We couldn't delete this amenity.");
    },
  });

  /* ======================================================================= */
  /* Open Create                                                             */
  /* ======================================================================= */

  const openCreate = () => {
    setEditing(null);

    reset(EMPTY_FORM);

    setModalOpen(true);
  };

  /* ======================================================================= */
  /* Open Edit                                                               */
  /* ======================================================================= */

  const openEdit = (amenity) => {
    setEditing(amenity);

    reset({
      name: amenity.name || "",
      icon: amenity.icon || "",
      category:
        amenity.category || AMENITY_CATEGORIES.ROOM,
      description: amenity.description || "",
    });

    setModalOpen(true);
  };

  /* ======================================================================= */
  /* Submit                                                                  */
  /* ======================================================================= */

  const onSubmit = (values) => {
    const payload = {
      name: values.name.trim(),

      /*
       * Store lowercase icon key in MongoDB.
       *
       * Example:
       * "wifi"
       * "pool"
       * "gym"
       */
      icon: values.icon.toLowerCase(),

      category: values.category,

      description:
        values.description?.trim() || "",
    };

    saveMutation.mutate(payload);
  };

  /* ======================================================================= */
  /* Delete handler                                                          */
  /* ======================================================================= */

  const handleDelete = (amenity) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${amenity.name}"?`
    );

    if (!confirmed) return;

    deleteMutation.mutate(amenity._id);
  };

  /* ======================================================================= */
  /* Loading                                                                 */
  /* ======================================================================= */

  const loading =
    query.isLoading && amenities.length === 0;

  /* ======================================================================= */
  /* Render                                                                  */
  /* ======================================================================= */

  return (
    <>
      <Seo
        title="Manage amenities"
        description="Manage AureliaStay hotel and room amenities."
      />

      <div className="lux-canvas">
        <div className="lux-inner">
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-6xl"
          >
            {/* =========================================================== */}
            {/* HEADER                                                       */}
            {/* =========================================================== */}

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-end justify-between gap-4"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">
                  Hotel facilities
                </p>

                <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">
                  Amenities
                </h1>

                <p className="mt-1 max-w-xl text-sm text-[#B8B2A5]">
                  Manage the facilities and services available across your
                  hotels and rooms.
                </p>
              </div>

              <Button
                variant="gold"
                onClick={openCreate}
              >
                <Icon
                  name="star"
                  size={16}
                />

                Add Amenity
              </Button>
            </motion.div>

            {/* =========================================================== */}
            {/* LOADING                                                      */}
            {/* =========================================================== */}

            {loading ? (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonLoader.Card tone="dark" />
                <SkeletonLoader.Card tone="dark" />
                <SkeletonLoader.Card tone="dark" />
              </div>
            ) : query.isError ? (
              /* ========================================================= */
              /* ERROR                                                       */
              /* ========================================================= */

              <motion.div
                variants={fadeInUp}
                className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.04] py-16 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-300">
                  <Icon
                    name="X"
                    size={24}
                  />
                </div>

                <p className="mt-4 font-serif text-2xl text-[#F5F1E8]">
                  Unable to load amenities
                </p>

                <p className="mt-2 text-sm text-[#B8B2A5]">
                  Something went wrong while loading the amenities.
                </p>

                <button
                  type="button"
                  onClick={() => query.refetch()}
                  className="mt-5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2.5 text-sm font-medium text-[#E7C977] transition hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/20"
                >
                  Try again
                </button>
              </motion.div>
            ) : amenities.length === 0 ? (
              /* ========================================================= */
              /* EMPTY                                                       */
              /* ========================================================= */

              <motion.div
                variants={fadeInUp}
                className="mt-8 rounded-2xl border border-dashed border-[#D4AF37]/25 bg-white/[0.02] py-16 text-center"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#E7C977]">
                  <Icon
                    name="Grid3X3"
                    size={24}
                  />
                </span>

                <p className="mt-4 font-serif text-2xl text-[#F5F1E8]">
                  No amenities yet
                </p>

                <p className="mt-1 text-sm text-[#B8B2A5]">
                  Add your first facility to the collection.
                </p>

                <Button
                  variant="gold"
                  onClick={openCreate}
                  className="mt-5"
                >
                  <Icon
                    name="Grid3X3"
                    size={16}
                  />

                  Add first amenity
                </Button>
              </motion.div>
            ) : (
              /* ========================================================= */
              /* AMENITIES                                                   */
              /* ========================================================= */

              <motion.ul
                variants={staggerContainer(0.06)}
                className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {amenities.map((amenity) => (
                  <motion.li
                    key={amenity._id}
                    variants={fadeInUp}
                  >
                    <div className="group flex h-full flex-col rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/45 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(212,175,55,0.12)]">

                      {/* ================================================= */}
                      {/* CARD TOP                                            */}
                      {/* ================================================= */}

                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977] transition-all duration-300 group-hover:border-[#D4AF37]/50 group-hover:bg-[#D4AF37]/15 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">

                          <AmenityIcon
                            name={amenity.icon}
                            size={21}
                            strokeWidth={1.8}
                          />

                        </span>

                        <span className="inline-flex rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#E7C977]">
                          {amenity.category}
                        </span>
                      </div>

                      {/* ================================================= */}
                      {/* NAME                                                */}
                      {/* ================================================= */}

                      <h3 className="mt-4 font-serif text-lg font-medium text-[#F5F1E8]">
                        {amenity.name}
                      </h3>

                      {/* ================================================= */}
                      {/* DESCRIPTION                                         */}
                      {/* ================================================= */}

                      <p className="mt-1 flex-1 text-sm leading-relaxed text-[#B8B2A5]">
                        {amenity.description ||
                          "No description provided."}
                      </p>

                      {/* ================================================= */}
                      {/* ICON KEY                                            */}
                      {/* ================================================= */}

                      <div className="mt-4 flex items-center gap-2">
                        <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[10px] text-[#77736B]">
                          {amenity.icon || "grid"}
                        </span>
                      </div>

                      {/* ================================================= */}
                      {/* ACTIONS                                             */}
                      {/* ================================================= */}

                      <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(amenity)
                          }
                          className="lux-icon-btn"
                          aria-label={`Edit ${amenity.name}`}
                        >
                          <Icon
                            name="pencil"
                            size={15}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(amenity)
                          }
                          disabled={
                            deleteMutation.isPending
                          }
                          className={deleteIconCls}
                          aria-label={`Delete ${amenity.name}`}
                        >
                          <Icon
                            name="trash"
                            size={15}
                          />
                        </button>

                      </div>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {/* =========================================================== */}
            {/* PAGINATION                                                    */}
            {/* =========================================================== */}

            {pagination?.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onChange={setPage}
                  tone="dark"
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CREATE / EDIT MODAL                                               */}
      {/* ================================================================= */}

      <Modal
        open={modalOpen}
        onClose={() => {
          if (saveMutation.isPending) return;

          setModalOpen(false);
          setEditing(null);
          reset(EMPTY_FORM);
        }}
        title={
          editing
            ? "Edit amenity"
            : "Add amenity"
        }
        tone="glass"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
                reset(EMPTY_FORM);
              }}
              disabled={
                isSubmitting ||
                saveMutation.isPending
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="amenity-form"
              variant="gold"
              loading={
                isSubmitting ||
                saveMutation.isPending
              }
            >
              {editing
                ? "Save changes"
                : "Create amenity"}
            </Button>
          </>
        }
      >
        <form
          id="amenity-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >

          {/* =========================================================== */}
          {/* NAME                                                          */}
          {/* =========================================================== */}

          <Input
            tone="dark"
            label="Name"
            id="amenity-name"
            placeholder="Infinity Pool"
            error={errors.name?.message}
            {...register("name", {
              required: "Name is required",
              maxLength: {
                value: 50,
                message:
                  "Maximum 50 characters",
              },
            })}
          />

          {/* =========================================================== */}
          {/* ICON                                                          */}
          {/* =========================================================== */}

          <div className="mb-4">
            <label
              htmlFor="amenity-icon"
              className="lux-label-gold"
            >
              Icon
            </label>

            <div className="flex gap-3">

              {/* ------------------------------------------------------- */}
              {/* ICON SELECT                                             */}
              {/* ------------------------------------------------------- */}

              <select
                id="amenity-icon"
                className="lux-input-solid flex-1"
                {...register("icon", {
                  required:
                    "Icon is required",
                })}
              >
                <option
                  value=""
                  className="bg-[#0E0E0E]"
                >
                  Select an icon
                </option>

                {AMENITY_ICONS.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                      className="bg-[#0E0E0E]"
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>

              {/* ------------------------------------------------------- */}
              {/* LIVE ICON PREVIEW                                       */}
              {/* ------------------------------------------------------- */}

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977] shadow-[0_0_25px_rgba(212,175,55,0.08)]">

                <AmenityIcon
                  name={selectedIcon}
                  size={21}
                  strokeWidth={1.8}
                />

              </div>
            </div>

            {/* ERROR */}

            {errors.icon && (
              <p className="mt-1 text-xs text-red-400">
                {errors.icon.message}
              </p>
            )}

            {/* SELECTED ICON */}

            {selectedIcon && (
              <p className="mt-2 text-[11px] text-[#77736B]">
                Stored as:{" "}
                <span className="font-mono text-[#C9AB4B]">
                  {selectedIcon}
                </span>
              </p>
            )}
          </div>

          {/* =========================================================== */}
          {/* CATEGORY                                                      */}
          {/* =========================================================== */}

          <div className="mb-4">
            <label
              htmlFor="amenity-category"
              className="lux-label-gold"
            >
              Category
            </label>

            <select
              id="amenity-category"
              className="lux-input-solid"
              {...register("category", {
                required:
                  "Category is required",
              })}
            >
              {Object.values(
                AMENITY_CATEGORIES
              ).map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-[#0E0E0E]"
                >
                  {category}
                </option>
              ))}
            </select>

            {errors.category && (
              <p className="mt-1 text-xs text-red-400">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* =========================================================== */}
          {/* DESCRIPTION                                                   */}
          {/* =========================================================== */}

          <Input
            tone="dark"
            label="Description (optional)"
            id="amenity-description"
            placeholder="High-speed wireless internet throughout the property"
            error={
              errors.description?.message
            }
            {...register("description", {
              maxLength: {
                value: 200,
                message:
                  "Maximum 200 characters",
              },
            })}
          />

        </form>
      </Modal>
    </>
  );
};

export default AdminAmenities;