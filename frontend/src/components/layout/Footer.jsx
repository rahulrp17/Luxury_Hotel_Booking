import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES, isImplementedPath } from "@/constants/routes";
import { notify } from "@/services";
import Icon from "@/components/ui/Icons";
import Reveal from "@/components/ui/Reveal";

const QUICK_LINKS = [
  { label: "Home", to: ROUTES.HOME },
  { label: "Hotels", to: ROUTES.HOTELS },
  { label: "Experiences", to: ROUTES.EXPERIENCES },
  { label: "Offers", to: ROUTES.OFFERS },
];

const COMPANY = [
  { label: "About", to: ROUTES.ABOUT },
  { label: "Dining", to: ROUTES.DINING },
  { label: "Destinations", to: ROUTES.DESTINATIONS },
  { label: "Contact", to: ROUTES.CONTACT },
];

const SUPPORT = [
  { label: "Contact", to: ROUTES.CONTACT },
  { label: "FAQs", to: ROUTES.FAQ },
  { label: "Wishlist", to: ROUTES.ACCOUNT_WISHLIST },
  { label: "My Bookings", to: ROUTES.BOOKINGS },
];

const POLICIES = [
  { label: "Privacy Policy", to: ROUTES.PRIVACY_POLICY },
  { label: "Terms of Service", to: ROUTES.TERMS },
  { label: "Cancellation", to: ROUTES.CANCELLATION_POLICY },
  { label: "Refund Policy", to: ROUTES.CANCELLATION_POLICY },
];

const SOCIAL = [
  { name: "instagram", label: "Instagram" },
  { name: "facebook", label: "Facebook" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "x", label: "X" },
];

const PAYMENTS = ["Visa", "Mastercard", "UPI", "Amex", "PayPal"];

const FooterColumn = ({ title, links }) => (
  <div>
    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">{title}</h3>
    <ul className="space-y-2.5">
      {links.map((link) =>
        link.to && isImplementedPath(link.to) ? (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm text-brand-300 transition-colors hover:text-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              {link.label}
            </Link>
          </li>
        ) : (
          <li key={link.label}>
            <span
              aria-disabled="true"
              title="Coming soon"
              className="cursor-not-allowed text-sm text-brand-300/40"
            >
              {link.label}
            </span>
          </li>
        )
      )}
    </ul>
  </div>
);

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email) {
      notify.error("Please enter your email address.");
      return;
    }
    notify.success("Subscribed! You'll hear from us soon.");
    setEmail("");
  };

  const backToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="mt-auto bg-brand-950 text-brand-200">
      {/* Newsletter */}
      {/* <div className="border-b border-brand-800">
        <Reveal>
          <div className="container-lux flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-500">Newsletter</p>
              <h3 className="mt-2 font-serif text-2xl text-cream">Stays &amp; offers, straight to your inbox</h3>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md gap-2"
              aria-label="Subscribe to newsletter"
            >
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email"
                className="input flex-1 border-white/10 bg-white/5 text-cream placeholder-brand-400"
              />
              <button type="submit" className="btn-gold shrink-0">
                <Icon name="send" size={16} />
                Subscribe
              </button>
            </form>
          </div>
        </Reveal>
      </div> */}

      {/* Link columns */}
      <Reveal>
        <div className="container-lux grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand + contact + social */}
          <div className="lg:col-span-2">
            <Link to={ROUTES.HOME} className="flex items-baseline gap-1" aria-label="AureliaStay home">
              <span className="font-serif text-xl font-semibold text-cream">Aurelia</span>
              <span className="font-serif text-xl font-semibold text-gold-500">Stay</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-brand-400">
              Curated luxury stays with seamless booking, guaranteed rates and white-glove service.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-brand-300">
              <li className="flex items-center gap-2">
                <Icon name="mail" size={16} className="text-gold-500" />
                concierge@aureliastay.com
              </li>
              <li className="flex items-center gap-2">
                <Icon name="phone" size={16} className="text-gold-500" />
                +91 00000 00000
              </li>
            </ul>

            <div className="mt-5 flex gap-2">
              {SOCIAL.map((social) => (
                <a
                  key={social.name}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-700 text-brand-300 transition-colors hover:border-gold-500 hover:text-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  <Icon name={social.name} size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick Links" links={QUICK_LINKS} />
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Support" links={SUPPORT} />
          <FooterColumn title="Policies" links={POLICIES} />
        </div>
      </Reveal>

      {/* Payment icons + back to top */}
      <Reveal>
        <div className="container-lux flex flex-col items-center justify-between gap-5 border-t border-brand-800 py-6 sm:flex-row">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-wider text-brand-400">We accept</span>
            {PAYMENTS.map((method) => (
              <span
                key={method}
                className="rounded border border-brand-700 px-2 py-0.5 text-[11px] font-medium text-brand-300"
              >
                {method}
              </span>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={backToTop}
            aria-label="Back to top"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-700 text-brand-300 transition-colors hover:border-gold-500 hover:text-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
          >
            <Icon name="arrowUp" size={18} />
          </motion.button>
        </div>
      </Reveal>

      {/* Copyright */}
      <div className="border-t border-brand-800 py-5 text-center text-xs text-brand-400">
        © {new Date().getFullYear()} AureliaStay. All rights reserved. Crafted with care.
      </div>
    </footer>
  );
};

export default Footer;
