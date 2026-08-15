import CollectionPage from "@/components/luxury/CollectionPage";
import { getExperienceCollection } from "@/data/luxury/experienceCollections";

/**
 * /experiences/private-dining — an evening made entirely yours.
 */
const ExperiencePrivateDining = () => <CollectionPage collection={getExperienceCollection("private-dining")} />;

export default ExperiencePrivateDining;