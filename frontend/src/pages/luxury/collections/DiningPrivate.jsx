import CollectionPage from "@/components/luxury/CollectionPage";
import { getDiningCollection } from "@/data/luxury/diningCollections";

/**
 * /dining/private — chef's table & private dining rooms collection.
 */
const DiningPrivate = () => <CollectionPage collection={getDiningCollection("private")} />;

export default DiningPrivate;