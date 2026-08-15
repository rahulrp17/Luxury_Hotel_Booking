import CollectionPage from "@/components/luxury/CollectionPage";
import { getDiningCollection } from "@/data/luxury/diningCollections";

/**
 * /dining/restaurants — signature restaurants and menus.
 */
const DiningRestaurants = () => <CollectionPage collection={getDiningCollection("restaurants")} />;

export default DiningRestaurants;