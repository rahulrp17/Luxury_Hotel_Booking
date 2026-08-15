import toast from "react-hot-toast";
import { palette } from "@/theme";
import { extractErrorMessage } from "@/api";

/**
 * Default Toaster config (spread into <Toaster {...ToasterConfig} />).
 */
export const ToasterConfig = Object.freeze({
  position: "top-15 right-0",
  toastOptions: {
    duration: 3500,
    style: {
      background: palette.ink,
      color: palette.cream,
      borderRadius: "12px",
      fontSize: "14px",
    },
    success: {
      iconTheme: { primary: palette.gold[400], secondary: palette.ink },
    },
    error: {
      duration: 5000,
    },
  },
});

export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  warning: (message) =>
    toast(message, {
      icon: "!",
      style: { border: `1px solid ${palette.gold[400]}` },
      iconTheme: { primary: palette.gold[400], secondary: palette.ink },
    }),
  info: (message) => toast(message),
  loading: (message) => toast.loading(message),
  dismiss: (id) => toast.dismiss(id),

  /** Dismiss a loading toast, then show success/error. */
  update(id, message, type = "success") {
    toast.dismiss(id);
    if (type === "error") toast.error(message);
    else toast.success(message);
  },

  /** Resolve an axios-style error into a toast. */
  errorFrom(error, fallback) {
    toast.error(extractErrorMessage(error, fallback));
  },
};

export default notify;
