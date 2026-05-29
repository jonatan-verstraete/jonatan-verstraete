import { ChatWidget } from "./ChatWidget";
import { InfoWidget } from "./InfoWidget";

export const WidgetsContainer = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    <InfoWidget />
    <ChatWidget />
  </div>
);
