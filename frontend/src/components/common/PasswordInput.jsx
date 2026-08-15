import { forwardRef, useState } from "react";
import Icon from "@/components/ui/Icons";

/**
 * Accessible labelled password input with a show/hide toggle. Mirrors Input's
 * react-hook-form contract so it can be spread with {...register(...)}:
 *   <PasswordInput label="Password" error={errors.password?.message} {...register("password")} />
 */
const PasswordInput = forwardRef(function PasswordInput(
  { label, error, className = "", type = "password", id, autoComplete = "current-password", tone = "light", ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const inputId = id || props.name;
  const show = type === "text" || visible;
  const dark = tone === "dark";
  const inputCls = dark
    ? `lux-input-solid pr-11 ${error ? "border-red-500/70!" : ""}`
    : `input pr-11 ${error ? "border-red-500" : ""}`;
  const toggleCls = dark
    ? "absolute right-3 top-1/2 -translate-y-1/2 text-[#77736B] transition-colors hover:text-[#E7C977]"
    : "absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 transition-colors hover:text-brand-600";

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className={dark ? "lux-label-gold" : "label"}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${inputCls} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className={toggleCls}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <Icon name={visible ? "eyeOff" : "eye"} size={18} />
        </button>
      </div>
      {error && <p className={`mt-1 text-sm ${dark ? "text-red-300" : "text-red-600"}`}>{error}</p>}
    </div>
  );
});

export default PasswordInput;
