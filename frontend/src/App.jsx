import { Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { resetAuth } from "@/store/slices/authSlice";
import AppRoutes from "@/routes";
import { ROUTES } from "@/constants/routes";
import LenisProvider from "@/providers/LenisProvider";
import PageLoader from "@/components/layout/PageLoader";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

/**
 * Top-level component. Provides smooth scrolling (Lenis), a Suspense boundary
 * with a luxury loader, and listens for the global "auth:unauthorized" event
 * (dispatched by the axios interceptor when a token refresh fails) so auth
 * state is cleared and the user is returned to login.
 */
const App = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onUnauthorized = () => {
      dispatch(resetAuth());
      navigate(ROUTES.LOGIN, { replace: true });
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [dispatch, navigate]);

  return (
    <LenisProvider>
      {/* Catches render errors (and failed lazy chunk loads) so the app never
          blanks out — a themed "Try again" screen is shown instead. */}
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <div
            role="alert"
            className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 text-center"
          >
            <p className="font-serif text-2xl font-semibold text-gold-500">
              Something went wrong
            </p>
            <p className="mt-3 max-w-md text-sm text-[#B5B5B5]">
              {error?.message || "An unexpected error occurred. Please try again."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 rounded-xl bg-gradient-to-r from-[#A97718] via-[#D4AF37] to-[#F1D67A] px-8 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
            >
              Try again
            </button>
          </div>
        )}
      >
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    </LenisProvider>
  );
};

export default App;