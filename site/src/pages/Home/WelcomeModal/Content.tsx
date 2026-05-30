import { InfoPopover } from "@/components/InfoPopover";
import { useIsMobile } from "@/hooks/useDevice";
import { Info, SlidersHorizontal } from "lucide-react";
import Xarrow, { Xwrapper } from "react-xarrows";

const BLUE = "rgba(79,124,255,1)";
const BLUE_DIM = "rgba(79,124,255,0.14)";
const BLUE_BORDER = "rgba(79,124,255,0.28)";

const PURPLE_DIM = "rgba(168,85,247,0.14)";
const PURPLE_BORDER = "rgba(168,85,247,0.28)";

export const CardContent = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6 pb-5">
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(255,255,255,0.42)" }}
      >
        A portfolio meets playground — here's a quick look at what's on the
        page.
      </p>

      <Xwrapper>
        <div className="relative">
          <p
            className="text-[9px] font-mono tracking-[0.22em] uppercase mb-4"
            style={{ color: "rgba(255,255,255,0.18)" }}
          >
            Page guide
          </p>

          <div className="flex items-start gap-6">
            {/* Descriptions */}
            <div className="flex-1 space-y-6">
              <div id="gd-slider" className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: BLUE_DIM, color: BLUE }}
                >
                  <SlidersHorizontal size={13} strokeWidth={1.5} />
                </span>
                <div>
                  <p
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    Temperature slider
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Controls how much is shown — from a clean minimal view to
                    the full experience.
                  </p>
                </div>
              </div>

              <div id="gd-chat" className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-sm select-none"
                  style={{ background: PURPLE_DIM }}
                >
                  🤖
                </span>
                <div>
                  <p
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    GPT-1 Chat
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Say hello to the original 2018 OpenAI model — historically
                    quirky by design.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  <Info size={13} strokeWidth={1.5} />
                </span>
                <div>
                  <div
                    className="text-[13px] font-medium mb-1 flex items-center gap-1.5 flex-wrap"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    Info popovers
                    <InfoPopover
                      items={[
                        ["Like this one!"],
                        ["They link to extra context or sources"],
                      ]}
                    />
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    The ℹ buttons scattered around reveal context or linked
                    sources.
                  </p>
                </div>
              </div>
            </div>

            {/* Mini page preview (desktop only) */}
            {!isMobile && (
              <div
                className="shrink-0 relative rounded-xl overflow-hidden"
                style={{
                  width: 116,
                  height: 156,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                {/* Skeleton content */}
                <div className="p-3 space-y-2">
                  <div
                    className="h-2.5 w-10 rounded-full mx-auto"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  />
                  <div
                    className="h-1 w-16 rounded-full mx-auto"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                  <div
                    className="h-1 w-14 rounded-full mx-auto"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                  <div className="mt-3 space-y-1">
                    <div
                      className="h-1 w-full rounded-full"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    />
                    <div
                      className="h-1 w-5/6 rounded-full"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    />
                  </div>
                </div>

                {/* Widget stack — mirrors real bottom-right position */}
                <div className="absolute bottom-2 right-2 flex flex-col gap-1.5">
                  <div
                    id="gd-slider-w"
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: BLUE_DIM,
                      border: `1px solid ${BLUE_BORDER}`,
                      color: BLUE,
                    }}
                  >
                    <SlidersHorizontal size={13} strokeWidth={1.5} />
                  </div>
                  <div
                    id="gd-chat-w"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm select-none"
                    style={{
                      background: PURPLE_DIM,
                      border: `1px solid ${PURPLE_BORDER}`,
                    }}
                  >
                    🤖
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Xarrows — desktop only */}
          {!isMobile && (
            <>
              <Xarrow
                start="gd-slider"
                end="gd-slider-w"
                color="rgba(79,124,255,0.4)"
                strokeWidth={1.5}
                dashness={{ strokeLen: 5, nonStrokeLen: 4, animation: 0.8 }}
                path="smooth"
                startAnchor="right"
                endAnchor="left"
                headSize={5}
              />
              <Xarrow
                start="gd-chat"
                end="gd-chat-w"
                color="rgba(168,85,247,0.4)"
                strokeWidth={1.5}
                dashness={{ strokeLen: 5, nonStrokeLen: 4, animation: 0.8 }}
                path="smooth"
                startAnchor="right"
                endAnchor="left"
                headSize={5}
              />
            </>
          )}
        </div>
      </Xwrapper>
    </div>
  );
};
