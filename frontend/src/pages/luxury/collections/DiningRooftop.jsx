import CollectionPage from "@/components/luxury/CollectionPage";
import { getDiningCollection } from "@/data/luxury/diningCollections";

/**
 * /dining/rooftop — rooftop restaurant, sky lounge & cabana dining collection.
 */
const DiningRooftop = () => <CollectionPage collection={getDiningCollection("rooftop")} />;

export default DiningRooftop;