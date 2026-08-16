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
import { initials } from "@/utils/formatters";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PHONE_PATTERN = /^[+]?[\d\s\-()]{7,15}$/;
const PINCODE_PATTERN = /^\d{5,6}$/;

const LANGUAGES = ["en", "hi", "fr", "ar", "es", "de"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

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

/**
 * Edit personal details, address and notification preferences, plus avatar
 * upload. Keeps the auth slice's cached user in sync via `setUser` so the
 * navbar/profile chips reflect changes immediately.
 */
const Profile = () => {
  const dispatch = useAppDispatch();
  const storedUser = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const data = profile || storedUser;

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

  // Populate the form once profile data is available (incl. refresh after save).
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
  }, [data, reset]);

  const onSubmit = useCallback(
    async (values) => {
      setServerError("");
      try {
        const updated = await dispatch(updateProfile(values)).unwrap();
        dispatch(setUser(updated));
        notify.success("Profile updated successfully.");
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
            <Seo title="Profile" description="Update your AureliaStay profile details and preferences." />
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

  return (
    <div className="lux-canvas">
      <div className="lux-inner">
        <Seo title="Profile" description="Update your AureliaStay profile details and preferences." />

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

          <motion.div variants={fadeInUp} className="flex justify-end">
            <Button type="submit" variant="gold" size="lg" loading={isSubmitting} disabled={isSubmitting}>
              Save changes
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default Profile;