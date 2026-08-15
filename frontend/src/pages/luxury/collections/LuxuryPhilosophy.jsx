import InfoPage from "@/components/luxury/InfoPage";
import { getAboutCollection } from "@/data/luxury/aboutCollections";

/**
 * /about/luxury-philosophy — luxury, considered differently.
 */
const LuxuryPhilosophy = () => <InfoPage page={getAboutCollection("luxury-philosophy")} />;

export default LuxuryPhilosophy;