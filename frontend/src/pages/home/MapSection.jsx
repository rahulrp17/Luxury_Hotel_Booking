import { Reveal } from "@/components/ui";
import { Container, Section, SectionTitle } from "@/components/layout";

/**
 * Google Maps embed derived from a featured hotel's real location coordinates
 * ([lng, lat]). Falls back to a neutral placeholder when no coordinates exist
 * (nothing hardcoded).
 */
const MapSection = ({ hotel }) => {
  const coords = hotel?.location?.coordinates;
  const lat = coords?.[1];
  const lng = coords?.[0];

  return (
    <Section className="bg-white">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Find Us"
            title="Explore our signature destination"
            description={hotel?.name ? `Location preview — ${hotel.name}.` : "Location preview"}
            align="center"
          />
        </Reveal>
        <Reveal className="mt-10">
          <div className="overflow-hidden rounded-2xl border border-brand-100 shadow-lg">
            {Number.isFinite(lat) && Number.isFinite(lng) ? (
              <iframe
                title={hotel?.name || "Property location"}
                src={`https://www.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
                className="h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="flex h-[420px] w-full flex-col items-center justify-center bg-brand-50 text-brand-400">
                <p className="font-serif text-lg">Location map</p>
                <p className="mt-1 text-sm">Coordinates coming soon.</p>
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
};

export default MapSection;
