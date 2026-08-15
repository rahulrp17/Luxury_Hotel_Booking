import { Fragment } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icons";

/**
 * Accessible breadcrumb navigation.
 * @param {Array} items - [{ label, to? }]; the last item is rendered as current.
 */
const Breadcrumb = ({ items = [], className = "", tone = "light" }) => {
  const dark = tone === "dark";
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={`flex flex-wrap items-center gap-1.5 text-sm ${dark ? "text-[#8A8A8A]" : "text-brand-500"}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li className="flex items-center gap-1.5">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className={`transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 ${
                      dark ? "hover:text-[#E7C977]" : "hover:text-gold-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={isLast ? `font-medium ${dark ? "text-[#F5F1E8]" : "text-brand-800"}` : ""}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className={dark ? "text-[#5A5A5A]" : "text-brand-300"}>
                  <Icon name="chevronRight" size={14} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
