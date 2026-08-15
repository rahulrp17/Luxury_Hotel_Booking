import CollectionPage from "@/components/luxury/CollectionPage";
import { getExperienceCollection } from "@/data/luxury/experienceCollections";

/**
 * /experiences/spa — rituals of renewal spa experiences.
 */
const ExperienceSpa = () => <CollectionPage collection={getExperienceCollection("spa")} />;

export default ExperienceSpa;