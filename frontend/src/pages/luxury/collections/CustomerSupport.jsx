import InfoPage from "@/components/luxury/InfoPage";
import { getServiceCollection } from "@/data/luxury/serviceCollections";

/**
 * /customer-support — we're here, around the clock.
 */
const CustomerSupport = () => <InfoPage page={getServiceCollection("customer-support")} />;

export default CustomerSupport;