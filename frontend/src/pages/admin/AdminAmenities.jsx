import { useCallback, useEffect, useRef, useState } from "react";
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
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Pagination from "@/components/ui/Pagination";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

import { amenityService, notify } from "@/services";
import useOptimisticDelete from "@/hooks/useOptimisticDelete";
import { AMENITY_CATEGORIES } from "@/constants/enums";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { FALLBACK_ASSETS } from "@/constants/assets";

const PAGE_SIZE = 8;

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB — matches backend multer limit

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
/* Thumbnail with fallback                                                   */
/* ========================================================================= */

/**
 * Amenity thumbnail for the table's Image column. Falls back to a local asset
 * when the URL is missing or fails to load, and a gold placeholder when there
 * is nothing to show. Clicking the thumbnail opens the larger preview.
 */
const AmenityThumb = ({ image, name, onClick }) => {
  const [src, setSrc] = useState(image || "");
  const fallback = FALLBACK_ASSETS.amenity;

  useEffect(() => {
    setSrc(image || "");
  }, [image]);

  if (!src) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Preview ${name} image`}
        className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-white/[0.03] text-[#77736B] transition-colors hover:border-[#D4AF37]/40 hover:text-[#E7C977]"
      >
        <Icon name="camera" size={17} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Preview ${name} image`}
      className="group/thumb relative shrink-0 overflow-hidden rounded-xl border border-[#D4AF37]/15 transition-colors hover:border-[#D4AF37]/45"
    >
      <img
        src={src}
        alt={name}
        onError={() => setSrc(fallback)}
        className="h-12 w-16 object-cover transition-transform duration-500 group-hover/thumb:scale-105"
      />
    </button>
  );
};

/* ========================================================================= */
/* Full-screen image preview overlay                                         */
/* ========================================================================= */

