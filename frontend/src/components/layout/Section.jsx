import { forwardRef } from "react";

/**
 * Vertical section wrapper with consistent rhythm. Set `as` to `footer`/`header`
 * when needed for semantic HTML.
 */
const Section = forwardRef(function Section(
  { as: Tag = "section", className = "", children, ...props },
  ref
) {
  return (
    <Tag ref={ref} className={`py-16 sm:py-20 lg:py-24 ${className}`} {...props}>
      {children}
    </Tag>
  );
});

export default Section;