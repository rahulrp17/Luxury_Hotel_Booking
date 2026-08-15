import CollectionPage from "@/components/luxury/CollectionPage";
import { getExperienceCollection } from "@/data/luxury/experienceCollections";

/**
 * /experiences/adventure — safari, trekking and water adventure collection.
 */
const ExperienceAdventure = () => <CollectionPage collection={getExperienceCollection("adventure")} />;

export default ExperienceAdventure;