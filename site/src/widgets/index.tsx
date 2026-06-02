import { ChatWidget } from "./chatWidget";
import { InfoWidget } from "./infoWidget";
import { MyAds } from "./MyAds";

export const WidgetsContainer = () => (
  <>
    <MyAds />
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <InfoWidget />
      <ChatWidget />
    </div>
  </>
);
