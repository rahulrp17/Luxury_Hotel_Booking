import InfoPage from "@/components/luxury/InfoPage";
import { getServiceCollection } from "@/data/luxury/serviceCollections";

/**
 * /weddings — say yes to the perfect setting.
 */
const Weddings = () => <InfoPage page={getServiceCollection("weddings")} />;

export default Weddings;