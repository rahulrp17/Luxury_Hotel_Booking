import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/suites — suite type collection.
 */
const Suites = () => <CollectionPage collection={getHotelCollection("suites")} />;

export default Suites;
