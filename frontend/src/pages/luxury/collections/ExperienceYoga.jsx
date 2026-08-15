import CollectionPage from "@/components/luxury/CollectionPage";
import { getExperienceCollection } from "@/data/luxury/experienceCollections";

/**
 * /experiences/yoga-meditation — stillness within yoga and meditation.
 */
const ExperienceYoga = () => <CollectionPage collection={getExperienceCollection("yoga-meditation")} />;

export default ExperienceYoga;