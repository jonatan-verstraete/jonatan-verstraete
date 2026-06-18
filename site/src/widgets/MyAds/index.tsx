import { useCheckpointValue } from "@/hooks/useCheckpoint";
import { useIsMobile } from "@/hooks/useDevice";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Aqtive } from "./Aqtive";
import { AudioExtension } from "./AudioExtension";
import { CliUtils } from "./CliUtils";
import { Duck } from "./Duck";
import { FluidJS } from "./FluidJS";
import { JsCanvas } from "./JsCanvas";
import { MatrixRain } from "./MatrixRain";
import { Piipaya } from "./Piipaya";
import { PurePaste } from "./PurePaste";
import { Win98 } from "./Windows98";

const AD_POOL = [
  MatrixRain,
  Duck,
  Win98,
  JsCanvas,
  FluidJS,
  Piipaya,
  AudioExtension,
  Aqtive,
  PurePaste,
  CliUtils,
];

const SLOT_INTERVALS = [14000, 21000, 11000, 27000];

const SLOT_POSITIONS: React.CSSProperties[] = [
  { left: "1.5vw", top: "14vh" },
  { left: "1.5vw", bottom: "12vh" },
  { right: "1.5vw", top: "5vh" },
  { right: "1.5vw", top: "60vh" },
];

const SLOT_SIZES = [
  { wDiv: 8, hDiv: 3 },
  { wDiv: 7.2, hDiv: 2.8 },
  { wDiv: 9.5, hDiv: 3.6 },
  { wDiv: 7, hDiv: 3.1 },
];

type Slot = { Ad: React.FC; v: number };

const FloatingPanel = ({
  children,
  style,
  wDiv = 8,
  hDiv = 3,
}: PropsWithChildren<{
  style: React.CSSProperties;
  wDiv?: number;
  hDiv?: number;
}>) => {
  const seed = useMemo(() => Math.random() * 10, []);
  const w = window.innerWidth / wDiv;
  const h = window.innerHeight / hDiv;

  return (
    <div
      className="ad-float fixed z-20 rounded-lg overflow-hidden shadow-2xl pointer-events-auto"
      style={{
        background: "var(--c-22c55e-a19)",
        animationDelay: `${seed.toFixed(1)}s`,
        width: w,
        height: h,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const MyAds = () => {
  const isMobile = useIsMobile();
  const showAds = useCheckpointValue("Ads");

  const [slots, setSlots] = useState<Slot[]>(() => {
    const shuffled = [...AD_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4).map((Ad, i) => ({ Ad, v: i }));
  });

  const activeCount = isMobile ? 1 : 4;

  const rotateSlot = useCallback((slotIdx: number) => {
    setSlots((prev) => {
      const othersAds = prev.filter((_, i) => i !== slotIdx).map((s) => s.Ad);
      const available = AD_POOL.filter((a) => !othersAds.includes(a));
      const next = available[Math.floor(Math.random() * available.length)];
      return prev.map((s, i) => (i === slotIdx ? { Ad: next, v: s.v + 1 } : s));
    });
  }, []);

  useEffect(() => {
    const timers = SLOT_INTERVALS.slice(0, activeCount).map((ms, i) =>
      setInterval(() => rotateSlot(i), ms),
    );
    return () => timers.forEach(clearInterval);
  }, [rotateSlot, activeCount]);

  if (!showAds) return null;

  const MobileAd = slots[0].Ad;

  return (
    <div className="fixed size-full inset-0 z-30 pointer-events-none">
      {isMobile ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 overflow-hidden pointer-events-auto"
          style={{ height: "25vh" }}
        >
          <MobileAd />
        </div>
      ) : (
        <div className="relative size-full">
          {slots.map((slot, i) => (
            <FloatingPanel
              key={i}
              style={SLOT_POSITIONS[i]}
              wDiv={SLOT_SIZES[i].wDiv}
              hDiv={SLOT_SIZES[i].hDiv}
            >
              <slot.Ad />
            </FloatingPanel>
          ))}
        </div>
      )}
    </div>
  );
};
