import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Icon from "@/components/ui/Icons";
import { ROUTES } from "@/constants/routes";
import { authService, notify } from "@/services";
import { toErrorMessage } from "@/api";
import { fadeInUp, staggerContainer } from "@/theme/animations";

/**
 * Request a password reset. The backend deliberately returns success for every
 * email (anti-enumeration), so the confirmation screen always shows.
 */
const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const onSubmit = useCallback(async ({ email }) => {
    setSubmitting(true);
    setServerError("");
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      const message = toErrorMessage(err, "Something went wrong. Please try again.");
      setServerError(message);
      notify.error(message);
    } finally {
      setSubmitting(false);
    }
  }, []);

  return (
    <>
      <Seo title="Reset password" description="Request a link to reset your AureliaStay password." />

      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible">
        <div className="lux-glass p-8 sm:p-10">
          <motion.div variants={fadeInUp}>
            <span className="lux-eyebrow flex items-center gap-3">
              <span className="h-px w-10 bg-[#D4AF37]/70" aria-hidden="true" />
              Account recovery
            </span>
            <h1 className="mt-4 font-serif text-3xl font-medium text-[#F8F6F0] sm:text-4xl">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-[#A8A8A8]">
              {sent
                ? "Check your inbox for the reset link."
                : "Enter your account email and we'll send you a secure reset link."}
            </p>
          </motion.div>

          {sent ? (
            <motion.div
              variants={fadeInUp}
              className="mt-8 rounded-xl border border-[#D4AF37]/20 bg-white/[0.03] p-6 text-center"
            >
              <Icon name="mail" size={32} className="mx-auto text-[#E7C977]" />
              <p className="mt-3 text-sm text-[#A8A8A8]">
                If an account exists for that email, a password reset link is on its way.
                It expires shortly, so please check your inbox — and spam folder.
              </p>
              <Link
                to={ROUTES.LOGIN}
                className="mt-5 inline-flex font-semibold text-[#E7C977] transition-colors hover:text-[#F1D477]"
              >
                Back to sign in
              </Link>
            </motion.div>
          ) : (
            <form className="mt-8" onSubmit={handleSubmit(onSubmit)} noValidate>
              {serverError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  <Icon name="info" size={16} className="mt-0.5 shrink-0 text-red-400" />
                  <span>{serverError}</span>
                </div>
              )}

              <Input
                tone="dark"
                label="Email"
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                })}
              />

              <Button type="submit" variant="gold" size="lg" className="w-full" loading={submitting} disabled={submitting}>
                Send reset link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[#A8A8A8]">
            Remembered it?{" "}
            <Link to={ROUTES.LOGIN} className="font-semibold text-[#E7C977] transition-colors hover:text-[#F1D477]">
              Back to sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default ForgotPassword;
