import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/beach-resorts — oceanfront beach resort collection.
 */
const BeachResorts = () => <CollectionPage collection={getHotelCollection("beach-resorts")} />;

export default BeachResorts;
