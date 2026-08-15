import CollectionPage from "@/components/luxury/CollectionPage";
import { getDiningCollection } from "@/data/luxury/diningCollections";

/**
 * /dining/buffet — breakfast, lunch and dinner buffet experiences.
 */
const DiningBuffet = () => <CollectionPage collection={getDiningCollection("buffet")} />;

export default DiningBuffet;