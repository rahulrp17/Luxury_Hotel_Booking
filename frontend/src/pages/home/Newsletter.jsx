import { useState } from "react";
import { motion } from "framer-motion";

import {
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Gift,
  Crown,
} from "lucide-react";

import { notify } from "@/services";

import {
  Reveal,
} from "@/components/ui";

import {
  Container,
  Section,
} from "@/components/layout";

import {
  fadeInUp,
  staggerContainer,
  EASE,
} from "@/theme/animations";

const BENEFITS = [
  {
    icon: Crown,
    title: "VIP Member Rates",
    text: "Unlock exclusive luxury hotel discounts.",
  },
  {
    icon: Gift,
    title: "Exclusive Offers",
    text: "Receive curated seasonal experiences.",
  },
  {
    icon: ShieldCheck,
    title: "No Spam",
    text: "Only premium travel inspiration and offers.",
  },
];

const Newsletter = () => {

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [subscribed, setSubscribed] = useState(false);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const onSubmit = async (e) => {

    e.preventDefault();

    if (!email.trim()) {
      notify.error("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      notify.error("Please enter a valid email.");
      return;
    }

    try {

      setLoading(true);

      await new Promise((resolve) =>
        setTimeout(resolve, 1800)
      );

      notify.success("Welcome to AureliaStay Privilege Club!");

      setSubscribed(true);

      setEmail("");

    } catch (error) {

      notify.error("Something went wrong.");

    } finally {

      setLoading(false);

    }
  };

  return (
    <Section className="relative overflow-hidden bg-[#0F0F10] py-14 text-white">

      <div className="absolute -left-44 top-0 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px]" />

      <div className="absolute -right-44 bottom-0 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px]" />

      <Container>

        <Reveal>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .8 }} className="mx-auto max-w-5xl">

            <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-[0_35px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl">

              <div className="grid lg:grid-cols-2">

                                {/* LEFT SIDE */}

                <div className="relative overflow-hidden p-8 sm:p-10 lg:p-14">

                  <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
                    <Sparkles size={14} />
                    Privilege Club
                  </span>

                  <h2 className="mt-7 font-serif text-3xl font-semibold leading-tight text-white md:text-3xl">
                    Stay Inspired.
                    <br />
                    Stay Rewarded.
                  </h2>

                  <p className="mt-6 max-w-lg text-md leading-8 text-white/70">
                    Become an AureliaStay Privilege member and enjoy members-only
                    rates, luxury travel inspiration, exclusive hotel launches,
                    complimentary upgrades and handcrafted seasonal offers.
                  </p>

                  <motion.div variants={staggerContainer(0.12)} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10 space-y-5">

                    {BENEFITS.map((item) => {

                      const Icon = item.icon;

                      return (

                        <motion.div key={item.title} variants={fadeInUp} whileHover={{ x: 8 }} transition={{ duration: .35, ease: EASE }} className="flex items-start gap-5 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">

                          <div className="flex lg:mt-2 md:mt-2 mt-4 h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#E7C96A] text-black shadow-xl">
                            <Icon size={24} />
                          </div>

                          <div>

                            <h3 className="text-lg font-semibold text-white">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-sm leading-7 text-white/60">
                              {item.text}
                            </p>

                          </div>

                        </motion.div>

                      );

                    })}

                  </motion.div>

                </div>

                {/* RIGHT SIDE */}

                <div className="flex items-center justify-center bg-gradient-to-br from-[#111111] via-[#181818] to-[#202020] p-8 sm:p-10 lg:p-14">

                                    {subscribed ? (

                    <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="w-full rounded-[32px] border border-[#D4AF37]/30 bg-white/5 p-10 text-center backdrop-blur-xl">

                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E7C96A] text-black shadow-2xl">
                        <CheckCircle2 size={42} />
                      </div>

                      <h3 className="mt-8 font-serif text-4xl font-semibold text-white">
                        Welcome Aboard!
                      </h3>

                      <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-white/70">
                        Thank you for joining AureliaStay Privilege Club.
                        You'll receive luxury travel inspiration, exclusive
                        hotel launches and members-only offers directly in
                        your inbox.
                      </p>

                    </motion.div>

                  ) : (

                    <motion.form onSubmit={onSubmit} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .6 }} className="w-full rounded-[32px] border border-white/10 bg-white/5 p-3 shadow-[0_25px_60px_rgba(0,0,0,.35)] backdrop-blur-xl lg:p-8 md:lg-8   ">

                      <div className="mb-8 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E7C96A] text-black shadow-2xl">
                          <Mail size={34} />
                        </div>

                        <h3 className="mt-6 font-serif text-3xl font-semibold text-white">
                          Join Our Newsletter
                        </h3>

                        <p className="mt-3 text-white/60">
                          Luxury experiences begin with one email.
                        </p>

                      </div>

                      <div className="space-y-5">

                        <div className="relative">

                          <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />

                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="h-16 w-full rounded-full border border-white/10 bg-white/10 pl-14 pr-6 text-white outline-none transition duration-300 placeholder:text-white/40 focus:border-[#D4AF37]" />

                        </div>

                        <button type="submit" disabled={loading} className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#C8A446] to-[#E7C96A] text-lg font-semibold text-black shadow-[0_18px_45px_rgba(212,175,55,.35)] transition duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70">

                          {loading ? (

                            <>
                              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-30" />
                                <path d="M22 12A10 10 0 0012 2" stroke="currentColor" strokeWidth="3" />
                              </svg>

                              Joining...

                            </>

                          ) : (

                            <>
                              Join Privilege Club
                              <ArrowRight size={20} />
                            </>

                          )}

                        </button>

                      </div>

                      <p className="mt-6 text-center text-sm text-white/45">
                        No spam. Unsubscribe anytime.
                      </p>

                    </motion.form>

                  )}

                </div>

              </div>

            </div>

          </motion.div>

        </Reveal>

      </Container>

    </Section>
  );
};

export default Newsletter;