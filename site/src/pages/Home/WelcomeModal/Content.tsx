import { InfoPopover } from "@/components/InfoPopover";
import { useIsMobile } from "@/hooks/useDevice";
import { Info, SlidersHorizontal } from "lucide-react";
import Xarrow, { Xwrapper } from "react-xarrows";

export const CardContent = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6 pb-5">
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--border-a40)" }}
      >
        A portfolio meets playground — here's a quick look at what's on the
        page.
      </p>

      <Xwrapper>
        <div className="relative">
          <p
            className="text-[9px] font-mono tracking-[0.22em] uppercase mb-4"
            style={{ color: "var(--overlay-lg)" }}
          >
            Page guide
          </p>

          <div className="flex items-start gap-6">
            {/* Descriptions */}
            <div className="flex-1 space-y-6">
              <div id="gd-slider" className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--accent)",
                  }}
                >
                  <SlidersHorizontal size={13} strokeWidth={1.5} />
                </span>
                <div>
                  <p
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "var(--border-a70)" }}
                  >
                    Temperature slider
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--border-a35)" }}
                  >
                    Controls how much is shown — from a clean minimal view to
                    the full experience.
                  </p>
                </div>
              </div>

              <div id="gd-chat" className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-sm select-none"
                  style={{ background: "var(--purple-dim)" }}
                >
                  🤖
                </span>
                <div>
                  <p
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "var(--border-a70)" }}
                  >
                    GPT-1 Chat
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--border-a35)" }}
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
                    background: "var(--overlay-sm)",
                    color: "var(--border-a35)",
                  }}
                >
                  <Info size={13} strokeWidth={1.5} />
                </span>
                <div>
                  <div
                    className="text-[13px] font-medium mb-1 flex items-center gap-1.5 flex-wrap"
                    style={{ color: "var(--border-a70)" }}
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
                    style={{ color: "var(--border-a35)" }}
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
                  border: "1px solid var(--border)",
                  background: "var(--overlay-xs)",
                }}
              >
                {/* Skeleton content */}
                <div className="p-3 space-y-2">
                  <div
                    className="h-2.5 w-10 rounded-full mx-auto"
                    style={{ background: "var(--border)" }}
                  />
                  <div
                    className="h-1 w-16 rounded-full mx-auto"
                    style={{ background: "var(--overlay-xs)" }}
                  />
                  <div
                    className="h-1 w-14 rounded-full mx-auto"
                    style={{ background: "var(--overlay-xs)" }}
                  />
                  <div className="mt-3 space-y-1">
                    <div
                      className="h-1 w-full rounded-full"
                      style={{ background: "var(--overlay-xs)" }}
                    />
                    <div
                      className="h-1 w-5/6 rounded-full"
                      style={{ background: "var(--overlay-xs)" }}
                    />
                  </div>
                </div>

                {/* Widget stack — mirrors real bottom-right position */}
                <div className="absolute bottom-2 right-2 flex flex-col gap-1.5">
                  <div
                    id="gd-slider-w"
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--accent-glow)",
                      border: "1px solid var(--accent-a28)",
                      color: "var(--accent)",
                    }}
                  >
                    <SlidersHorizontal size={13} strokeWidth={1.5} />
                  </div>
                  <div
                    id="gd-chat-w"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm select-none"
                    style={{
                      background: "var(--purple-dim)",
                      border: "1px solid var(--purple-border)",
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
