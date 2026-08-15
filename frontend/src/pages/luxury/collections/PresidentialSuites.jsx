import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/presidential-suites — the Presidential Collection.
 */
const PresidentialSuites = () => <CollectionPage collection={getHotelCollection("presidential-suites")} />;

export default PresidentialSuites;
