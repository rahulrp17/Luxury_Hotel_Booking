import { Reveal, Accordion } from "@/components/ui";
import { Container, Section, SectionTitle } from "@/components/layout";

const FAQS = [
  {
    title: "How do I modify or cancel a booking?",
    content:
      "Sign in to your account, open My Bookings and choose the stay. Free cancellation is available up to 24 hours before check-in; refunds are processed to your original payment method.",
  },
  {
    title: "Are the rates guaranteed?",
    content:
      "Yes. The price shown at booking is the final amount — taxes are included and there are no hidden fees or resort charges.",
  },
  {
    title: "Do you offer flexible check-in and late checkout?",
    content:
      "Standard check-in is from 14:00 and checkout by 12:00. Early arrival and late checkout can be arranged at the property, subject to availability.",
  },
  {
    title: "How are rewards and offers applied?",
    content:
      "Enter your offer code at checkout and the discount is applied instantly. Membership perks and loyalty rewards are tracked in your account.",
  },
];

const Faq = () => (
  <Section>
    <Container>
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionTitle
            eyebrow="FAQ"
            title="Answers, before you ask"
            description="Everything you need to know about booking with AureliaStay."
            align="center"
          />
        </Reveal>
        <Reveal className="mt-10">
          <Accordion items={FAQS} />
        </Reveal>
      </div>
    </Container>
  </Section>
);

export default Faq;