const ImagePreview = ({ src, alt, onClose }) => {
  useEffect(() => {
    if (!src) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-overlay flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${alt}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Icon name="close" size={18} />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-xl border border-[#D4AF37]/25 shadow-[0_0_60px_rgba(212,175,55,0.2)]"
      />
    </div>
  );
};

/* ========================================================================= */
/* Component                                                                 */
/* ========================================================================= */

const AdminAmenities = () => {
  const queryClient = useQueryClient();
  const imageFileInputRef = useRef(null);

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);

  /* ======================================================================= */
  /* Image helpers                                                           */
  /* ======================================================================= */

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setUploadProgress(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Please select a valid image file.");
      return;
    }

    if (file.size > IMAGE_MAX_SIZE) {
      notify.error("Image must be 5MB or smaller.");
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  };

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
    mutationFn: async ({ payload, file, editingId, shouldRemoveImage }) => {
      let amenity;

      if (editingId) {
        amenity = (await amenityService.adminUpdate(editingId, payload)).data;
      } else {
        amenity = (await amenityService.adminCreate(payload)).data;
      }

      if (shouldRemoveImage) {
        const removed = await amenityService.adminRemoveImage(amenity._id);
        amenity = removed?.data ?? amenity;
      }

      if (file && amenity?._id) {
        const uploaded = await amenityService.adminUploadImage(
          amenity._id,
          file,
          (e) => {
            const percent = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
            setUploadProgress(percent);
          }
        );
        amenity = uploaded?.data ?? amenity;
      }

      return amenity;
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
      clearImage();

      invalidate();
    },

    onError: (err) => {
      notify.errorFrom(
        err,
        editing
          ? "We couldn't update this amenity."
          : "We couldn't create this amenity."
      );

      setUploadProgress(null);
    },
  });

  /* ======================================================================= */
  /* Delete                                                                  */
  /* ======================================================================= */

  const deleteMutation = useOptimisticDelete({
    deleteFn: (id) => amenityService.adminDelete(id),
    keys: [
      { key: ["admin", "amenities"], mode: "remove" },
      { key: ["amenities"], mode: "remove" },
    ],
    successMessage: "Amenity deleted successfully.",
    errorMessage: "We couldn't delete this amenity.",
  });

  /* ======================================================================= */
  /* Open Create                                                             */
  /* ======================================================================= */

  const openCreate = () => {
    setEditing(null);

    reset(EMPTY_FORM);
    clearImage();

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

    clearImage();

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

    saveMutation.mutate({
      payload,
      file: selectedImage,
      editingId: editing?._id,
      shouldRemoveImage: removeExistingImage,
    });
  };

  /* ======================================================================= */
  /* Delete handler                                                          */
  /* ======================================================================= */

  const handleDelete = (amenity) => {
    setDeleteTarget(amenity);
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
                <SkeletonLoader.Card />
                <SkeletonLoader.Card />
                <SkeletonLoader.Card />
                <SkeletonLoader.Card />
                <SkeletonLoader.Card />
                <SkeletonLoader.Card />
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
              /* AMENITIES TABLE                                             */
              /* ========================================================= */

              <motion.div
                variants={fadeInUp}
                className="mt-8 overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15 bg-white/[0.02]">
                        <th className="lux-table-th">Amenity</th>
                        <th className="lux-table-th">Category</th>
                        <th className="lux-table-th">Image</th>
                        <th className="lux-table-th text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {amenities.map((amenity) => (
                        <motion.tr
                          key={amenity._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="transition-colors hover:bg-white/[0.03]"
                        >
                          <td className="lux-table-td">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977]">
                                <AmenityIcon
                                  name={amenity.icon}
                                  size={18}
                                  strokeWidth={1.8}
                                />
                              </span>

                              <div className="min-w-0">
                                <p className="max-w-[200px] truncate font-serif font-medium text-[#F5F1E8]">
                                  {amenity.name}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-[#77736B]">
                                  {amenity.description ||
                                    "No description provided."}
                                </p>
                                <p className="mt-0.5 font-mono text-[10px] text-[#77736B]">
                                  {amenity.icon || "grid"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="lux-table-td">
                            <span className="inline-flex rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#E7C977]">
                              {amenity.category}
                            </span>
                          </td>

                          <td className="lux-table-td">
                            <AmenityThumb
                              image={amenity.image}
                              name={amenity.name}
                              onClick={() =>
                                setPreviewTarget({
                                  src: amenity.image,
                                  name: amenity.name,
                                })
                              }
                            />
                          </td>

                          <td className="lux-table-td">
                            <div className="flex justify-end gap-2">
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
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
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
          clearImage();
        }}
        title={
          editing
            ? "Edit amenity"
            : "Add amenity"
        }
        tone="glass"
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
                reset(EMPTY_FORM);
                clearImage();
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

        {/* =========================================================== */}
          {/* IMAGE UPLOAD / PREVIEW                                        */}
          {/* =========================================================== */}

          <div className="mt-2 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.03] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-serif text-base font-medium text-[#F5F1E8]">
                Amenity image
              </p>

              <p className="text-[11px] text-[#77736B]">
                JPG, PNG, WEBP or AVIF · max 5MB
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Preview */}
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-black/20">
                {imagePreview || (editing && editing.image && !removeExistingImage) ? (
                  <img
                    src={imagePreview || editing.image}
                    alt="Amenity preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[#77736B]">
                    <Icon name="camera" size={24} />
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2.5 text-xs font-semibold text-[#E7C977] transition-colors hover:bg-[#D4AF37]/20">
                  <Icon name="camera" size={15} />
                  {editing && editing.image && !removeExistingImage
                    ? "Replace image"
                    : "Choose image"}
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="hidden"
                    onChange={onImageSelect}
                    disabled={saveMutation.isPending}
                  />
                </label>

                {selectedImage && (
                  <p className="truncate text-xs text-[#B8B2A5]">
                    {selectedImage.name}
                  </p>
                )}

                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setSelectedImage(null);
                      setImagePreview(null);
                      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
                    }}
                    className="self-start text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                  >
                    Remove selection
                  </button>
                )}
              </div>
            </div>

            {editing && editing.image && !removeExistingImage && (
              <div className="mt-3 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setRemoveExistingImage(true);
                    setSelectedImage(null);
                    if (imagePreview) URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
                  }}
                  className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                >
                  Remove current image
                </button>
              </div>
            )}

            {removeExistingImage && (
              <p className="mt-3 text-xs text-[#E7C977]">
                The current image will be removed when you save.
              </p>
            )}

            {/* Upload progress */}
            {saveMutation.isPending && uploadProgress !== null && (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-[#E7C977]">
                  <span>Uploading image…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C8A446] to-[#E7C96A] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

        </form>
      </Modal>

      {/* Table image preview */}
      <ImagePreview
        src={previewTarget?.src}
        alt={previewTarget?.name || "Amenity"}
        onClose={() => setPreviewTarget(null)}
      />

      {/* Delete confirmation */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget._id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        loading={deleteMutation.isPending}
        title="Delete this amenity?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from the collection and from every hotel that lists it.`
            : undefined
        }
      />
    </>
  );
};

export default AdminAmenities;