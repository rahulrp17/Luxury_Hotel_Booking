/**
 * Lightweight validation helpers + React Hook Form resolvers.
 */

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,15}$/;

export const isEmail = (value = "") => EMAIL_RE.test(value);
export const isPhone = (value = "") => PHONE_RE.test(value);

export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const passwordRules = {
  required: "Password is required",
  minLength: { value: 8, message: "At least 8 characters" },
  pattern: {
    value: PASSWORD_PATTERN,
    message: "Needs uppercase, lowercase and a number",
  },
};

export const emailRules = {
  required: "Email is required",
  pattern: { value: EMAIL_RE, message: "Enter a valid email" },
};

/**
 * Generic rules object for react-hook-form. Example usage:
 *   <input {...register("email", emailRules)} />
 */
export const RULES = {
  email: emailRules,
  password: passwordRules,
  required: (label = "This field") => ({
    required: `${label} is required`,
  }),
};
