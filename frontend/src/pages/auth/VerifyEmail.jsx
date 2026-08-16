import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import Icon from "@/components/ui/Icons";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services";
import { toErrorMessage } from "@/api";
import { fadeInUp } from "@/theme/animations";

/**
 * Email verification.
 *  - No token: informational "check your inbox" screen (landing after register).
 *  - Token present: verifies against the backend exactly once and shows the
 *    outcome (verified / invalid or expired link).
 */
// Module-level dedup guard: StrictMode double-invokes effects in development
// (setup → cleanup → setup), so a naïve effect fires the verification GET twice
// per page open. Each token should hit the API exactly once; the `active` flag
// can't dedup because cleanup doesn't cancel an in-flight request. Keeping the
// in-flight promise here lets both setups subscribe to the SAME request while
// still allowing a genuine retry after the promise settles (key removed in
// `.finally`). The backend limits this public route (10/15min), so a duplicate
// call is exactly the kind of burst that trips it.
const verifyRequests = new Map(); // token → Promise

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get("token");
  const emailed = location.state?.email;

  const [status, setStatus] = useState("idle"); // idle | verifying | success | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    setStatus("verifying");

    let request = verifyRequests.get(token);
    if (!request) {
      request = authService.verifyEmail(token);
      // Remove once the attempt settles so a later re-verification of a
      // (different) token still performs a fresh request.
      request.finally(() => verifyRequests.delete(token));
      verifyRequests.set(token, request);
    }

    request
      .then(() => active && setStatus("success"))
      .catch((err) => {
        if (!active) return;
        setStatus("error");
        setError(toErrorMessage(err, "This verification link is invalid or has expired."));
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <>
      <Seo title="Verify email" description="Verify your email to finish setting up your AureliaStay account." />

      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <div className="lux-glass p-8 sm:p-10">
          {status === "verifying" ? (
            <SkeletonLoader.Panel />
          ) : status === "success" ? (
            <div className="rounded-xl border border-[#D4AF37]/20 bg-white/[0.03] p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-brand-950 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)]">
                <Icon name="check" size={28} strokeWidth={2.2} />
              </div>
              <h1 className="mt-4 font-serif text-2xl font-medium text-[#F8F6F0]">Email verified</h1>
              <p className="mt-1 text-sm text-[#A8A8A8]">
                Your account is confirmed. You can now sign in and start booking.
              </p>
              <Link to={ROUTES.LOGIN} className="btn-gold mt-6 py-2 px-5 text-brand-800 inline-flex">
                Sign in
              </Link>
            </div>
          ) : status === "error" ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <Icon name="info" size={32} className="mx-auto text-red-400" />
              <h1 className="mt-3 font-serif text-2xl font-medium text-[#F8F6F0]">Verification failed</h1>
              <p className="mt-1 text-sm text-red-300">{error}</p>
              <Link to={ROUTES.REGISTER} className="btn-gold mt-6 px-3 py-2 text-brand-800 inline-flex">
                Create a new account
              </Link>
            </div>
          ) : (
            // No token — landing page after registering.
            <div className="rounded-xl border border-[#D4AF37]/20 bg-white/[0.03] p-6 text-center">
              <Icon name="mail" size={32} className="mx-auto text-[#E7C977]" />
              <h1 className="mt-3 font-serif text-2xl font-medium text-[#F8F6F0]">Check your inbox</h1>
              <p className="mt-1 text-sm text-[#A8A8A8]">
                {emailed
                  ? `We sent a verification link to ${emailed}.`
                  : "We sent a verification link to your email."}{" "}
                Open it to activate your account, then sign in.
              </p>
              <Link
                to={ROUTES.LOGIN}
                className="mt-5 inline-flex font-semibold text-[#E7C977] transition-colors hover:text-[#F1D477]"
              >
                Go to sign in
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default VerifyEmail;
