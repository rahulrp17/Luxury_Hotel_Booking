/**
 * Theme tokens used outside of Tailwind (Framer Motion, charts, inline styles).
 * Tailwind's CSS-first theme lives in src/index.css; keep these in sync.
 */

export const palette = Object.freeze({
  brand: {
    50: "#f6f7f8",
    100: "#eceef0",
    200: "#d5d9de",
    300: "#b3bac2",
    400: "#8a94a0",
    500: "#6a7481",
    600: "#535c68",
    700: "#3a3a3a",
    800: "#202020",
    900: "#111111",
    950: "#0b0b0b",
  },
  gold: {
    50: "#fbf6e7",
    100: "#f7eccb",
    200: "#efdca0",
    300: "#e7c977",
    400: "#dfbe54",
    500: "#d4af37",
    600: "#b8912c",
    700: "#93701f",
    800: "#6f5218",
    900: "#4f3a12",
  },
  cream: "#faf7f1",
  ink: "#111111",
});

export const fonts = Object.freeze({
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  serif: '"Playfair Display", ui-serif, Georgia, serif',
});

export const radius = Object.freeze({
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  full: "9999px",
});

export const shadows = Object.freeze({
  sm: "0 1px 2px rgba(17,19,24,0.06)",
  md: "0 4px 12px rgba(17,19,24,0.08)",
  lg: "0 12px 32px rgba(17,19,24,0.12)",
});

export default Object.freeze({ palette, fonts, radius, shadows });
