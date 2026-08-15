import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/mountain-resorts — alpine & mountain resort collection.
 */
const MountainResorts = () => <CollectionPage collection={getHotelCollection("mountain-resorts")} />;

export default MountainResorts;
