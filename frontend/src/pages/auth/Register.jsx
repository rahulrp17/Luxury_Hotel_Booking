import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import Icon from "@/components/ui/Icons";
import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register, selectAuthStatus } from "@/store/slices/authSlice";
import { notify } from "@/services";
import { toErrorMessage } from "@/api";
import { fadeInUp, staggerContainer } from "@/theme/animations";

// Mirrors the backend register/reset validators.
const PASSWORD_RULES = {
  required: "Password is required",
  minLength: { value: 8, message: "Password must be at least 8 characters" },
  pattern: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: "Use an uppercase letter, a lowercase letter and a number",
  },
};

const PHONE_PATTERN = /^[+]?[\d\s\-()]{7,15}$/;

/**
 * Account creation. The backend creates the user without a token and sends a
 * verification email — so after a successful register we land on the "check
 * your email" screen (VERIFY_EMAIL without a token) rather than an authed area.
 */
const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const loading = status === "loading";
  const [serverError, setServerError] = useState("");

  // `registerField` is react-hook-form's register — aliased so it cannot shadow
  // the Redux `register` thunk imported from authSlice (a shadow would send the
  // payload object into RHF's stringToPath and blow up with
  // "input.split is not a function").
  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const password = watch("password");

  const onSubmit = useCallback(
    async (data) => {
      setServerError("");
      try {
        await dispatch(
          register({
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone?.trim() || undefined,
            password: data.password,
          })
        ).unwrap();
        notify.success("Account created — verify your email to finish signing up.");
        navigate(ROUTES.VERIFY_EMAIL, { replace: true, state: { email: data.email.trim() } });
      } catch (err) {
        // unwrap() may reject with a string payload or an Error object — always
        // normalize to a plain string before it reaches state, a toast, or JSX
        // (rendering an Error object directly crashes React).
        const message = toErrorMessage(err, "We couldn't create your account. Please try again.");
        setServerError(message);
        notify.error(message);
      }
    },
    [dispatch, navigate]
  );

  return (
    <>
      <Seo title="Create account" description="Join AureliaStay for instant confirmations, members-only rates and no hidden fees." />

<motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible">
        <div className="lux-glass p-6 sm:p-7">
          <motion.div variants={fadeInUp}>
            <span className="lux-eyebrow flex items-center gap-3">
              <span className="h-px w-10 bg-[#D4AF37]/70" aria-hidden="true" />
              Join the club
            </span>
            <h1 className="mt-3 font-serif text-2xl font-medium text-[#F8F6F0] sm:text-[1.65rem]">
              Create your account
            </h1>
            <p className="mt-1 text-[13px] text-[#A8A8A8]">
              Members get instant confirmations and no hidden fees.
            </p>
          </motion.div>

          <form className="mt-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-[13px] text-red-300">
                <Icon name="info" size={15} className="mt-0.5 shrink-0 text-red-400" />
                <span>{serverError}</span>
              </div>
            )}

            <Input
              tone="dark"
              label="Full name"
              id="register-name"
              autoComplete="name"
              placeholder="Your full name"
              className="px-3.5 py-2"
              error={errors.name?.message}
              {...registerField("name", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                maxLength: { value: 50, message: "Name must be under 50 characters" },
              })}
            />

            <Input
              tone="dark"
              label="Email"
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="px-3.5 py-2"
              error={errors.email?.message}
              {...registerField("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
              })}
            />

            <Input
              tone="dark"
              label="Phone (optional)"
              id="register-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              className="px-3.5 py-2"
              error={errors.phone?.message}
              {...registerField("phone", {
                pattern: { value: PHONE_PATTERN, message: "Enter a valid phone number" },
              })}
            />

            <PasswordInput
              tone="dark"
              label="Password"
              id="register-password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="px-3.5 py-2"
              error={errors.password?.message}
              {...registerField("password", PASSWORD_RULES)}
            />

            <PasswordInput
              tone="dark"
              label="Confirm password"
              id="register-confirm"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className="px-3.5 py-2"
              error={errors.confirmPassword?.message}
              {...registerField("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match",
              })}
            />

            <Button type="submit" variant="gold" size="md" className="w-full" loading={loading} disabled={loading}>
              Create account
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-[#D4AF37]/20" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#77736B]">Already a member?</span>
            <span className="h-px flex-1 bg-[#D4AF37]/20" />
          </div>

          <p className="mt-3 text-center text-sm text-[#A8A8A8]">
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-[#E7C977] transition-colors hover:text-[#F1D477]"
            >
              Sign in
            </Link>
            <span className="mx-1.5 text-[#5A5A5A]" aria-hidden="true">·</span>
            <span>Returning guests</span>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default Register;
