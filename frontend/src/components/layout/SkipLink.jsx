/**
 * Accessibility skip link. Visually hidden until focused (keyboard users), then
 * jumps focus to the main content anchor.
 */
const SkipLink = ({ targetId = "main-content", label = "Skip to content" }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-950 focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
  >
    {label}
  </a>
);

export default SkipLink;