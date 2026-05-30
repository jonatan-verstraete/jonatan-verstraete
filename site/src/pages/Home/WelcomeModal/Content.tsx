import { InfoPopover } from "@/components/InfoPopover";
import { useAnimateSlider } from "@/hooks/useAnimateSlider";
import { InfoWidgetContent } from "@/widgets/infoWidget/Content";
import { useEffect } from "react";

export const CardContent = () => {
  const animate = useAnimateSlider({
    sequence: [0, 50, -20, 20],
    duration: 1,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      animate();
    }, 300);
    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <InfoWidgetContent />
      <InfoPopover items={[["Example link"]]} forceOpen={true} />
    </>
  );
};
