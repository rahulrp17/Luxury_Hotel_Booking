import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Icon from "@/components/ui/Icons";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, selectProfile, updateProfile, uploadAvatar } from "@/store/slices/userSlice";
import { setUser, selectUser } from "@/store/slices/authSlice";
import { notify } from "@/services";
import { toErrorMessage } from "@/api";
import { formatDate, formatNumber, initials } from "@/utils/formatters";
import { USER_ROLES } from "@/constants/enums";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PHONE_PATTERN = /^[+]?[\d\s\-()]{7,15}$/;
const PINCODE_PATTERN = /^\d{5,6}$/;

const LANGUAGES = ["en", "hi", "fr", "ar", "es", "de"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
  fr: "French",
  ar: "Arabic",
  es: "Spanish",
  de: "German",
};

const ROLE_LABELS = {
  [USER_ROLES.USER]: "Member",
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.HOTEL_MANAGER]: "Hotel Manager",
};

const SectionCard = ({ step, title, children }) => (
  <motion.div
    variants={fadeInUp}
    className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]"
  >
    <h2 className="flex items-center gap-3 font-serif text-xl font-medium text-[#FBF7EA]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 font-serif text-sm font-semibold text-[#F1D477]">
        {step}
      </span>
      {title}
    </h2>
    <div className="mt-5">{children}</div>
  </motion.div>
);

const DetailSection = ({ icon, title, children }) => (
  <motion.div
    variants={fadeInUp}
    className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]"
  >
    <h2 className="flex items-center gap-3 font-serif text-xl font-medium text-[#FBF7EA]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#F1D477]">
        <Icon name={icon} size={16} />
      </span>
      {title}
    </h2>
    <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">{children}</div>
  </motion.div>
);

const DetailItem = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase tracking-widest text-[#77736B]">{label}</p>
    <p className="mt-1 truncate text-sm text-[#F5F1E8]">{value || "—"}</p>
  </div>
);

const ToggleValue = ({ on }) => (
  <span className={`inline-flex items-center gap-1.5 text-sm ${on ? "text-[#E7C977]" : "text-[#B8B2A5]"}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]" : "bg-[#77736B]"}`} />
    {on ? "On" : "Off"}
  </span>
);

/**
 * Member profile. Defaults to a premium read-only view of the saved profile
 * details (no dummy data — empty fields render as "—"). "Edit Profile" swaps
 * to the existing react-hook-form editor; saves persist to the backend and
 * refresh the auth slice + profile slice immediately so the page and navbar
 * re-render with the latest values.
 */
