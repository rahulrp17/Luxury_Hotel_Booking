import { useCallback, useRef, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { roomService, hotelService } from "@/services";
import { notify } from "@/services";
import useOptimisticDelete from "@/hooks/useOptimisticDelete";
import { formatCurrency } from "@/utils/formatters";
import { ROOM_TYPES } from "@/constants/enums";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PAGE_SIZE = 8;
const MAX_ROOM_IMAGES = 8;

const EMPTY_FORM = {
  hotel: "",
  name: "",
  type: ROOM_TYPES.SUITE,
  description: "",
  maxOccupancy: { adults: 2, children: 0 },
  size: "",
  floor: "",
  bedConfiguration: "",
  view: "",
  basePricePerNight: 0,
  weekendPremium: 0,
  totalUnits: 1,
  amenities: "",
  isFeatured: false,
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

const AdminRooms = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [page, setPage] = useState(1);
  const [hotelFilter, setHotelFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const hotelsQuery = useQuery({
    queryKey: ["admin", "hotels", "options"],
    queryFn: () => hotelService.getHotels({ page: 1, limit: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const hotels = hotelsQuery.data?.data ?? [];

  const query = useQuery({
    queryKey: ["admin", "rooms", page, hotelFilter],
    queryFn: () => roomService.getRooms({ page, limit: PAGE_SIZE, hotelId: hotelFilter || undefined }),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData
  });

  const rooms = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "rooms"] });
  }, [queryClient]);

  const selectHotel = (e) => {
    setHotelFilter(e.target.value);
    setPage(1);
  };

  const revokePreviewUrls = (urls) => urls.forEach((url) => URL.revokeObjectURL(url));

  const clearSelectedFiles = () => {
    setPreviewUrls((prev) => {
      revokePreviewUrls(prev);
      return [];
    });
    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const selected = files.slice(0, MAX_ROOM_IMAGES);

    if (files.length > MAX_ROOM_IMAGES) {
      notify.warning(`You can select up to ${MAX_ROOM_IMAGES} images at once. Only the first ${MAX_ROOM_IMAGES} will be kept.`);
    }

    setPreviewUrls((prev) => {
      revokePreviewUrls(prev);
      return selected.map((file) => URL.createObjectURL(file));
    });
    setSelectedFiles(selected);
  };

  const removeSelectedPreview = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editing) {
        const response = await roomService.adminUpdate(editing._id, payload);
        return { room: response?.data ?? response, created: false };
      }

      const response = await roomService.adminCreate(payload);
      return { room: response?.data ?? response, created: true };
    },
    onSuccess: async ({ room, created }) => {
      if (created && selectedFiles.length > 0) {
        try {
          const uploadedResponse = await roomService.adminAddImages(room._id, selectedFiles);
          const uploadedRoom = uploadedResponse?.data ?? uploadedResponse;

          notify.success("Room created and images uploaded successfully.");
          setEditing(uploadedRoom);
        } catch (error) {
          notify.errorFrom(error, "Room was created, but image upload failed.");
        }
      } else {
        notify.success(created ? "Room created." : "Room updated.");
      }

      clearSelectedFiles();
      setModalOpen(false);
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "We couldn't save this room."),
  });

  const deleteMutation = useOptimisticDelete({
    deleteFn: (id) => roomService.adminDelete(id),
    keys: [
      // Admin list shows only active rooms, so a soft-deleted room disappears.
      { key: ["admin", "rooms"], mode: "remove" },
      { key: ["rooms"], mode: "remove" },
      { key: ["room"], mode: "remove" },
      { key: ["featured-rooms"], mode: "remove" },
    ],
    successMessage: "Room removed.",
    errorMessage: "We couldn't remove this room.",
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, isFeatured }) => roomService.adminUpdate(id, { isFeatured }),
    onSuccess: () => {
      notify.success("Featured status updated.");
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't update featured status."),
  });

  const addImagesMutation = useMutation({
    mutationFn: ({ id, files }) => roomService.adminAddImages(id, files).then((res) => res.data),
    onSuccess: (room) => {
      notify.success("Images uploaded successfully.");
      setEditing(room);
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't upload images."),
  });

  const removeImageMutation = useMutation({
    mutationFn: ({ id, imageId }) => roomService.adminRemoveImage(id, imageId).then((res) => res.data),
    onSuccess: (room) => {
      notify.success("Image removed.");
      setEditing(room);
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't remove image."),
  });

  const openCreate = () => {
    setEditing(null);
    clearSelectedFiles();
    reset(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    clearSelectedFiles();

    reset({
      hotel: room.hotel?._id || room.hotel,
      name: room.name || "",
      type: room.type || ROOM_TYPES.SUITE,
      description: room.description || "",
      maxOccupancy: {
        adults: room.maxOccupancy?.adults ?? 2,
        children: room.maxOccupancy?.children ?? 0,
      },
      size: room.size ?? "",
      floor: room.floor ?? "",
      bedConfiguration: room.bedConfiguration || "",
      view: room.view || "",
      basePricePerNight: room.basePricePerNight ?? 0,
      weekendPremium: room.weekendPremium ?? 0,
      totalUnits: room.totalUnits ?? 1,
      amenities: (room.amenities || []).join(", "),
      isFeatured: !!room.isFeatured,
    });

    setModalOpen(true);
  };

  const onSubmit = (values) => {
    const payload = { ...values };

    payload.amenities = (values.amenities || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    ["size", "floor"].forEach((key) => {
      if (!Number.isFinite(payload[key])) {
        delete payload[key];
      }
    });

    if (editing) {
      delete payload.hotel;
    }

    saveMutation.mutate(payload);
  };

  const onAddImages = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length && editing) {
      const selected = files.slice(0, MAX_ROOM_IMAGES);

      if (files.length > MAX_ROOM_IMAGES) {
        notify.warning(`You can upload up to ${MAX_ROOM_IMAGES} images at once. Only the first ${MAX_ROOM_IMAGES} will be uploaded.`);
      }

      addImagesMutation.mutate({ id: editing._id, files: selected });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeModal = () => {
    if (saveMutation.isPending || addImagesMutation.isPending || removeImageMutation.isPending) {
      return;
    }

    setModalOpen(false);
    setEditing(null);
    clearSelectedFiles();
    reset(EMPTY_FORM);
  };

  const loading = query.isLoading && rooms.length === 0;

  return (
    <>
      <Seo title="Manage rooms" description="Manage AureliaStay rooms." />

      <div className="lux-canvas">
        <div className="lux-inner">
          <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="mx-auto max-w-7xl">
            <motion.div variants={fadeInUp} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Inventory</p>
                <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">Rooms</h1>
                <p className="mt-1 text-sm text-[#B8B2A5]">Manage premium rooms, pricing, availability and images.</p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <select value={hotelFilter} onChange={selectHotel} className="lux-input-solid mb-0 w-full sm:w-64" aria-label="Filter by hotel">
                  <option value="">All hotels</option>
                  {hotels.map((hotel) => (
                    <option key={hotel._id} value={hotel._id} className="bg-[#0E0E0E]">{hotel.name}</option>
                  ))}
                </select>

                <Button variant="gold" onClick={openCreate}>
                  <Icon name="star" size={16} /> Add New Room
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/15 px-5 py-4">
                <div>
                  <p className="font-serif text-lg font-medium text-[#FBF7EA]">Room inventory</p>
                  <p className="text-xs text-[#77736B]">All active rooms across your properties</p>
                </div>
                <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1.5 text-xs text-[#E7C977]">{pagination?.totalItems ?? rooms.length} rooms</span>
              </div>

              {loading ? (
                <div className="p-5">
                  <SkeletonLoader.Card tone="dark" />
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#E7C977]">
                    <Icon name="grid" size={24} />
                  </div>
                  <p className="font-serif text-xl text-[#F5F1E8]">No rooms found</p>
                  <p className="mt-1 text-sm text-[#B8B2A5]">{hotelFilter ? "This hotel does not have any active rooms." : "Create your first room to get started."}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15 bg-white/[0.02]">
                        <th className="lux-table-th pl-4">Room</th>
                        <th className="lux-table-th">Hotel</th>
                        <th className="lux-table-th">Type</th>
                        <th className="lux-table-th">Guests</th>
                        <th className="lux-table-th">Price</th>
                        <th className="lux-table-th">Units</th>
                        <th className="lux-table-th text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.04]">
                      {rooms.map((room, index) => (
                        <motion.tr key={room._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="transition-colors hover:bg-white/[0.03]">
                          <td className="lux-table-td pl-4">
                            <div className="flex items-center gap-3">
                              {room.primaryImage?.url ? (
                                <img src={room.primaryImage.url} alt={room.name} className="h-12 w-16 shrink-0 rounded-xl border border-[#D4AF37]/15 object-cover" />
                              ) : (
                                <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-white/[0.03] text-[#E7C977]">
                                  <Icon name="grid" size={18} />
                                </span>
                              )}

                              <div className="min-w-0">
                                <p className="truncate font-serif font-medium text-[#F5F1E8]">{room.name}</p>
                                {room.isFeatured && <span className="mt-1 inline-flex rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#E7C977]">Featured</span>}
                              </div>
                            </div>
                          </td>

                          <td className="lux-table-td-sub">{room.hotel?.name || "—"}</td>

                          <td className="lux-table-td">
                            <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-xs font-medium capitalize text-[#E7C977]">{String(room.type || "").replace(/_/g, " ").toLowerCase()}</span>
                          </td>

                          <td className="lux-table-td-sub">{(room.maxOccupancy?.adults || 0) + (room.maxOccupancy?.children || 0)} guests</td>

                          <td className="lux-table-td font-serif font-medium text-[#F1D477]">{formatCurrency(room.basePricePerNight)}</td>

                          <td className="lux-table-td-sub">{room.totalUnits}</td>

                          <td className="lux-table-td">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => toggleFeatured.mutate({ id: room._id, isFeatured: !room.isFeatured })} className="lux-icon-btn" aria-label={room.isFeatured ? "Unfeature" : "Feature"}>
                                <Icon name="star" size={15} />
                              </button>

                              <button type="button" onClick={() => openEdit(room)} className="lux-icon-btn" aria-label={`Edit ${room.name}`}>
                                <Icon name="pencil" size={15} />
                              </button>

                              <button type="button" onClick={() => setDeleteTarget(room)} disabled={deleteMutation.isPending} className="lux-icon-btn disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Remove ${room.name}`}>
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit room" : "Create new room"} tone="glass" size="lg" footer={
        <>
          <Button type="button" variant="ghost" onClick={closeModal} disabled={saveMutation.isPending}>Cancel</Button>
          <Button type="submit" form="room-form" variant="gold" loading={saveMutation.isPending}>{editing ? "Save changes" : "Create room"}</Button>
        </>
      }>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <form id="room-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-6 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977]">
                  <Icon name="grid" size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#F5F1E8]">Room information</h3>
                  <p className="text-xs text-[#77736B]">Define the room and its guest capacity.</p>
                </div>
              </div>

              <div className="grid gap-x-4 sm:grid-cols-2">
                <div className="mb-4 sm:col-span-2">
                  <label htmlFor="room-hotel" className="lux-label-gold">Hotel</label>
                  <select id="room-hotel" className="lux-input-solid" disabled={!!editing} {...register("hotel", { required: "Hotel is required" })}>
                    <option value="">Select a hotel…</option>
                    {hotels.map((hotel) => <option key={hotel._id} value={hotel._id} className="bg-[#0E0E0E]">{hotel.name}</option>)}
                  </select>
                  {errors.hotel?.message && <p className="mt-1 text-xs text-red-300">{errors.hotel.message}</p>}
                </div>

                <Input tone="dark" label="Name" id="room-name" placeholder="Deluxe Sea View" error={errors.name?.message} {...register("name", { required: "Name is required", maxLength: { value: 100, message: "Max 100 characters" } })} />

                <div className="mb-4">
                  <label htmlFor="room-type" className="lux-label-gold">Type</label>
                  <select id="room-type" className="lux-input-solid" {...register("type")}>
                    {Object.values(ROOM_TYPES).map((type) => <option key={type} value={type} className="bg-[#0E0E0E]">{type.replace(/_/g, " ").toLowerCase()}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Input tone="dark" label="Description" id="room-description" placeholder="What makes this room special?" error={errors.description?.message} {...register("description", { required: "Description is required" })} />
                </div>

                <Input tone="dark" label="Adults" id="room-adults" type="number" min="1" max="10" error={errors.maxOccupancy?.adults?.message} {...register("maxOccupancy.adults", { required: "Adults required", valueAsNumber: true, validate: (value) => (value >= 1 && value <= 10) || "Adults must be 1–10" })} />

                <Input tone="dark" label="Children" id="room-children" type="number" min="0" max="6" error={errors.maxOccupancy?.children?.message} {...register("maxOccupancy.children", { valueAsNumber: true, validate: (value) => (value >= 0 && value <= 6) || "Children must be 0–6" })} />

                <Input tone="dark" label="Size (sq ft, optional)" id="room-size" type="number" min="0" {...register("size", { valueAsNumber: true })} />

                <Input tone="dark" label="Floor (optional)" id="room-floor" type="number" {...register("floor", { valueAsNumber: true })} />

                <Input tone="dark" label="Bed configuration" id="room-bed" placeholder="King + day bed" {...register("bedConfiguration")} />

                <Input tone="dark" label="View" id="room-view" placeholder="Sea View, City View…" {...register("view")} />

                <Input tone="dark" label="Base price / night (₹)" id="room-price" type="number" min="0" error={errors.basePricePerNight?.message} {...register("basePricePerNight", { required: "Price is required", valueAsNumber: true, validate: (value) => value >= 0 || "Price must be positive" })} />

                <Input tone="dark" label="Weekend premium (%)" id="room-weekend" type="number" min="0" max="100" {...register("weekendPremium", { valueAsNumber: true })} />

                <Input tone="dark" label="Total units" id="room-units" type="number" min="1" error={errors.totalUnits?.message} {...register("totalUnits", { required: "Units required", valueAsNumber: true, validate: (value) => value >= 1 || "At least 1 unit" })} />

                <div className="sm:col-span-2">
                  <Input tone="dark" label="Amenities (comma separated)" id="room-amenities" placeholder="WiFi, Air conditioning, Mini bar" {...register("amenities")} />
                </div>
              </div>

              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-[#B8B2A5]">
                <input type="checkbox" className="h-4 w-4 accent-[#D4AF37]" {...register("isFeatured")} />
                Mark as featured room
              </label>
            </div>

            {!editing && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#F5F1E8]">Room images</h3>
                    <p className="text-xs text-[#77736B]">Select multiple images. They will upload automatically after room creation.</p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-xs font-semibold text-[#E7C977] transition hover:bg-[#D4AF37]/20">
                    <Icon name="camera" size={15} />
                    Select images
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelection} key="create-images" />
                  </label>
                </div>

                {previewUrls.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D4AF37]/25 bg-white/[0.02] p-8 text-center">
                    <Icon name="camera" size={28} className="mx-auto text-[#E7C977]" />
                    <p className="mt-2 text-sm text-[#B8B2A5]">No images selected</p>
                    <p className="mt-1 text-xs text-[#77736B]">PNG, JPG or WEBP</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    <AnimatePresence>
                      {previewUrls.map((url, index) => (
                        <motion.div key={url} variants={imageVariants} initial="hidden" animate="visible" exit="exit" className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-white/[0.03]">
                          <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                          <button type="button" onClick={() => removeSelectedPreview(index)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500" aria-label="Remove selected image">
                            <Icon name="close" size={13} />
                          </button>
                          <span className="absolute bottom-2 left-2 rounded-full bg-black/80 px-2 py-1 text-[10px] font-medium text-[#E7C977]">{index + 1}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </form>

          {editing && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#F5F1E8]">Room gallery</h3>
                  <p className="text-xs text-[#77736B]">Existing images are preserved. Add or remove images anytime.</p>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-xs font-semibold text-[#E7C977] transition hover:bg-[#D4AF37]/20">
                  <Icon name="camera" size={15} />
                  Upload new images
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onAddImages} key={editing ? "edit-images" : "create-images"} />
                </label>
              </div>

              {(editing.images || []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D4AF37]/25 bg-white/[0.02] p-8 text-center">
                  <Icon name="camera" size={28} className="mx-auto text-[#E7C977]" />
                  <p className="mt-2 text-sm text-[#B8B2A5]">No room images</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  <AnimatePresence>
                    {(editing.images || []).map((image, index) => (
                      <motion.div key={image._id} variants={imageVariants} initial="hidden" animate="visible" exit="exit" className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-white/[0.03]">
                        <img src={image.url} alt={`${editing.name} ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                        {image.isPrimary && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-[#D4AF37] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black">Primary</span>
                        )}

                        <button type="button" onClick={() => removeImageMutation.mutate({ id: editing._id, imageId: image.publicId })} disabled={removeImageMutation.isPending} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Remove image">
                          <Icon name="close" size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {addImagesMutation.isPending && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-3 text-xs text-[#E7C977]">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                  Uploading images...
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
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
        title="Remove this room?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from your room inventory and hidden from the site immediately.`
            : undefined
        }
      />
    </>
  );
};

export default AdminRooms;