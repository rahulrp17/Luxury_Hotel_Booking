import InfoPage from "@/components/luxury/InfoPage";
import { getServiceCollection } from "@/data/luxury/serviceCollections";

/**
 * /locations — find your address.
 */
const Locations = () => <InfoPage page={getServiceCollection("locations")} />;

export default Locations;