import { useRef, useEffect, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, EyeOff, Share2, Layers } from "lucide-react";
import { historyAtom, sidebarOpenAtom, selectedProjectAtom } from "../store/cave";
import { ProjectSearch } from "./ProjectSearch";

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

/** Thin horizontal section divider */
const Divider = () => (
  <div className="from-secondary-border via-primary/10 mx-5 h-px bg-gradient-to-r to-transparent" />
);

/** Uppercase micro section label */
const SectionLabel = ({ children }) => (
  <div className="text-micro tracking-ultra text-ink-ghost font-mono uppercase">
    {children}
  </div>
);

const HistoryRow = ({ entry }) => {
  const url = useMemo(
    () => (entry.imageBlob ? URL.createObjectURL(entry.imageBlob) : null),
    [entry.imageBlob],
  );

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="relative flex gap-3 px-5 py-[12px] after:absolute after:right-5 after:bottom-0 after:left-5 after:h-px after:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.04)_40%,rgba(255,255,255,0.04)_60%,transparent)] after:content-['']"
    >
      {/* Timeline accent */}
      <div className="from-secondary-border absolute top-4 left-[18px] h-[calc(100%-28px)] w-[2px] shrink-0 rounded-sm bg-gradient-to-b to-transparent" />

      <div className="bg-white-ghost shadow-inset ml-3 h-[40px] w-[40px] shrink-0 overflow-hidden rounded-lg">
        {url && (
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover opacity-[0.85]"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-ink-ghost tracking-loose mb-[4px] font-mono text-[10px]">
          {formatTime(entry.timestamp)}
        </div>
        <div className="text-ink/65 tracking-fine line-clamp-3 text-xs leading-[1.65]">
          {entry.description}
        </div>
      </div>
    </motion.div>
  );
};

export const OracleSidebar = () => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);
  const history = useAtomValue(historyAtom);
  const selected = useAtomValue(selectedProjectAtom);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onMousedown = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest("[data-oracle-widget]")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMousedown);
    return () => document.removeEventListener("mousedown", onMousedown);
  }, [open, setOpen]);

  const reversed = [...history].reverse();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 340,
            damping: 40,
            mass: 0.85,
          }}
          className="z-sidebar bg-overlay-mid shadow-sidebar fixed inset-y-0 left-0 flex w-[320px] flex-col overflow-hidden backdrop-blur-[36px] backdrop-saturate-[170%]"
        >
          {/* ── Header ── */}
          <div className="relative flex shrink-0 items-center justify-between px-5 pt-5 pb-[14px]">
            <div className="from-secondary-border via-primary/12 absolute right-4 bottom-0 left-4 h-px bg-gradient-to-r to-transparent" />
            <div className="flex items-center gap-[9px]">
              <span className="oracle-live-dot bg-secondary inline-block h-1.5 w-1.5 shrink-0 rounded-full" />
              <span className="tracking-ultra text-ink-muted font-mono text-[10px] uppercase">
                Oracle
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="border-white-subtle bg-white-ghost text-ink-muted hover:bg-primary-muted/80 hover:text-ink relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 outline-none hover:border-transparent hover:shadow-[0_0_0_1px_rgba(170,59,255,0.40),_0_0_10px_rgba(170,59,255,0.12)]"
            >
              <X size={12} strokeWidth={1.6} />
            </button>
          </div>

          {/* ── AI Status placeholder ── */}
          <div className="shrink-0 px-5 py-3">
            <div className="flex items-center gap-2.5 rounded-lg bg-white-ghost px-3 py-2">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/50" />
              <span className="text-label font-mono tracking-loose text-ink-muted">
                Oracle: idle
              </span>
              <span
                className="text-micro text-ink-ghost/40 ml-auto font-mono"
                title="Live status wired in Stage 9b"
              >
                stage 9b
              </span>
            </div>
          </div>

          <Divider />

          {/* ── Project ── */}
          <div className="shrink-0 px-5 pt-3 pb-1">
            <div className="flex items-center justify-between">
              <SectionLabel>Project</SectionLabel>
              {selected && (
                <span className="text-micro text-secondary/70 font-mono tracking-fine">
                  {selected.name}
                </span>
              )}
            </div>
          </div>

          {/* Project search — inline, layout-agnostic */}
          <div className="shrink-0">
            <ProjectSearch listMaxHeight="160px" />
          </div>

          <Divider />

          {/* ── History controls ── */}
          <div className="shrink-0 px-5 pt-3 pb-3">
            <SectionLabel>Memory Controls</SectionLabel>
            <div className="mt-2 flex flex-wrap gap-[6px]">
              <HistoryControlButton
                icon={<Trash2 size={10} />}
                label="Clear"
                title="Clear history — coming in Stage 9d"
              />
              <HistoryControlButton
                icon={<EyeOff size={10} />}
                label="Disable memory"
                title="Disable shadow memory — coming in Stage 9d"
              />
              <HistoryControlButton
                icon={<Share2 size={10} />}
                label="Share"
                title="Share memory — coming in Stage 9d"
              />
            </div>
          </div>

          <Divider />

          {/* ── Memory / history list ── */}
          <div className="shrink-0 flex items-center justify-between px-5 pt-3 pb-1">
            <SectionLabel>Memory</SectionLabel>
            {reversed.length > 0 && (
              <span className="text-micro text-ink-ghost/50 font-mono">
                {reversed.length}
              </span>
            )}
          </div>

          <div className="oracle-scroll flex-1 overflow-y-auto pb-4">
            {reversed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-ink-ghost px-5 py-6 text-xs leading-[1.8] tracking-[0.02em] italic"
              >
                The cave has not yet spoken.
              </motion.div>
            ) : (
              reversed.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} />
              ))
            )}
          </div>

          {/* Bottom shimmer */}
          <div className="from-secondary-border via-primary/20 h-px shrink-0 bg-gradient-to-r to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function HistoryControlButton({ icon, label, title }) {
  return (
    <button
      disabled
      title={title}
      className="flex cursor-not-allowed items-center gap-1.5 rounded-md bg-white-ghost px-2.5 py-1.5 font-mono text-[10px] tracking-fine text-ink-ghost opacity-40 transition-opacity"
    >
      {icon}
      {label}
    </button>
  );
}
