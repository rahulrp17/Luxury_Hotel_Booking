import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/luxury-resorts — signature luxury resort collection.
 */
const LuxuryResorts = () => <CollectionPage collection={getHotelCollection("luxury-resorts")} />;

export default LuxuryResorts;