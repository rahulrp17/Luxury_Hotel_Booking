import InfoPage from "@/components/luxury/InfoPage";
import { getAboutCollection } from "@/data/luxury/aboutCollections";

/**
 * /about/sustainability — a more considered future.
 */
const Sustainability = () => <InfoPage page={getAboutCollection("sustainability")} />;

export default Sustainability;