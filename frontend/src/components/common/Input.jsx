import { forwardRef } from "react";

/**
 * Accessible labelled input. Designed to work with react-hook-form:
 *   <Input label="Email" error={errors.email?.message} {...register("email")} />
 */
const Input = forwardRef(function Input(
  { label, error, className = "", type = "text", id, tone = "light", ...props },
  ref
) {
  const inputId = id || props.name;
  const dark = tone === "dark";
  const inputCls = dark
    ? `lux-input-solid ${error ? "border-red-500/70!" : ""}`
    : `input ${error ? "border-red-500" : ""}`;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className={dark ? "lux-label-gold" : "label"}>
          {label}
        </label>
      )}
      <input id={inputId} ref={ref} type={type} className={`${inputCls} ${className}`} {...props} />
      {error && <p className={`mt-1 text-sm ${dark ? "text-red-300" : "text-red-600"}`}>{error}</p>}
    </div>
  );
});

export default Input;