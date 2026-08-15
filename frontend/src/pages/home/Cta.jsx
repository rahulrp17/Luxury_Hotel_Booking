import { useNavigate } from "react-router-dom";
import { Reveal } from "@/components/ui";
import { Container, PrimaryButton, SecondaryButton,Section } from "@/components/layout";
import { ROUTES } from "@/constants/routes";

/**
 * Premium closing call-to-action.
 */
const Cta = () => {
  const navigate = useNavigate();

  return (
    <Section className="relative overflow-hidden bg-brand-950">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold-500/15 via-transparent to-transparent" aria-hidden="true" />
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
            <h2 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
              Your next unforgettable stay begins here
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              Browse featured properties and book directly for the best available rate — no hidden fees, just unforgettable stays.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton onClick={() => navigate(ROUTES.HOTELS)}>Explore hotels</PrimaryButton>
              <SecondaryButton onClick={() => navigate(ROUTES.HOTELS)} className="border-cream/30! text-cream! hover:border-gold-400! hover:text-gold-400!">
                Book a stay
              </SecondaryButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
};

export default Cta;