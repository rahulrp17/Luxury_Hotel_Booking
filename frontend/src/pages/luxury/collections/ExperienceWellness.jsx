import CollectionPage from "@/components/luxury/CollectionPage";
import { getExperienceCollection } from "@/data/luxury/experienceCollections";

/**
 * /experiences/wellness — restoring spa, yoga, meditation and wellness collection.
 */
const ExperienceWellness = () => <CollectionPage collection={getExperienceCollection("wellness")} />;

export default ExperienceWellness;