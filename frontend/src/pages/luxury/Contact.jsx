import { useState } from "react";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import Icon from "@/components/ui/Icons";
import LuxuryHero from "@/components/luxury/LuxuryHero";
import LuxuryCard from "@/components/luxury/LuxuryCard";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { CONTACT_INFO, CONTACT_DEPARTMENTS } from "@/data/luxury/contact";

/**
 * /contact — concierge contact channels + enquiry form.
 */
const Contact = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [error, setError] = useState("");

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const onSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in your name, email and message.");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <>
      <Seo
        title="Contact"
        description="Contact the Aurelia Stay concierge — reservations, events and every question in between."
      />

      <LuxuryHero
        eyebrow={CONTACT_INFO.eyebrow}
        title={CONTACT_INFO.title}
        description={CONTACT_INFO.description}
      />

      <section className="bg-[#0B0B0B]">
        <Container className="py-20 sm:py-24">
          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-10 lg:grid-cols-2"
          >
            {/* Channels */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <LuxuryCard className="p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                    <Icon name="mail" size={20} className="text-[#F1D477]" />
                  </span>
                  <div>
                    <h2 className="font-serif text-lg text-[#F8F6F0]">Email the concierge</h2>
                    <a href={`mailto:${CONTACT_INFO.email}`} className="text-sm text-[#E7C977] hover:underline">
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                    <Icon name="phone" size={20} className="text-[#F1D477]" />
                  </span>
                  <div>
                    <h2 className="font-serif text-lg text-[#F8F6F0]">Call us</h2>
                    <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`} className="text-sm text-[#E7C977] hover:underline">
                      {CONTACT_INFO.phone}
                    </a>
                    <p className="lux-muted text-xs">{CONTACT_INFO.hours}</p>
                  </div>
                </div>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                    <Icon name="mapPin" size={20} className="text-[#F1D477]" />
                  </span>
                  <div>
                    <h2 className="font-serif text-lg text-[#F8F6F0]">Find us</h2>
                    <p className="lux-muted mt-1 text-sm">{CONTACT_INFO.address}</p>
                  </div>
                </div>
              </LuxuryCard>

              <div className="lux-hairline" />

              <div>
                <h2 className="lux-h2">Departments</h2>
                <ul className="mt-5 space-y-3">
                  {CONTACT_DEPARTMENTS.map((department) => (
                    <li key={department.email} className="lux-glass-soft flex items-center justify-between gap-4 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#F8F6F0]">{department.label}</p>
                        <p className="lux-muted text-xs">{department.note}</p>
                      </div>
                      <a href={`mailto:${department.email}`} className="text-xs font-medium text-[#E7C977] hover:underline">
                        {department.email}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div variants={fadeInUp}>
              <LuxuryCard className="p-6 sm:p-8">
                {sent ? (
                  <div className="flex flex-col items-center py-14 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/20">
                      <Icon name="check" size={28} className="text-[#F1D477]" />
                    </span>
                    <h2 className="lux-h2 mt-6">Thank you — message received</h2>
                    <p className="lux-muted mt-2 max-w-sm text-sm">
                      Our concierge will be in touch within the hour. For urgent requests, please call {CONTACT_INFO.phone}.
                    </p>
                    <button type="button" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="lux-btn-ghost mt-8">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} noValidate aria-label="Contact the concierge">
                    <h2 className="lux-h2">Send a message</h2>
                    <p className="lux-muted mt-2 text-sm">We usually reply within the hour.</p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="lux-label">Full name</label>
                        <input id="contact-name" type="text" required value={form.name} onChange={update("name")} className="lux-input" placeholder="A. Traveler" />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="lux-label">Email</label>
                        <input id="contact-email" type="email" required value={form.email} onChange={update("email")} className="lux-input" placeholder="you@example.com" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="contact-subject" className="lux-label">Subject</label>
                      <input id="contact-subject" type="text" value={form.subject} onChange={update("subject")} className="lux-input" placeholder="Reservations, weddings, press…" />
                    </div>

                    <div className="mt-4">
                      <label htmlFor="contact-message" className="lux-label">Message</label>
                      <textarea id="contact-message" rows={5} required value={form.message} onChange={update("message")} className="lux-input min-h-32 resize-y" placeholder="Tell us how we can help…" />
                    </div>

                    {error && <p className="mt-4 text-sm text-[#E8A2A2]" role="alert">{error}</p>}

                    <button type="submit" className="lux-btn-gold mt-6 w-full sm:w-auto">
                      Send message
                      <Icon name="send" size={15} />
                    </button>
                  </form>
                )}
              </LuxuryCard>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
};

export default Contact;