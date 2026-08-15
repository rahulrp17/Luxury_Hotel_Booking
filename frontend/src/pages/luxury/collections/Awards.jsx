import InfoPage from "@/components/luxury/InfoPage";
import { getAboutCollection } from "@/data/luxury/aboutCollections";

/**
 * /about/awards — recognized for the exceptional.
 */
const Awards = () => <InfoPage page={getAboutCollection("awards")} />;

export default Awards;