const Profile = () => {
  const dispatch = useAppDispatch();
  const storedUser = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const data = profile || storedUser;

  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Populate the form once profile data is available (incl. refresh after save
  // and when re-entering edit mode).
  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name || "",
      phone: data.phone || "",
      address: {
        street: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        pincode: data.address?.pincode || "",
      },
      preferences: {
        language: data.preferences?.language || "en",
        currency: data.preferences?.currency || "INR",
        notifications: {
          email: data.preferences?.notifications?.email ?? true,
          sms: data.preferences?.notifications?.sms ?? true,
          inApp: data.preferences?.notifications?.inApp ?? true,
        },
      },
    });
  }, [data, reset, editing]);

  const onSubmit = useCallback(
    async (values) => {
      setServerError("");
      try {
        const updated = await dispatch(updateProfile(values)).unwrap();
        dispatch(setUser(updated));
        notify.success("Profile updated successfully.");
        setEditing(false);
      } catch (err) {
        const message = toErrorMessage(err, "We couldn't update your profile.");
        setServerError(message);
        notify.error(message);
      }
    },
    [dispatch]
  );

  const onAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAvatarUploading(true);
      try {
        const updated = await dispatch(uploadAvatar(file)).unwrap();
        dispatch(setUser(updated));
        notify.success("Profile photo updated.");
      } catch (err) {
        notify.errorFrom(err, "We couldn't upload that photo.");
      } finally {
        setAvatarUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [dispatch]
  );

  if (!data) {
    return (
      <div className="lux-canvas">
        <div className="lux-inner">
          <div className="mx-auto max-w-3xl space-y-4">
            <Seo title="Profile" description="Your AureliaStay profile, details and preferences." />
            <div className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <SkeletonLoader.Circle className="h-16 w-16" />
                <div className="min-w-0 flex-1">
                  <SkeletonLoader.Block className="h-5 w-40" />
                  <SkeletonLoader.Block className="mt-2 h-3 w-56" />
                </div>
                <SkeletonLoader.Button className="hidden w-28 sm:block" />
              </div>
              <SkeletonLoader.Form fields={4} columns={2} className="mt-6" />
            </div>
            <div className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl">
              <SkeletonLoader.Form fields={3} columns={2} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[data.role] || data.role || "Member";
  const languageName = LANGUAGE_NAMES[data.preferences?.language] || (data.preferences?.language || "en").toUpperCase();
  const prefNotifs = data.preferences?.notifications || {};
  const loyaltyPoints = Number(data.loyaltyPoints) || 0;

  return (
    <div className="lux-canvas">
      <div className="lux-inner">
        <Seo title="Profile" description="Your AureliaStay profile, details and preferences." />

        {editing ? (
          <motion.form
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mx-auto max-w-3xl space-y-5"
          >
            {/* Avatar */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center gap-5 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)] sm:flex-row"
            >
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="group relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/50 bg-white/[0.04] font-serif text-2xl font-semibold text-[#E7C977] shadow-[0_0_30px_-6px_rgba(212,175,55,0.5)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(212,175,55,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 sm:h-[88px] sm:w-[88px]"
                aria-label="Change profile photo"
              >
                {data.avatar?.url ? (
                  <img src={data.avatar.url} alt={data.name} className="h-full w-full object-cover" />
                ) : (
                  initials(data.name)
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[#F1D477] opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <Icon name={avatarUploading ? "info" : "camera"} size={20} />
                </span>
              </button>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="truncate font-serif text-xl font-medium text-[#FBF7EA]">{data.name}</p>
                <p className="mt-0.5 truncate text-sm text-[#B8B2A5]">{data.email}</p>
                <p className="mt-1.5 text-xs text-[#77736B]">
                  {avatarUploading ? "Uploading…" : "Click the photo to change it."}
                </p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </motion.div>

            {serverError && (
              <motion.div
                variants={fadeInUp}
                className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200"
              >
                <Icon name="info" size={16} className="mt-0.5 shrink-0 text-red-300" />
                <span>{serverError}</span>
              </motion.div>
            )}

            <SectionCard step={1} title="Personal details">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Input
                  tone="dark"
                  label="Full name"
                  id="profile-name"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register("name", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                    maxLength: { value: 50, message: "Name must be under 50 characters" },
                  })}
                />
                <Input tone="dark" label="Email" id="profile-email" type="email" value={data.email || ""} disabled />
                <Input
                  tone="dark"
                  label="Phone"
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  error={errors.phone?.message}
                  {...register("phone", {
                    pattern: { value: PHONE_PATTERN, message: "Enter a valid phone number" },
                  })}
                />
              </div>
            </SectionCard>

            <SectionCard step={2} title="Address">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Input tone="dark" label="Street / area" id="profile-street" autoComplete="address-line1" {...register("address.street")} />
                <Input tone="dark" label="City" id="profile-city" autoComplete="address-level2" {...register("address.city")} />
                <Input tone="dark" label="State" id="profile-state" autoComplete="address-level1" {...register("address.state")} />
                <Input
                  tone="dark"
                  label="Pincode"
                  id="profile-pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  error={errors.address?.pincode?.message}
                  {...register("address.pincode", { pattern: { value: PINCODE_PATTERN, message: "Enter a valid 5–6 digit pincode" } })}
                />
              </div>
            </SectionCard>

            <SectionCard step={3} title="Preferences">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <div className="mb-4">
                  <label htmlFor="profile-language" className="lux-label-gold">Language</label>
                  <select id="profile-language" className="lux-input-solid" {...register("preferences.language")}>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} className="bg-[#0E0E0E]">{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="profile-currency" className="lux-label-gold">Currency</label>
                  <select id="profile-currency" className="lux-input-solid" {...register("preferences.currency")}>
                    {CURRENCIES.map((code) => (
                      <option key={code} value={code} className="bg-[#0E0E0E]">{code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-[#D4AF37]/15 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-[#F5F1E8]">Notifications</p>
                {[
                  { key: "email", label: "Email updates" },
                  { key: "sms", label: "SMS alerts" },
                  { key: "inApp", label: "In-app notifications" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between gap-3 text-sm text-[#B8B2A5]">
                    {item.label}
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#D4AF37]"
                      {...register(`preferences.notifications.${item.key}`)}
                    />
                  </label>
                ))}
              </div>
            </SectionCard>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="lg" onClick={() => setEditing(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="lg" loading={isSubmitting} disabled={isSubmitting}>
                Save changes
              </Button>
            </motion.div>
          </motion.form>
        ) : (
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl space-y-5"
          >
            {/* Profile hero */}
            <motion.div
              variants={fadeInUp}
              className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)] sm:p-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(212,175,55,0.14),transparent_70%)]"
              />
              <div className="relative flex flex-col items-center gap-6 sm:flex-row">
                <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/50 bg-white/[0.04] font-serif text-3xl font-semibold text-[#E7C977] shadow-[0_0_30px_-6px_rgba(212,175,55,0.5)] sm:h-28 sm:w-28">
                  {data.avatar?.url ? (
                    <img src={data.avatar.url} alt={data.name} className="h-full w-full object-cover" />
                  ) : (
                    initials(data.name)
                  )}
                </span>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="font-serif text-2xl font-medium leading-tight text-[#FBF7EA] sm:text-3xl">{data.name}</h1>
                    <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#F1D477]">
                      {roleLabel}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#B8B2A5]">{data.email}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
                    {data.createdAt && (
                      <span className="text-xs text-[#77736B]">
                        Member since <span className="text-[#E7C977]">{formatDate(data.createdAt)}</span>
                      </span>
                    )}
                    {loyaltyPoints > 0 && (
                      <span className="text-xs text-[#77736B]">
                        <span className="font-semibold text-[#E7C977]">{formatNumber(loyaltyPoints)}</span> loyalty points
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                  <Button type="button" variant="gold" size="lg" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </motion.div>

            <DetailSection icon="user" title="Personal details">
              <DetailItem label="Full name" value={data.name} />
              <DetailItem label="Email" value={data.email} />
              <DetailItem label="Phone" value={data.phone} />
            </DetailSection>

            <DetailSection icon="mapPin" title="Address">
              <DetailItem label="Street / area" value={data.address?.street} />
              <DetailItem label="City" value={data.address?.city} />
              <DetailItem label="State" value={data.address?.state} />
              <DetailItem label="Pincode" value={data.address?.pincode} />
              <DetailItem label="Country" value={data.address?.country} />
            </DetailSection>

            <DetailSection icon="sparkles" title="Preferences">
              <DetailItem label="Language" value={languageName} />
              <DetailItem label="Currency" value={data.preferences?.currency || "INR"} />
            </DetailSection>

            <DetailSection icon="bell" title="Notification preferences">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-[#77736B]">Email updates</p>
                <ToggleValue on={prefNotifs.email ?? true} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-[#77736B]">SMS alerts</p>
                <ToggleValue on={prefNotifs.sms ?? true} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-[#77736B]">In-app notifications</p>
                <ToggleValue on={prefNotifs.inApp ?? true} />
              </div>
            </DetailSection>

            <DetailSection icon="shield" title="Account">
              <DetailItem label="Membership" value={roleLabel} />
              <DetailItem label="Member since" value={formatDate(data.createdAt)} />
              <DetailItem label="Loyalty points" value={formatNumber(loyaltyPoints)} />
              <DetailItem label="Email verified" value={data.isEmailVerified ? "Yes" : "Pending"} />
            </DetailSection>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;