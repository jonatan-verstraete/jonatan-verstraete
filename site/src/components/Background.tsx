import { useCheckpointValue } from "@/hooks/useCheckpoint";
import { useIsMobile } from "@/hooks/useDevice";
import { FluidText } from "@jayf0x/fluidity-js";
import { useMotionValue, useMotionValueEvent } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

export const Background = () => {
  const fluidRef = useRef<FluidHandle>(null);

  const isMobile = useIsMobile();
  const showVoid = useCheckpointValue("Void");
  const showFLuid = useCheckpointValue("Fluid");
  const isFluidHighQuality = useCheckpointValue("Fluid Quality");
  const showChickenEgg = useCheckpointValue("🐔🥚");

  const splatCanvas = useCallback(
    (x: number, y: number) => {
      if (isMobile) {
        fluidRef.current?.splat(x, y, x + 20, y + 20, 10);
      } else {
        fluidRef.current?.move(x, y);
      }
    },
    [isMobile],
  );

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  useEffect(() => {
    const onPointerMove = (event: MouseEvent) => {
      if (event.isTrusted) {
        mx.set(-event.clientX / window.innerWidth);
        my.set(-event.clientY / window.innerHeight);

        splatCanvas(event.clientX, event.clientY);
      }
    };

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [mx, my, splatCanvas]);

  useMotionValueEvent(mx, "change", (v) => {
    document.documentElement.style.setProperty("--mx", v.toFixed(2));
  });

  useMotionValueEvent(my, "change", (v) => {
    document.documentElement.style.setProperty("--my", v.toFixed(2));
  });

  const fluidTextSpace = " ".repeat(Math.floor(window.innerWidth / 100));

  return (
    <div className={`fixed inset-0 overflow-hidden ${showVoid ? "z-10" : "-z-10"}`}>
      {showVoid && <Void />}

      {showFLuid && (
        <div className="absolute inset-0 opacity-100" title="bun add @jayf0x/fluidity-js">
          <FluidText
            // workerEnabled={true}
            mouseEnabled={false}
            ref={fluidRef}
            text={showChickenEgg ? `🐔${fluidTextSpace}<3/>${fluidTextSpace}🥚` : ""}
            // densityDissipation={0.995}
            // velocityDissipation={0.994}
            waterColor="#020a10"
            glowColor="#301045"
            // shine={isFluidHighQuality ? 0.1 : 0.5}
            splatRadius={0.05}
            specularExp={6}
            pressureIterations={3}
            // pixelRatio={isFluidHighQuality ? 0.5 : 0.3}
            // simResolution={0.5}
            // curl={0.2}
            fontSize={120}
            fontFamily="Ubuntu"
            // algorithm="aurora"
            // style={{
            //   filter: "grayscale(0.5)",
            // }}
          />
        </div>
      )}

      <div className="blob absolute -left-40 -top-40 h-125 w-125 rounded-full bg-linear-to-br from-accent to-(--c-8b5cf6) opacity-[0.1] blur-3xl" />
      <div className="blob absolute -bottom-40 -right-40 h-105 w-105 rounded-full bg-linear-to-tr from-accent to-(--c-8b5cf6) opacity-[0.1] blur-3xl [animation-delay:3s]" />
    </div>
  );
};

const Void = () => {
  const fluidRef = useRef<FluidHandle>(null);

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      <div
        className="rounded-[100%] lg:size-[70vw] sm:size-full overflow-hidden relative"
        style={{
          background: "radial-gradient(circle at 100%, var(--bg)a, #fff0 50%)",
        }}
      >
        <FluidText
          ref={fluidRef}
          text="<2&/>"
          fontSize={200}
          densityDissipation={1}
          velocityDissipation={0.9}
          waterColor={"#000508"}
          glowColor={"#fee"}
          curl={0.3}
          shine={0.5}
          splatRadius={0.01}
          splatForce={3}
          specularExp={0.3}
          refraction={0}
          backgroundColor="radial-gradient(circle at 100%, var(--bg)a, #fff0 50%)"
          style={{
            filter: "grayscale(0.4)",
            opacity: 0.9,
          }}
        />
        <div
          className="absolute z-10 w-full h-full inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #fff0,  var(--bg) 50%, var(--bg) 100%)",
          }}
        ></div>
      </div>
    </div>
  );
};
