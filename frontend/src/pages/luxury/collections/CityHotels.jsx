import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/city-hotels — metropolitan city hotel collection.
 */
const CityHotels = () => <CollectionPage collection={getHotelCollection("city-hotels")} />;

export default CityHotels;
