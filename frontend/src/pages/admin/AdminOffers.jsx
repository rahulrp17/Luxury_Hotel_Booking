import { useCallback, useState } from "react";
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

const PAGE_SIZE = 8;

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
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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
    mutationFn: (payload) =>
      editing ? offerService.adminUpdate(editing._id, payload) : offerService.adminCreate(payload),
    onSuccess: () => {
      notify.success(editing ? "Offer updated." : "Offer created.");
      setModalOpen(false);
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "We couldn't save this offer."),
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_FORM);
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
      maxDiscount: offer.maxDiscount ?? "",
      minBookingAmount: offer.minBookingAmount ?? 0,
      startDate: toDateInput(offer.startDate),
      endDate: toDateInput(offer.endDate),
      usageLimit: offer.usageLimit ?? "",
      perUserLimit: offer.perUserLimit ?? 1,
      isActive: offer.isActive,
    });
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
    ["maxDiscount", "usageLimit"].forEach((key) => {
      if (payload[key] === "" || payload[key] === null || Number.isNaN(payload[key])) delete payload[key];
    });
    saveMutation.mutate(payload);
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
                <div className="p-5"><SkeletonLoader.Card tone="dark" /></div>
              ) : offers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="font-serif text-xl text-[#F5F1E8]">No offers yet</p>
                  <p className="mt-1 text-sm text-[#B8B2A5]">Create your first promotion to reward guests.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15 bg-white/[0.02]">
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
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit offer" : "New offer"}
        tone="glass"
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
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
        </form>
      </Modal>
    </>
  );
};

export default AdminOffers;