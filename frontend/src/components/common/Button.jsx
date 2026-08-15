import Spinner from "./Spinner";

const VARIANTS = {
  primary: "btn-primary",
  gold: "btn-gold",
  outline: "btn-outline",
  ghost: "lux-btn-outline",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-300 transition-all duration-300 hover:border-red-500/70 hover:bg-red-500/20 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 disabled:cursor-not-allowed disabled:opacity-50",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * Presentational button with a loading state. Use with plain onClick or with
 * react-hook-form by spreading register props onto it (it forwards ...props).
 */
const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  children,
  disabled,
  ...props
}) => (
  <button
    className={`${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <>
        <Spinner size={16} />
        <span>Loading…</span>
      </>
    ) : (
      children
    )}
  </button>
);

export default Button;