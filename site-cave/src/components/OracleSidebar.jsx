import { useRef, useEffect, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, EyeOff, Share2, Cpu, Folder, SlidersHorizontal, Clock } from "lucide-react";
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

/** Hairline divider */
const Divider = ({ className = "" }) => (
  <div className={`mx-5 h-px bg-white/[0.04] ${className}`} />
);

/** Icon + label section header with generous spacing */
const SectionHeader = ({ icon, children, aside }) => (
  <div className="flex items-center gap-2 px-5 pt-5 pb-2">
    <span className="text-ink-ghost/40 shrink-0">{icon}</span>
    <span className="text-micro tracking-ultra text-ink-ghost/60 font-mono uppercase flex-1">
      {children}
    </span>
    {aside && (
      <span className="text-micro font-mono text-secondary/50 tracking-fine">{aside}</span>
    )}
  </div>
);

const HistoryRow = ({ entry }) => {
  const url = useMemo(
    () => (entry.imageBlob ? URL.createObjectURL(entry.imageBlob) : null),
    [entry.imageBlob],
  );

  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [url]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex gap-3 px-5 py-3"
    >
      {/* Thumbnail */}
      <div className="h-[38px] w-[38px] shrink-0 overflow-hidden rounded-lg bg-white/[0.03] border border-white/[0.05]">
        {url && (
          <img src={url} alt="" className="h-full w-full object-cover opacity-80" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-ink-ghost/50 tracking-loose mb-[3px] font-mono text-[10px]">
          {formatTime(entry.timestamp)}
        </div>
        <div className="text-ink/55 tracking-fine line-clamp-3 text-xs leading-[1.65]">
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
          transition={{ type: "spring", stiffness: 320, damping: 38, mass: 0.9 }}
          className="z-sidebar bg-overlay-mid shadow-sidebar fixed inset-y-0 left-0 flex h-screen w-[300px] flex-col overflow-hidden backdrop-blur-[40px] backdrop-saturate-[160%]"
        >

          {/* ── Header ── */}
          <div className="relative flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="oracle-live-dot inline-block h-[4px] w-[4px] shrink-0 rounded-full bg-secondary" />
              <span className="tracking-ultra text-ink-ghost/70 font-mono text-[10px] uppercase">
                Oracle
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-ghost/50 hover:text-ink-muted flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition-colors duration-150 outline-none hover:bg-white/[0.05]"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>

          <Divider />

          {/* ── AI Status ── */}
          <div className="shrink-0 flex items-center gap-3 px-5 py-4">
            <Cpu size={12} className="text-ink-ghost/35 shrink-0" />
            <span className="text-label font-mono text-ink-ghost/55 tracking-loose">idle</span>
            <span className="text-micro font-mono text-ink-ghost/20 ml-auto tracking-fine" title="Live polling in Stage 9b">
              stage 9b
            </span>
          </div>

          <Divider />

          {/* ── Project ── */}
          <SectionHeader
            icon={<Folder size={11} />}
            aside={selected?.name}
          >
            Project
          </SectionHeader>

          <div className="shrink-0">
            <ProjectSearch listMaxHeight="156px" />
          </div>

          <Divider className="mt-1" />

          {/* ── Memory controls ── */}
          <SectionHeader icon={<SlidersHorizontal size={11} />}>
            Controls
          </SectionHeader>

          <div className="shrink-0 flex gap-2 px-5 pb-4">
            <ControlButton icon={<Trash2 size={10} />} label="Clear" />
            <ControlButton icon={<EyeOff size={10} />} label="Disable" />
            <ControlButton icon={<Share2 size={10} />} label="Share" />
          </div>

          <Divider />

          {/* ── Memory list ── */}
          <SectionHeader
            icon={<Clock size={11} />}
            aside={reversed.length > 0 ? String(reversed.length) : undefined}
          >
            Memory
          </SectionHeader>

          <div className="oracle-scroll flex-1 min-h-0 overflow-y-auto">
            {reversed.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-ink-ghost/40 px-5 py-6 text-xs leading-[1.8] italic tracking-fine"
              >
                The cave has not yet spoken.
              </motion.p>
            ) : (
              reversed.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} />
              ))
            )}
          </div>

          {/* Bottom edge line */}
          <div className="h-px shrink-0 bg-white/[0.03]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function ControlButton({ icon, label }) {
  return (
    <button
      disabled
      title="Coming in Stage 9d"
      className="flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 font-mono text-[10px] tracking-fine text-ink-ghost/30 transition-opacity"
    >
      {icon}
      {label}
    </button>
  );
}
