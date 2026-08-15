import CollectionPage from "@/components/luxury/CollectionPage";
import { getExperienceCollection } from "@/data/luxury/experienceCollections";

/**
 * /experiences/safari — into the wild safari expeditions.
 */
const ExperienceSafari = () => <CollectionPage collection={getExperienceCollection("safari")} />;

export default ExperienceSafari;