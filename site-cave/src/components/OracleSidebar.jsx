import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import {
  Clock,
  Cpu,
  EyeOff,
  Folder,
  Minimize2,
  Share2,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { clearAllSizes, useFloatResize } from '../hooks/useFloatResize';
import { historyAtom, selectedProjectAtom, sidebarOpenAtom } from '../store/cave';
import { ProjectSearch } from './ProjectSearch';

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/** Hairline divider */
const Divider = ({ className = '' }) => <div className={`bg-white-dim mx-5 h-px ${className}`} />;

/** Icon + label section header with generous spacing */
const SectionHeader = ({ icon, children, aside }) => (
  <div className="flex items-center gap-2 px-5 pt-5 pb-2">
    <span className="text-ink-ghost/40 shrink-0">{icon}</span>
    <span className="text-micro tracking-ultra text-ink-ghost/60 flex-1 font-mono uppercase">
      {children}
    </span>
    {aside && <span className="text-micro text-secondary/50 tracking-fine font-mono">{aside}</span>}
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
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="flex gap-3 px-5 py-3"
    >
      {/* Thumbnail */}
      <div className="bg-white-ghost border-white-dim h-[38px] w-[38px] shrink-0 overflow-hidden rounded-lg border">
        {url && <img src={url} alt="" className="h-full w-full object-cover opacity-80" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-ink-ghost/50 tracking-loose text-micro mb-[3px] font-mono">
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

  const { size, startResize } = useFloatResize('sidebar', { width: 300 }, { minW: 220, maxW: 520 });

  useEffect(() => {
    if (!open) return;
    const onMousedown = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest('[data-oracle-widget]')
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMousedown);
    return () => document.removeEventListener('mousedown', onMousedown);
  }, [open, setOpen]);

  const reversed = [...history].reverse();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 38,
            mass: 0.9,
          }}
          style={{ width: size.width }}
          className="z-sidebar bg-overlay-mid shadow-sidebar backdrop-blur-high fixed inset-y-0 left-0 flex h-screen flex-col overflow-hidden backdrop-saturate-[160%]"
        >
          {/* Right-edge resize handle */}
          <div
            onMouseDown={(e) => startResize(e, { e: true })}
            className="group absolute inset-y-0 right-0 z-10 w-[5px] cursor-ew-resize"
          >
            <div className="bg-white-dim absolute inset-y-0 right-0 w-px opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
          </div>

          {/* ── Header ── */}
          <div className="relative flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="oracle-live-dot bg-secondary inline-block h-[4px] w-[4px] shrink-0 rounded-full" />
              <span className="tracking-ultra text-ink-ghost/70 text-micro font-mono uppercase">
                Oracle
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-ghost/50 hover:text-ink-muted hover:bg-white-dim flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition-colors duration-150 outline-none"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>

          <Divider />

          {/* ── AI Status ── */}
          <div className="flex shrink-0 items-center gap-3 px-5 py-4">
            <Cpu size={12} className="text-ink-ghost/35 shrink-0" />
            <span className="text-label text-ink-ghost/55 tracking-loose font-mono">idle</span>
            <span
              className="text-micro text-ink-ghost/20 tracking-fine ml-auto font-mono"
              title="Live polling in Stage 9b"
            >
              stage 9b
            </span>
          </div>

          <Divider />

          {/* ── Project ── */}
          <SectionHeader icon={<Folder size={11} />} aside={selected?.name}>
            Project
          </SectionHeader>

          <div className="shrink-0">
            <ProjectSearch listMaxHeight="156px" />
          </div>

          <Divider className="mt-1" />

          {/* ── Memory controls ── */}
          <SectionHeader icon={<SlidersHorizontal size={11} />}>Controls</SectionHeader>

          <div className="flex shrink-0 flex-wrap gap-2 px-5 pb-4">
            <ControlButton icon={<Trash2 size={10} />} label="Clear" />
            <ControlButton icon={<EyeOff size={10} />} label="Disable" />
            <ControlButton icon={<Share2 size={10} />} label="Share" />
            <button
              onClick={clearAllSizes}
              title="Reset all panel sizes to defaults"
              className="border-white-dim bg-white-ghost text-micro tracking-fine text-ink-ghost/50 hover:border-secondary/30 hover:text-secondary/70 flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 font-mono transition-colors"
            >
              <Minimize2 size={10} />
              Clear Sizes
            </button>
          </div>

          <Divider />

          {/* ── Memory list ── */}
          <SectionHeader
            icon={<Clock size={11} />}
            aside={reversed.length > 0 ? String(reversed.length) : undefined}
          >
            Memory
          </SectionHeader>

          <div className="oracle-scroll min-h-0 flex-1 overflow-y-auto">
            {reversed.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-ink-ghost/40 tracking-fine px-5 py-6 text-xs leading-[1.8] italic"
              >
                The cave has not yet spoken.
              </motion.p>
            ) : (
              reversed.map((entry) => <HistoryRow key={entry.id} entry={entry} />)
            )}
          </div>

          {/* Bottom edge line */}
          <div className="bg-white-ghost h-px shrink-0" />
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
      className="border-white-dim bg-white-ghost text-micro tracking-fine text-ink-ghost/30 flex cursor-not-allowed items-center gap-1.5 rounded-lg border px-3 py-2 font-mono transition-opacity"
    >
      {icon}
      {label}
    </button>
  );
}
