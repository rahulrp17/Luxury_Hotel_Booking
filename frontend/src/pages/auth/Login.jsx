import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import Icon from "@/components/ui/Icons";
import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, selectAuthStatus, selectIsAuthenticated } from "@/store/slices/authSlice";
import { authService, notify } from "@/services";
import { toErrorMessage } from "@/api";
import { fadeInUp, staggerContainer } from "@/theme/animations";

/**
 * Sign-in. Dispatches the auth `login` thunk, then returns the user to the
 * route they tried to visit (set by ProtectedRoute) or home. Already signed in
 * users are bounced straight past this screen.
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthStatus);
  const loading = status === "loading";
  const [serverError, setServerError] = useState("");
  const [emailForResend, setEmailForResend] = useState("");
  const [resendState, setResendState] = useState("idle"); // idle | sending | done

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const redirectAfterAuth = useCallback(() => {
    navigate(location.state?.from?.pathname || ROUTES.HOME, { replace: true });
  }, [location.state, navigate]);

  // Bounce authenticated visitors (e.g. direct navigation to /auth/login).
  useEffect(() => {
    if (isAuthenticated) redirectAfterAuth();
  }, [isAuthenticated, redirectAfterAuth]);

  const onSubmit = useCallback(
    async (data) => {
      setServerError("");
      setResendState("idle");
      try {
        await dispatch(login({ email: data.email.trim(), password: data.password })).unwrap();
        notify.success("Welcome back — your luxury stay awaits.");
        redirectAfterAuth();
      } catch (err) {
        const message = typeof err === "string" ? err : "Sign-in failed. Please try again.";
        setServerError(message);
        setEmailForResend(data.email.trim());
        notify.error(message);
      }
    },
    [dispatch, redirectAfterAuth]
  );

  // The backend rejects unverified accounts with a 403 and this exact message.
  const needsVerification = /verify your email/i.test(serverError);

  const handleResend = useCallback(async () => {
    if (!emailForResend) return;
    setResendState("sending");
    try {
      await authService.resendVerification(emailForResend);
      setResendState("done");
      notify.success("A new verification email is on its way. Check your inbox.");
    } catch (err) {
      setResendState("idle");
      notify.error(toErrorMessage(err, "Could not resend the verification email. Please try again."));
    }
  }, [emailForResend]);

  return (
    <>
      <Seo title="Sign in" description="Sign in to AureliaStay to manage your bookings and enjoy members-only rates." />

      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible">
        <div className="lux-glass p-8 sm:p-10">
          <motion.div variants={fadeInUp}>
            <span className="lux-eyebrow flex items-center gap-3">
              <span className="h-px w-10 bg-[#D4AF37]/70" aria-hidden="true" />
              Welcome back
            </span>
            <h1 className="mt-4 font-serif text-3xl font-medium text-[#F8F6F0] sm:text-4xl">
              Sign in to <span className="text-[#E7C977]">AureliaStay</span>
            </h1>
            <p className="mt-2 text-sm text-[#A8A8A8]">Your private portal to luxury stays.</p>
          </motion.div>

          <form className="mt-8" onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <Icon name="info" size={16} className="mt-0.5 shrink-0 text-red-400" />
                <span>{serverError}</span>
              </div>
            )}

            {needsVerification && (
              <div className="mb-4 rounded-xl border border-[#D4AF37]/25 bg-gold-500/[0.06] p-3 text-sm">
                {resendState === "done" ? (
                  <p className="text-[#E7C977]">Verification email sent — check your inbox.</p>
                ) : (
                  <p className="text-[#A8A8A8]">
                    Didn't get the email?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendState === "sending"}
                      className="font-semibold text-[#E7C977] transition-colors hover:text-[#F1D477] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resendState === "sending" ? "Sending…" : "Resend verification email"}
                    </button>
                  </p>
                )}
              </div>
            )}

            <Input
              tone="dark"
              label="Email"
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
              })}
            />

            <PasswordInput
              tone="dark"
              label="Password"
              id="login-password"
              autoComplete="current-password"
              placeholder="Your password"
              error={errors.password?.message}
              {...register("password", { required: "Password is required" })}
            />

            <div className="mb-5 text-right text-sm">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="font-medium text-[#C9AB4B] transition-colors hover:text-[#E7C977]"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full" loading={loading} disabled={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-7 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-[#D4AF37]/20" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#77736B]">New here?</span>
            <span className="h-px flex-1 bg-[#D4AF37]/20" />
          </div>

          <p className="mt-5 text-center text-sm text-[#A8A8A8]">
            <Link
              to={ROUTES.REGISTER}
              className="font-semibold text-[#E7C977] transition-colors hover:text-[#F1D477]"
            >
              Create an account
            </Link>
            <span className="mx-1.5 text-[#5A5A5A]" aria-hidden="true">·</span>
            <span>It takes less than a minute</span>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default Login;
