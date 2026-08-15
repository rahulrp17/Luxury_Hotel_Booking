import CollectionPage from "@/components/luxury/CollectionPage";
import { getDiningCollection } from "@/data/luxury/diningCollections";

/**
 * /dining/bars — cocktail lounges, champagne bars & the whisky room collection.
 */
const DiningBars = () => <CollectionPage collection={getDiningCollection("bars")} />;

export default DiningBars;