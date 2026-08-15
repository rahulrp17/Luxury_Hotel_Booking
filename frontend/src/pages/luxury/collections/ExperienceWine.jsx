import CollectionPage from "@/components/luxury/CollectionPage";
import { getExperienceCollection } from "@/data/luxury/experienceCollections";

/**
 * /experiences/wine — cellar, tasting and vineyard wine collection.
 */
const ExperienceWine = () => <CollectionPage collection={getExperienceCollection("wine")} />;

export default ExperienceWine;