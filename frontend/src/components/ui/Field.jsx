import React ,{ memo } from "react";

/**
 * Simple label wrapper for form fields.
 */
const Field = ({ icon, label, children }) => (
  <label className="flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-white/[0.04] sm:px-4">
    <span className="shrink-0 text-gold-400">{icon}</span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wider text-cream/60">{label}</span>
      {children}
    </span>
  </label>
);

export default memo(Field);