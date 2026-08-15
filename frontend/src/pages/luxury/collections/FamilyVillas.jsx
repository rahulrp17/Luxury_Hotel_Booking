import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/family-villas — family villa collection.
 */
const FamilyVillas = () => <CollectionPage collection={getHotelCollection("family-villas")} />;

export default FamilyVillas;
