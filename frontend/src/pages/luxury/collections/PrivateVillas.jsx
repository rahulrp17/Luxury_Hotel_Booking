import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/private-villas — exclusive private villa collection.
 */
const PrivateVillas = () => <CollectionPage collection={getHotelCollection("private-villas")} />;

export default PrivateVillas;
