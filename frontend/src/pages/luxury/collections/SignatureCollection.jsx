import CollectionPage from "@/components/luxury/CollectionPage";
import { getHotelCollection } from "@/data/luxury/hotelCollections";

/**
 * /hotels/signature-collection — the Signature Collection of residences.
 */
const SignatureCollection = () => <CollectionPage collection={getHotelCollection("signature-collection")} />;

export default SignatureCollection;