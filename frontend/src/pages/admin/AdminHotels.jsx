import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Icon from "@/components/ui/Icons";
import Modal from "@/components/ui/Modal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Pagination from "@/components/ui/Pagination";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { hotelService, amenityService } from "@/services";
import { notify } from "@/services";
import useOptimisticDelete from "@/hooks/useOptimisticDelete";
import { HOTEL_CATEGORIES } from "@/constants/enums";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  name: "",
  category: HOTEL_CATEGORIES.LUXURY,
  starRating: 5,
  avgRating: 0,
  totalReviews: 0,
  description: "",
  shortDescription: "",
  contact: { email: "", phone: "", website: "" },
  address: { street: "", city: "", state: "", country: "India", pincode: "" },
  policies: { checkIn: "14:00", checkOut: "12:00", petsAllowed: false },
  isActive: true,
  isFeatured: false,
  tags: "",
};

const CategoryLabel = ({ category }) => category?.replace(/_/g, " ").toLowerCase();

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 20 },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

const AdminHotels = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const query = useQuery({
    queryKey: ["admin", "hotels", page],
    queryFn: () => hotelService.adminGetAll({ page, limit: PAGE_SIZE }),
    staleTime: 0,
  });

  const hotels = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  const amenitiesQuery = useQuery({
    queryKey: ["amenities", "all"],
    queryFn: () => amenityService.getAll({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const amenities = amenitiesQuery.data?.data ?? [];

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
  }, [queryClient]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const clearImages = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveMutation = useMutation({
    mutationFn: async ({ payload, files, editingId }) => {
      let response;

      if (editingId) {
        response = await hotelService.adminUpdate(editingId, payload);
      } else {
        response = await hotelService.adminCreate(payload);
      }

      const hotel = response?.data ?? response;

      if (files?.length && hotel?._id) {
        const imageResponse = await hotelService.adminAddImages(hotel._id, files);
        return imageResponse?.data ?? imageResponse;
      }

      return hotel;
    },
    onSuccess: (hotel) => {
      notify.success(editing ? "Hotel updated successfully." : "Hotel created successfully.");

      if (hotel?._id) {
        setEditing(hotel);
      }

      clearImages();
      setModalOpen(false);
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "We couldn't save this hotel."),
  });

  const deleteMutation = useOptimisticDelete({
    deleteFn: (id) => hotelService.adminDelete(id),
    keys: [
      // Admin list keeps the row but flips it to inactive (soft delete contract).
      { key: ["admin", "hotels"], mode: "deactivate" },
      // Public lists/detail drop the hotel entirely.
      { key: ["hotels"], mode: "remove" },
      { key: ["hotel"], mode: "remove" },
      { key: ["featured-hotels"], mode: "remove" },
    ],
    successMessage: "Hotel removed.",
    errorMessage: "We couldn't remove this hotel.",
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, isFeatured }) => hotelService.adminUpdate(id, { isFeatured }),
    onSuccess: () => {
      notify.success("Featured status updated.");
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't update featured status."),
  });

  const addImagesMutation = useMutation({
    mutationFn: ({ id, files }) => hotelService.adminAddImages(id, files).then((res) => res.data),
    onSuccess: (hotel) => {
      notify.success("Images uploaded.");
      setEditing(hotel);
      clearImages();
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't upload images."),
  });

  const removeImageMutation = useMutation({
    mutationFn: ({ id, imageId }) => hotelService.adminRemoveImage(id, imageId).then((res) => res.data),
    onSuccess: (hotel) => {
      notify.success("Image removed.");
      setEditing(hotel);
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't remove that image."),
  });

  const setPrimaryMutation = useMutation({
    mutationFn: ({ id, imageId }) => hotelService.adminSetPrimary(id, imageId).then((res) => res.data),
    onSuccess: (hotel) => {
      notify.success("Primary image updated.");
      setEditing(hotel);
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't update the primary image."),
  });

  const openCreate = () => {
    setEditing(null);
    setSelectedAmenities([]);
    clearImages();
    reset(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (hotel) => {
    setEditing(hotel);

    clearImages();

    reset({
      name: hotel.name || "",
      category: hotel.category || HOTEL_CATEGORIES.LUXURY,
      starRating: hotel.starRating || 5,
      avgRating: hotel.avgRating ?? 0,
      totalReviews: hotel.totalReviews ?? 0,
      description: hotel.description || "",
      shortDescription: hotel.shortDescription || "",
      contact: {
        email: hotel.contact?.email || "",
        phone: hotel.contact?.phone || "",
        website: hotel.contact?.website || "",
      },
      address: {
        street: hotel.address?.street || "",
        city: hotel.address?.city || "",
        state: hotel.address?.state || "",
        country: hotel.address?.country || "India",
        pincode: hotel.address?.pincode || "",
      },
      policies: {
        checkIn: hotel.policies?.checkIn || "14:00",
        checkOut: hotel.policies?.checkOut || "12:00",
        petsAllowed: !!hotel.policies?.petsAllowed,
      },
      isActive: hotel.isActive !== false,
      isFeatured: !!hotel.isFeatured,
      tags: (hotel.tags || []).join(", "),
    });

    setSelectedAmenities((hotel.amenities || []).map((a) => a._id || a));
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saveMutation.isPending) return;

    clearImages();
    setModalOpen(false);
    setEditing(null);
    setSelectedAmenities([]);
    reset(EMPTY_FORM);
  };

  const toggleAmenity = (id) => {
    setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (!validFiles.length) {
      notify.error("Please select valid image files.");
      return;
    }

    const previews = validFiles.map((file) => URL.createObjectURL(file));

    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    setSelectedImages(validFiles);
    setImagePreviews(previews);
  };

  const removeSelectedImage = (index) => {
    const nextFiles = selectedImages.filter((_, i) => i !== index);
    const nextPreviews = imagePreviews.filter((_, i) => i !== index);

    const removedPreview = imagePreviews[index];

    if (removedPreview) {
      URL.revokeObjectURL(removedPreview);
    }

    setSelectedImages(nextFiles);
    setImagePreviews(nextPreviews);

    if (!nextFiles.length && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      amenities: selectedAmenities,
      tags: (values.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      starRating: Number(values.starRating),
      avgRating: Math.min(5, Math.max(0, Number(values.avgRating) || 0)),
      totalReviews: Math.max(0, Math.round(Number(values.totalReviews) || 0)),
      contact: { ...values.contact },
      address: { ...values.address },
      policies: { ...values.policies },
    };

    ["email", "phone", "website"].forEach((key) => {
      if (!payload.contact[key]) delete payload.contact[key];
    });

    if (!payload.address.country) delete payload.address.country;

    if (!payload.address.pincode) delete payload.address.pincode;

    if (!payload.shortDescription) delete payload.shortDescription;

    payload.policies.petsAllowed = !!payload.policies.petsAllowed;

    saveMutation.mutate({
      payload,
      files: selectedImages,
      editingId: editing?._id,
    });
  };

  const onAddImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length || !editing) return;

    addImagesMutation.mutate({
      id: editing._id,
      files,
    });

    event.target.value = "";
  };

  const loading = query.isLoading && hotels.length === 0;

  return (
    <>
      <Seo title="Manage hotels" description="Manage AureliaStay hotels." />

      <div className="lux-canvas">
        <div className="lux-inner">
          <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="visible" className="mx-auto max-w-7xl">
            <motion.div variants={fadeInUp} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Properties</p>
                <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">Hotel Collection</h1>
                <p className="mt-1 text-sm text-[#B8B2A5]">Manage luxury properties, images, amenities and featured stays.</p>
              </div>

              <Button variant="gold" onClick={openCreate}>
                <Icon name="star" size={16} /> Add New Hotel
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/15 px-4 py-4 sm:px-6">
                <div>
                  <h2 className="font-serif text-lg font-medium text-[#FBF7EA]">Properties</h2>
                  <p className="text-xs text-[#77736B]">{pagination?.total ?? hotels.length} properties</p>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1.5 text-xs text-[#E7C977] sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  Live inventory
                </div>
              </div>

              {loading ? (
                <div className="p-5"><SkeletonLoader.Card tone="dark" /></div>
              ) : hotels.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#E7C977]">
                    <Icon name="star" size={22} />
                  </div>
                  <p className="font-serif text-xl text-[#F5F1E8]">No hotels yet</p>
                  <p className="mt-1 text-sm text-[#B8B2A5]">Create your first luxury property.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15 bg-white/[0.02]">
                        <th className="lux-table-th">Property</th>
                        <th className="lux-table-th">Category</th>
                        <th className="lux-table-th">Location</th>
                        <th className="lux-table-th">Rooms</th>
                        <th className="lux-table-th">Status</th>
                        <th className="lux-table-th text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.04]">
                      {hotels.map((hotel, index) => (
                        <motion.tr key={hotel._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="transition-colors hover:bg-white/[0.03]">
                          <td className="lux-table-td">
                            <div className="flex items-center gap-3">
                              {hotel.featuredImage?.url || hotel.images?.[0]?.url ? (
                                <img src={hotel.featuredImage?.url || hotel.images?.[0]?.url} alt={hotel.name} className="h-12 w-16 shrink-0 rounded-xl border border-[#D4AF37]/15 object-cover" />
                              ) : (
                                <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-white/[0.03] text-[#E7C977]">
                                  <Icon name="mapPin" size={17} />
                                </span>
                              )}

                              <div className="min-w-0">
                                <p className="max-w-[220px] truncate font-serif font-medium text-[#F5F1E8]">{hotel.name}</p>
                                <p className="mt-0.5 text-xs tracking-widest text-[#C9AB4B]">{"★".repeat(hotel.starRating || 0)}</p>
                              </div>
                            </div>
                          </td>

                          <td className="lux-table-td">
                            <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-semibold capitalize text-[#E7C977]">
                              <CategoryLabel category={hotel.category} />
                            </span>
                          </td>

                          <td className="lux-table-td-sub">{hotel.address?.city || "—"}</td>

                          <td className="lux-table-td font-medium">{hotel.totalActiveRooms ?? 0}</td>

                          <td className="lux-table-td">
                            {hotel.isFeatured ? (
                              <span className="inline-flex rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#F1D477]">Featured</span>
                            ) : hotel.isActive === false ? (
                              <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">Inactive</span>
                            ) : (
                              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Active</span>
                            )}
                          </td>

                          <td className="lux-table-td">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => toggleFeatured.mutate({ id: hotel._id, isFeatured: !hotel.isFeatured })} className="lux-icon-btn" aria-label={hotel.isFeatured ? "Unfeature" : "Feature"}>
                                <Icon name="star" size={15} />
                              </button>

                              <button type="button" onClick={() => openEdit(hotel)} className="lux-icon-btn" aria-label={`Edit ${hotel.name}`}>
                                <Icon name="pencil" size={15} />
                              </button>

                              <button type="button" onClick={() => setDeleteTarget(hotel)} disabled={deleteMutation.isPending} className="lux-icon-btn disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Remove ${hotel.name}`}>
                                <Icon name="trash" size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination?.totalPages > 1 && (
                <div className="flex justify-center border-t border-[#D4AF37]/15 p-4">
                  <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} tone="dark" />
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit hotel" : "Add New Hotel"} tone="glass" size="lg" footer={<><Button type="button" variant="ghost" onClick={closeModal} disabled={saveMutation.isPending}>Cancel</Button><Button type="submit" form="hotel-form" variant="gold" loading={saveMutation.isPending}>{editing ? "Save changes" : "Create hotel"}</Button></>}>
        <AnimatePresence mode="wait">
          <motion.div key={editing?._id || "create"} variants={modalVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.25 }}>
            <form id="hotel-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-6 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977]">
                    <Icon name="star" size={17} />
                  </div>
                  <div>
                    <p className="font-serif text-lg font-medium text-[#F5F1E8]">{editing ? "Property details" : "Create a luxury property"}</p>
                    <p className="text-xs text-[#77736B]">Build a complete AureliaStay listing.</p>
                  </div>
                </div>

                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Input tone="dark" label="Name" id="hotel-name" placeholder="The Grand Aurelia" error={errors.name?.message} {...register("name", { required: "Name is required", maxLength: { value: 100, message: "Max 100 characters" } })} />
                  <div className="mb-4">
                    <label htmlFor="hotel-category" className="lux-label-gold">Category</label>
                    <select id="hotel-category" className="lux-input-solid" {...register("category")}>{Object.values(HOTEL_CATEGORIES).map((c) => <option key={c} value={c} className="bg-[#0E0E0E]">{c.replace(/_/g, " ").toLowerCase()}</option>)}</select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="hotel-stars" className="lux-label-gold">Star rating</label>
                    <select id="hotel-stars" className="lux-input-solid" {...register("starRating")}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n} className="bg-[#0E0E0E]">{"★".repeat(n)}</option>)}</select>
                  </div>

                  <Input tone="dark" label="Average rating (0–5)" id="hotel-avg-rating" type="number" min="0" max="5" step="0.1" placeholder="4.8" error={errors.avgRating?.message} {...register("avgRating", { valueAsNumber: true })} />
                  <Input tone="dark" label="Total reviews" id="hotel-total-reviews" type="number" min="0" step="1" placeholder="0" error={errors.totalReviews?.message} {...register("totalReviews", { valueAsNumber: true })} />

                  <Input tone="dark" label="Short description (optional)" id="hotel-short" placeholder="A one-line teaser" error={errors.shortDescription?.message} {...register("shortDescription", { maxLength: { value: 300, message: "Max 300 characters" } })} />

                  <div className="sm:col-span-2">
                    <Input tone="dark" label="Description" id="hotel-description" placeholder="Tell guests about the property…" error={errors.description?.message} {...register("description", { required: "Description is required" })} />
                  </div>

                  <Input tone="dark" label="Contact email" id="hotel-email" type="email" placeholder="stay@example.com" error={errors.contact?.email?.message} {...register("contact.email")} />
                  <Input tone="dark" label="Contact phone" id="hotel-phone" placeholder="+91 98765 43210" {...register("contact.phone")} />
                  <Input tone="dark" label="Website" id="hotel-website" placeholder="https://…" {...register("contact.website")} />
                  <Input tone="dark" label="Street" id="hotel-street" placeholder="Marine Drive" error={errors.address?.street?.message} {...register("address.street", { required: "Street is required" })} />
                  <Input tone="dark" label="City" id="hotel-city" placeholder="Mumbai" error={errors.address?.city?.message} {...register("address.city", { required: "City is required" })} />
                  <Input tone="dark" label="State" id="hotel-state" placeholder="Maharashtra" error={errors.address?.state?.message} {...register("address.state", { required: "State is required" })} />
                  <Input tone="dark" label="Country" id="hotel-country" placeholder="India" {...register("address.country")} />
                  <Input tone="dark" label="Pincode" id="hotel-pincode" placeholder="400001" {...register("address.pincode")} />
                  <Input tone="dark" label="Check-in time" id="hotel-checkin" placeholder="14:00" error={errors.policies?.checkIn?.message} {...register("policies.checkIn", { pattern: { value: /^\d{2}:\d{2}$/, message: "Use HH:MM" } })} />
                  <Input tone="dark" label="Check-out time" id="hotel-checkout" placeholder="12:00" error={errors.policies?.checkOut?.message} {...register("policies.checkOut", { pattern: { value: /^\d{2}:\d{2}$/, message: "Use HH:MM" } })} />
                  <Input tone="dark" label="Tags (comma separated)" id="hotel-tags" placeholder="beach, honeymoon, family" {...register("tags")} />
                </div>
              </div>

              <ImageManager editing={editing} selectedImages={selectedImages} imagePreviews={imagePreviews} fileInputRef={fileInputRef} onSelect={handleImageSelect} onRemoveSelected={removeSelectedImage} onAddImages={onAddImages} onRemoveExisting={(imageId) => removeImageMutation.mutate({ id: editing._id, imageId })} onMakePrimary={(imageId) => setPrimaryMutation.mutate({ id: editing._id, imageId })} uploading={addImagesMutation.isPending || saveMutation.isPending} />

              <div className="mt-6 mb-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C9AB4B]">Amenities</p>

                {amenities.length === 0 ? (
                  <p className="text-sm text-[#77736B]">No amenities available yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity) => {
                      const active = selectedAmenities.includes(amenity._id);

                      return (
                        <motion.button key={amenity._id} whileTap={{ scale: 0.96 }} type="button" onClick={() => toggleAmenity(amenity._id)} aria-pressed={active} className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${active ? "border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#F1D477]" : "border border-white/[0.12] bg-white/[0.03] text-[#B8B2A5] hover:border-[#D4AF37]/35 hover:text-[#F5F1E8]"}`}>
                          {amenity.name}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-5 rounded-xl border border-[#D4AF37]/18 bg-white/[0.03] p-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#B8B2A5]">
                  <input type="checkbox" className="h-4 w-4 accent-[#D4AF37]" {...register("isActive")} />
                  Active (visible on site)
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#B8B2A5]">
                  <input type="checkbox" className="h-4 w-4 accent-[#D4AF37]" {...register("isFeatured")} />
                  Featured property
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#B8B2A5]">
                  <input type="checkbox" className="h-4 w-4 accent-[#D4AF37]" {...register("policies.petsAllowed")} />
                  Pets allowed
                </label>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </Modal>

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
        title="Remove this hotel?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" and its rooms will be deactivated and hidden from the site. You can re-activate it later from this list.`
            : undefined
        }
      />
    </>
  );
};

const ImageManager = ({ editing, selectedImages, imagePreviews, fileInputRef, onSelect, onRemoveSelected, onAddImages, onRemoveExisting, onMakePrimary, uploading }) => {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-lg font-medium text-[#F5F1E8]">Property images</p>
          <p className="mt-1 text-xs text-[#77736B]">{editing ? "Manage existing images or upload new ones." : "Upload property images after creating the hotel."}</p>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2.5 text-xs font-semibold text-[#E7C977] transition-colors hover:bg-[#D4AF37]/20">
          <Icon name="camera" size={15} />
          {editing ? "Add images" : "Choose images"}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={editing ? onAddImages : onSelect} disabled={uploading} />
        </label>
      </div>

      {selectedImages.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C9AB4B]">New images</p>
            <span className="text-xs text-[#77736B]">{selectedImages.length} selected</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {imagePreviews.map((preview, index) => (
              <motion.div key={preview} variants={imageVariants} initial="hidden" animate="visible" className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-white/[0.03]">
                <img src={preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

                <button type="button" onClick={() => onRemoveSelected(index)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white backdrop-blur transition-colors hover:bg-red-500" aria-label="Remove selected image">
                  <Icon name="close" size={12} />
                </button>

                {index === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-[#D4AF37] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-black">
                    Primary
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C9AB4B]">Current images</p>
            <span className="text-xs text-[#77736B]">{editing.images?.length || 0} images</span>
          </div>

          {(editing.images || []).length === 0 ? (
            <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[#D4AF37]/25 bg-white/[0.02]">
              <div className="text-center">
                <Icon name="camera" size={22} className="mx-auto text-[#E7C977]" />
                <p className="mt-2 text-xs text-[#77736B]">No images uploaded yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {editing.images.map((img) => (
                <motion.div key={img._id} layout className={`group relative aspect-[4/3] overflow-hidden rounded-xl border bg-white/[0.03] ${img.isPrimary ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/60" : "border-[#D4AF37]/20"}`}>
                  <img src={img.url} alt={editing.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/85 to-transparent p-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                    {img.isPrimary ? (
                      <span className="rounded-full bg-[#D4AF37] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-black">Primary</span>
                    ) : (
                      <button type="button" onClick={() => onMakePrimary(img._id)} className="rounded-full border border-[#D4AF37]/50 bg-black/70 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#F1D477] transition-colors hover:bg-[#D4AF37] hover:text-black" aria-label="Make primary image">
                        Make primary
                      </button>
                    )}

                    <button type="button" onClick={() => onRemoveExisting(img._id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-400" aria-label="Remove image">
                      <Icon name="close" size={12} />
                    </button>
                  </div>

                  {img.isPrimary && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#D4AF37] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-black shadow-lg group-hover:hidden">
                      Primary
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {!editing && selectedImages.length === 0 && (
        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D4AF37]/30 bg-white/[0.02] text-center transition-colors hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977]">
            <Icon name="camera" size={20} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#F5F1E8]">Add property photos</p>
          <p className="mt-1 text-xs text-[#77736B]">JPG, PNG, WEBP or AVIF</p>
        </label>
      )}

      {uploading && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-3 text-xs text-[#E7C977]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#D4AF37]" />
          Uploading property images...
        </div>
      )}
    </div>
  );
};

export default AdminHotels;