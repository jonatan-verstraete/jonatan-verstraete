import { WidgetName } from "@/config";
import { currentWidgetAtom } from "@/store/generalStore";
import { useAtom } from "jotai";

export const useWidgetDisclosure = (widget: WidgetName) => {
  const [currentWidgetName, setOpenWidget] = useAtom(currentWidgetAtom);

  return {
    onClose: () => setOpenWidget(null),
    onToggle: () => setOpenWidget((v) => (v === widget ? null : widget)),
    isOpen: currentWidgetName === widget,
  };
};
