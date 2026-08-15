/**
 * Reusable empty/placeholder state with an optional icon, title and action.
 */
const EmptyState = ({ icon, title = "Nothing here yet", description, action, tone = "light" }) => {
  const dark = tone === "dark";
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center ${
        dark ? "border-[#D4AF37]/30 bg-white/[0.02]" : "border-brand-200 bg-white"
      }`}
    >
      {icon && <div className="mb-3 text-gold-500">{icon}</div>}
      <h3 className={`text-lg font-semibold ${dark ? "text-[#F5F1E8]" : "text-brand-800"}`}>{title}</h3>
      {description && (
        <p className={`mt-1 max-w-sm text-sm ${dark ? "text-[#A8A8A8]" : "text-brand-500"}`}>{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;