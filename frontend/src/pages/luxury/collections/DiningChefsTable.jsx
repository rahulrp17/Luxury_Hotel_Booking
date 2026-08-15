import CollectionPage from "@/components/luxury/CollectionPage";
import { getDiningCollection } from "@/data/luxury/diningCollections";

/**
 * /dining/chefs-table — exclusive chef-led dining at the pass.
 */
const DiningChefsTable = () => <CollectionPage collection={getDiningCollection("chefs-table")} />;

export default DiningChefsTable;