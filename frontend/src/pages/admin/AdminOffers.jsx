import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Icon from "@/components/ui/Icons";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { offerService } from "@/services";
import { notify } from "@/services";
import { OFFER_TYPES } from "@/constants/enums";
import { formatDate } from "@/utils/formatters";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { FALLBACK_ASSETS } from "@/constants/assets";

const PAGE_SIZE = 8;

const BANNER_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const BANNER_MAX_SIZE = 5 * 1024 * 1024; // 5MB — matches backend multer limit

/**
 * Offer banner thumbnail for the table's Image column. Falls back to a local
 * asset when the URL is missing or fails to load. Clicking opens the preview.
 */
const OfferBannerThumb = ({ banner, title, onClick }) => {
  const [src, setSrc] = useState(banner?.url || "");
  const fallback = FALLBACK_ASSETS.offer;

  useEffect(() => {
    setSrc(banner?.url || "");
  }, [banner?.url]);

  if (!src) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Preview ${title} banner`}
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
      aria-label={`Preview ${title} banner`}
      className="group/thumb relative shrink-0 overflow-hidden rounded-xl border border-[#D4AF37]/15 transition-colors hover:border-[#D4AF37]/45"
    >
      <img
        src={src}
        alt={title}
        onError={() => setSrc(fallback)}
        className="h-12 w-16 object-cover transition-transform duration-500 group-hover/thumb:scale-105"
      />
    </button>
  );
};

/**
 * Full-screen image preview overlay.
 */
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

const EMPTY_FORM = {
  code: "",
  title: "",
  description: "",
  type: OFFER_TYPES.FLAT,
  value: 0,
  maxDiscount: "",
  minBookingAmount: 0,
  startDate: "",
  endDate: "",
  usageLimit: "",
  perUserLimit: 1,
  isActive: true,
};

const OfferValueLabel = ({ value, type }) => {
  if (type === OFFER_TYPES.PERCENTAGE) return `${value}%`;
  if (type === OFFER_TYPES.FREE_NIGHT) return `${value} free night${value > 1 ? "s" : ""}`;
  return `₹${Number(value).toLocaleString("en-IN")}`;
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

/**
 * Offer CRUD + activation. Offers have no delete endpoint, so deactivation is
 * handled via update (isActive toggle) — matching the backend surface.
 */
const AdminOffers = () => {
  const queryClient = useQueryClient();
  const bannerFileInputRef = useRef(null);

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [removeExistingBanner, setRemoveExistingBanner] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);

  /* ======================================================================= */
  /* Banner helpers                                                          */
  /* ======================================================================= */

  const clearBanner = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setSelectedBanner(null);
    setBannerPreview(null);
    setRemoveExistingBanner(false);
    setBannerUploadProgress(null);
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  const onBannerSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Please select a valid image file.");
      return;
    }

    if (file.size > BANNER_MAX_SIZE) {
      notify.error("Banner must be 5MB or smaller.");
      return;
    }

    if (bannerPreview) URL.revokeObjectURL(bannerPreview);

    setSelectedBanner(file);
    setBannerPreview(URL.createObjectURL(file));
    setRemoveExistingBanner(false);
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const type = watch("type");

  const query = useQuery({
    queryKey: ["admin", "offers", page],
    queryFn: () => offerService.adminGetAll({ page, limit: PAGE_SIZE }),
    staleTime: 60 * 1000,
  });
  const offers = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "offers"] });
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: async ({ payload, file, editingId, shouldRemoveBanner }) => {
      let offer;

      if (editingId) {
        offer = (await offerService.adminUpdate(editingId, payload)).data;
      } else {
        offer = (await offerService.adminCreate(payload)).data;
      }

      if (shouldRemoveBanner) {
        const removed = await offerService.adminRemoveBanner(offer._id);
        offer = removed?.data ?? offer;
      }

      if (file && offer?._id) {
        const uploaded = await offerService.adminUploadBanner(
          offer._id,
          file,
          (e) => {
            const percent = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
            setBannerUploadProgress(percent);
          }
        );
        offer = uploaded?.data ?? offer;
      }

      return offer;
    },
    onSuccess: () => {
      notify.success(editing ? "Offer updated." : "Offer created.");
      setModalOpen(false);
      clearBanner();
      invalidate();
    },
    onError: (err) => {
      notify.errorFrom(err, "We couldn't save this offer.");
      setBannerUploadProgress(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_FORM);
    clearBanner();
    setModalOpen(true);
  };

  const openEdit = (offer) => {
    setEditing(offer);
    reset({
      code: offer.code,
      title: offer.title,
      description: offer.description || "",
      type: offer.type,
      value: offer.value,
      maxDiscount: offer.maxDiscountAmount ?? "",
      minBookingAmount: offer.minBookingAmount ?? 0,
      startDate: toDateInput(offer.startDate),
      endDate: toDateInput(offer.endDate),
      usageLimit: offer.usageLimit ?? "",
      perUserLimit: offer.perUserLimit ?? 1,
      isActive: offer.isActive,
    });
    clearBanner();
    setModalOpen(true);
  };

  const toggleActive = (offer) => {
    offerService.adminUpdate(offer._id, { isActive: !offer.isActive })
      .then(() => {
        notify.success(offer.isActive ? "Offer deactivated." : "Offer activated.");
        invalidate();
      })
      .catch((err) => notify.errorFrom(err, "Couldn't update the offer."));
  };

  const onSubmit = (values) => {
    const payload = { ...values };

    // The form uses `maxDiscount` but the backend/model field is
    // `maxDiscountAmount` (used by pricing.service for percentage caps).
    if (payload.maxDiscount !== undefined) {
      payload.maxDiscountAmount = payload.maxDiscount;
    }
    delete payload.maxDiscount;

    ["maxDiscountAmount", "usageLimit"].forEach((key) => {
      if (payload[key] === "" || payload[key] === null || Number.isNaN(payload[key])) delete payload[key];
    });
    saveMutation.mutate({
      payload,
      file: selectedBanner,
      editingId: editing?._id,
      shouldRemoveBanner: removeExistingBanner,
    });
  };

  const loading = query.isLoading && offers.length === 0;

  return (
    <>
      <Seo title="Manage offers" description="Manage AureliaStay offers and promotions." />

      <div className="lux-canvas">
        <div className="lux-inner">
          <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="mx-auto max-w-6xl">
            <motion.div variants={fadeInUp} className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Promotions</p>
                <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">Offers & promotions</h1>
                <p className="mt-1 text-sm text-[#B8B2A5]">Discount codes guests can apply at checkout.</p>
              </div>
              <Button variant="gold" onClick={openCreate}>
                <Icon name="star" size={16} /> New offer
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6 overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
              {loading ? (
                <div className="p-5"><SkeletonLoader.Table columns={8} withMedia rows={5} minWidth={1020} /></div>
              ) : query.isError ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-300">
                    <Icon name="X" size={24} />
                  </div>
                  <p className="mt-4 font-serif text-2xl text-[#F5F1E8]">Unable to load offers</p>
                  <p className="mt-2 text-sm text-[#B8B2A5]">Something went wrong while loading the offers.</p>
                  <button
                    type="button"
                    onClick={() => query.refetch()}
                    className="mt-5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2.5 text-sm font-medium text-[#E7C977] transition hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/20"
                  >
                    Try again
                  </button>
                </div>
              ) : offers.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#E7C977]">
                    <Icon name="star" size={24} />
                  </span>
                  <p className="mt-4 font-serif text-2xl text-[#F5F1E8]">No offers yet</p>
                  <p className="mt-1 text-sm text-[#B8B2A5]">Create your first promotion to reward guests.</p>
                  <Button variant="gold" onClick={openCreate} className="mt-5">
                    <Icon name="star" size={16} />
                    Add first offer
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1020px] text-sm">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15 bg-white/[0.02]">
                        <th className="lux-table-th">Banner</th>
                        <th className="lux-table-th">Code</th>
                        <th className="lux-table-th">Offer</th>
                        <th className="lux-table-th">Discount</th>
                        <th className="lux-table-th">Validity</th>
                        <th className="lux-table-th">Used</th>
                        <th className="lux-table-th">Status</th>
                        <th className="lux-table-th text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {offers.map((offer) => (
                        <tr key={offer._id} className="transition-colors hover:bg-white/[0.03]">
                          <td className="lux-table-td">
                            <OfferBannerThumb
                              banner={offer.banner}
                              title={offer.title}
                              onClick={() =>
                                setPreviewTarget({
                                  src: offer.banner?.url || FALLBACK_ASSETS.offer,
                                  name: `${offer.title} banner`,
                                })
                              }
                            />
                          </td>
                          <td className="lux-table-td">
                            <span className="rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-2.5 py-1 font-mono text-xs font-semibold text-[#F1D477]">{offer.code}</span>
                          </td>
                          <td className="lux-table-td">
                            <p className="font-medium text-[#F5F1E8]">{offer.title}</p>
                            {offer.description && <p className="truncate text-xs text-[#77736B]">{offer.description}</p>}
                          </td>
                          <td className="lux-table-td font-serif font-medium text-[#F1D477]">
                            <OfferValueLabel value={offer.value} type={offer.type} />
                          </td>
                          <td className="lux-table-td-sub">
                            {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                          </td>
                          <td className="lux-table-td-sub">
                            {offer.usedCount ?? 0}{offer.usageLimit ? ` / ${offer.usageLimit}` : ""}
                          </td>
                          <td className="lux-table-td">
                            {offer.isActive ? (
                              <span className="inline-flex rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#F1D477]">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-white/[0.15] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#77736B]">
                                Paused
                              </span>
                            )}
                          </td>
                          <td className="lux-table-td">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => toggleActive(offer)} className="lux-icon-btn" aria-label={offer.isActive ? "Pause" : "Activate"}>
                                <Icon name={offer.isActive ? "close" : "check"} size={15} />
                              </button>
                              <button type="button" onClick={() => openEdit(offer)} className="lux-icon-btn" aria-label={`Edit ${offer.code}`}>
                                <Icon name="pencil" size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
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

      <Modal
        open={modalOpen}
        onClose={() => {
          if (saveMutation.isPending) return;
          setModalOpen(false);
          clearBanner();
        }}
        title={editing ? "Edit offer" : "New offer"}
        tone="glass"
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => { setModalOpen(false); clearBanner(); }} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="offer-form" variant="gold" loading={saveMutation.isPending}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </>
        }
      >
        <form id="offer-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Input
              tone="dark"
              label="Code"
              id="offer-code"
              placeholder="WELCOME10"
              error={errors.code?.message}
              {...register("code", {
                required: "Code is required",
                maxLength: { value: 30, message: "Max 30 characters" },
              })}
            />
            <Input
              tone="dark"
              label="Title"
              id="offer-title"
              placeholder="10% off your stay"
              error={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
            <Input
              tone="dark"
              label="Description (optional)"
              id="offer-description"
              placeholder="Short marketing copy"
              {...register("description")}
            />
            <div className="mb-4">
              <label htmlFor="offer-type" className="lux-label-gold">Type</label>
              <select id="offer-type" className="lux-input-solid" {...register("type")}>
                {Object.values(OFFER_TYPES).map((t) => (
                  <option key={t} value={t} className="bg-[#0E0E0E]">{t}</option>
                ))}
              </select>
            </div>
            <Input
              tone="dark"
              label={type === OFFER_TYPES.PERCENTAGE ? "Value (%)" : type === OFFER_TYPES.FREE_NIGHT ? "Free nights" : "Value (₹)"}
              id="offer-value"
              type="number"
              min="0"
              step="any"
              error={errors.value?.message}
              {...register("value", {
                required: "Value is required",
                valueAsNumber: true,
                validate: (v) => v >= 0 || "Value must be positive",
              })}
            />
            <Input
              tone="dark"
              label="Max discount (₹, optional)"
              id="offer-maxdiscount"
              type="number"
              min="0"
              placeholder="Leave blank for unlimited"
              {...register("maxDiscount", { valueAsNumber: true })}
            />
            <Input
              tone="dark"
              label="Min booking amount (₹)"
              id="offer-min"
              type="number"
              min="0"
              {...register("minBookingAmount", { valueAsNumber: true })}
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="offer-start" className="lux-label-gold">Starts</label>
                <input id="offer-start" type="date" className="lux-input-solid" {...register("startDate", { required: "Start date required" })} />
              </div>
              <div className="flex-1">
                <label htmlFor="offer-end" className="lux-label-gold">Ends</label>
                <input id="offer-end" type="date" className="lux-input-solid" {...register("endDate", { required: "End date required" })} />
              </div>
            </div>
            <Input
              tone="dark"
              label="Usage limit (0 = unlimited)"
              id="offer-usage"
              type="number"
              min="0"
              {...register("usageLimit", { valueAsNumber: true })}
            />
            <Input
              tone="dark"
              label="Per-user limit"
              id="offer-peruser"
              type="number"
              min="1"
              {...register("perUserLimit", { valueAsNumber: true })}
            />
          </div>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-[#B8B2A5]">
            <input type="checkbox" className="h-4 w-4 accent-[#D4AF37]" {...register("isActive")} />
            Active
          </label>

          {/* =========================================================== */}
          {/* BANNER UPLOAD / PREVIEW                                        */}
          {/* =========================================================== */}

          <div className="mt-4 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.03] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-serif text-base font-medium text-[#F5F1E8]">
                Banner image
              </p>

              <p className="text-[11px] text-[#77736B]">
                JPG, PNG, WEBP or AVIF · max 5MB
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Preview */}
              <div className="flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-black/20">
                {bannerPreview || (editing && editing.banner?.url && !removeExistingBanner) ? (
                  <img
                    src={bannerPreview || editing.banner.url}
                    alt="Banner preview"
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
                  {editing && editing.banner?.url && !removeExistingBanner
                    ? "Replace banner"
                    : "Choose image"}
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept={BANNER_ACCEPT}
                    className="hidden"
                    onChange={onBannerSelect}
                    disabled={saveMutation.isPending}
                  />
                </label>

                {selectedBanner && (
                  <p className="truncate text-xs text-[#B8B2A5]">
                    {selectedBanner.name}
                  </p>
                )}

                {selectedBanner && (
                  <button
                    type="button"
                    onClick={() => {
                      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                      setSelectedBanner(null);
                      setBannerPreview(null);
                      if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
                    }}
                    className="self-start text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                  >
                    Remove selection
                  </button>
                )}
              </div>
            </div>

            {editing && editing.banner?.url && !removeExistingBanner && (
              <div className="mt-3 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setRemoveExistingBanner(true);
                    setSelectedBanner(null);
                    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                    setBannerPreview(null);
                    if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
                  }}
                  className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                >
                  Remove current banner
                </button>
              </div>
            )}

            {removeExistingBanner && (
              <p className="mt-3 text-xs text-[#E7C977]">
                The current banner will be removed when you save.
              </p>
            )}

            {/* Upload progress */}
            {saveMutation.isPending && bannerUploadProgress !== null && (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-[#E7C977]">
                  <span>Uploading banner…</span>
                  <span>{bannerUploadProgress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C8A446] to-[#E7C96A] transition-all duration-200"
                    style={{ width: `${bannerUploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Table banner preview */}
      <ImagePreview
        src={previewTarget?.src}
        alt={previewTarget?.name || "Offer banner"}
        onClose={() => setPreviewTarget(null)}
      />
    </>
  );
};

export default AdminOffers;