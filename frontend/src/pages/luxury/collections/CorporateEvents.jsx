import InfoPage from "@/components/luxury/InfoPage";
import { getServiceCollection } from "@/data/luxury/serviceCollections";

/**
 * /corporate-events — business, beautifully handled.
 */
const CorporateEvents = () => <InfoPage page={getServiceCollection("corporate-events")} />;

export default CorporateEvents;