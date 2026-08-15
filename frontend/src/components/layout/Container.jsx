import { forwardRef } from "react";

/**
 * Max-width content container. Uses the `container-lux` utility (max-w-7xl +
 * responsive padding) from the global stylesheet.
 */
const Container = forwardRef(function Container(
  { as: Tag = "div", className = "", children, ...props },
  ref
) {
  return (
    <Tag ref={ref} className={`container-lux ${className}`} {...props}>
      {children}
    </Tag>
  );
});

export default Container;
