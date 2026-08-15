import InfoPage from "@/components/luxury/InfoPage";
import { getAboutCollection } from "@/data/luxury/aboutCollections";

/**
 * /about/press — AureliaStay in the press.
 */
const Press = () => <InfoPage page={getAboutCollection("press")} />;

export default Press;