import { FooterSection } from "./FooterSection";
import { GreetingPopover } from "./GreetingPopover";
import { HeroSection } from "./HeroSection";
import { ProjectSection } from "./ProjectsSearch";

export const Home = () => (
  <div className="flex-1 flex flex-col min-h-0">
    <GreetingPopover />
    <HeroSection />
    <ProjectSection />
    <FooterSection />
  </div>
);
