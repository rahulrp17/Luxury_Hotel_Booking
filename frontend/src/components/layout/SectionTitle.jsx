const ALIGN = {
  left: "text-left",
  center: "text-center",
};

/**
 * Section heading block (eyebrow + title + description). Wrap with <Reveal />
 * for a scroll-in effect, or use directly.
 */
const SectionTitle = ({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}) => {
  const alignClass = ALIGN[align] || ALIGN.left;

  return (
    <div className={`${alignClass} ${className}`}>
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-2xl font-semibold text-gold-500 sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 max-w-2xl text-brand-300 ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
