import { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import PasswordInput from "@/components/common/PasswordInput";
import EmptyState from "@/components/common/EmptyState";
import Icon from "@/components/ui/Icons";
import { ROUTES } from "@/constants/routes";
import { authService, notify } from "@/services";
import { toErrorMessage } from "@/api";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PASSWORD_RULES = {
  required: "Password is required",
  minLength: { value: 8, message: "Password must be at least 8 characters" },
  pattern: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: "Use an uppercase letter, a lowercase letter and a number",
  },
};

/**
 * Set a new password. The reset token arrives as `?token=...` (the backend
 * builds that link in the reset email). Success returns to the sign-in screen.
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const password = watch("password");

  const onSubmit = useCallback(
    async (data) => {
      if (!token) return;
      setSubmitting(true);
      setServerError("");
      try {
        const res = await authService.resetPassword(token, data.password, data.confirmPassword);
        notify.success(res?.message || "Password reset successfully. Please sign in.");
        navigate(ROUTES.LOGIN, { replace: true });
      } catch (err) {
        const message = toErrorMessage(err, "We couldn't reset your password. The link may have expired.");
        setServerError(message);
        notify.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [token, navigate]
  );

  if (!token) {
    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Seo title="Set new password" description="Reset your AureliaStay password." />
        <EmptyState
          tone="dark"
          icon={<Icon name="info" size={32} className="text-gold-500" />}
          title="Invalid or missing reset link"
          description="This link is incomplete or has expired. Request a new one and try again."
          action={
            <Link to={ROUTES.FORGOT_PASSWORD} className="btn-gold">
              Request a new link
            </Link>
          }
        />
      </motion.div>
    );
  }

  return (
    <>
      <Seo title="Set new password" description="Reset your AureliaStay password." />

      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible">
        <div className="lux-glass p-8 sm:p-10">
          <motion.div variants={fadeInUp}>
            <span className="lux-eyebrow flex items-center gap-3">
              <span className="h-px w-10 bg-[#D4AF37]/70" aria-hidden="true" />
              Account recovery
            </span>
            <h1 className="mt-4 font-serif text-3xl font-medium text-[#F8F6F0] sm:text-4xl">
              Set a new password
            </h1>
            <p className="mt-2 text-sm text-[#A8A8A8]">Choose a strong password you'll remember.</p>
          </motion.div>

          <form className="mt-8" onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <Icon name="info" size={16} className="mt-0.5 shrink-0 text-red-400" />
                <span>{serverError}</span>
              </div>
            )}

            <PasswordInput
              tone="dark"
              label="New password"
              id="reset-password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register("password", PASSWORD_RULES)}
            />

            <PasswordInput
              tone="dark"
              label="Confirm new password"
              id="reset-confirm"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match",
              })}
            />

            <Button type="submit" variant="gold" size="lg" className="w-full" loading={submitting} disabled={submitting}>
              Reset password
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#A8A8A8]">
            <Link to={ROUTES.LOGIN} className="font-semibold text-[#E7C977] transition-colors hover:text-[#F1D477]">
              Back to sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default ResetPassword;
