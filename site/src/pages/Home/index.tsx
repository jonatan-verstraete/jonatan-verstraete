import { FooterSection } from "./FooterSection";
import { ProjectSection } from "./ProjectsSearch";
import { WelcomeModal } from "./WelcomeModal";

export const Home = () => (
  <div className="flex-1 flex flex-col min-h-0">
    <WelcomeModal />
    <ProjectSection />
    <FooterSection />
  </div>
);
