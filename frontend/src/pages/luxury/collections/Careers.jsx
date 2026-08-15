import InfoPage from "@/components/luxury/InfoPage";
import { getAboutCollection } from "@/data/luxury/aboutCollections";

/**
 * /careers — build the future of hospitality.
 */
const Careers = () => <InfoPage page={getAboutCollection("careers")} />;

export default Careers;