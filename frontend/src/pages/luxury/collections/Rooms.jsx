import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/rooms — room type collection.
 */
const Rooms = () => <CollectionPage collection={getHotelCollection("rooms")} />;

export default Rooms;
