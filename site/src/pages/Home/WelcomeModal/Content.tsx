import { InfoPopover } from "@/components/InfoPopover";
import { useAnimateSlider } from "@/hooks/useAnimateSlider";
import { InfoWidgetContent } from "@/widgets/infoWidget/Content";
import { useEffect, useState } from "react";

export const CardContent = () => {
  const [isActive, setIsActive] = useState(false);
  const animate = useAnimateSlider({
    sequence: [0, 50, -20, 20],
    duration: 1,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsActive(true);
      // setTimeout(() => {
      //   setIsActive(false);
      // }, 500);
    }, 1000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      animate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <>
      <div className="w-1/2">
        <InfoWidgetContent />
      </div>
      <div className="relative">
        <InfoPopover items={[["Example link"]]} forceOpen={isActive} />
      </div>
    </>
  );
};
