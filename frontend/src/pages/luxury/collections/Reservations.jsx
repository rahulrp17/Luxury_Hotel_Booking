import InfoPage from "@/components/luxury/InfoPage";
import { getServiceCollection } from "@/data/luxury/serviceCollections";

/**
 * /reservations — book with confidence.
 */
const Reservations = () => <InfoPage page={getServiceCollection("reservations")} />;

export default Reservations;