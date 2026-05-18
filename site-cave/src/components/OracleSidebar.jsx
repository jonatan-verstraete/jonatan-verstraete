import { useRef, useEffect, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { historyAtom, sidebarOpenAtom } from "../store/cave";

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
};

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
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="relative flex gap-3 pt-[14px] pr-5 pb-[14px] pl-7 after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-px after:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.055)_30%,rgba(255,255,255,0.055)_70%,transparent)]"
    >
      {/* timeline accent bar */}
      <div className="absolute left-4 top-[18px] w-[3px] h-[calc(100%-28px)] rounded-sm bg-gradient-to-b from-secondary-border to-transparent shrink-0" />

      <div className="shrink-0 w-[46px] h-[46px] rounded-lg overflow-hidden bg-white-ghost shadow-inset">
        {url && (
          <img src={url} alt="" className="w-full h-full object-cover opacity-[0.88]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono text-secondary opacity-60 mb-[5px] tracking-loose">
          {formatTime(entry.timestamp)}
        </div>
        <div className="text-xs text-ink/75 leading-[1.65] line-clamp-3 tracking-fine">
          {entry.description}
        </div>
      </div>
    </motion.div>
  );
};

export const OracleSidebar = () => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);
  const history = useAtomValue(historyAtom);
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
          transition={{ type: "spring", stiffness: 340, damping: 40, mass: 0.85 }}
          className="fixed inset-y-0 left-0 w-[300px] z-sidebar flex flex-col bg-overlay-mid backdrop-blur-[36px] backdrop-saturate-[170%] shadow-sidebar overflow-hidden"
        >
          {/* header */}
          <div className="relative flex items-center justify-between pt-5 pr-5 pb-[18px] pl-6 shrink-0">
            {/* header bottom separator */}
            <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-secondary-border via-primary/15 to-transparent" />

            <div className="flex items-center gap-[10px]">
              <span className="oracle-live-dot inline-block w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              <span className="text-[10px] font-mono tracking-ultra uppercase text-ink-muted">
                Oracle Memory
              </span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="relative w-7 h-7 rounded-full border border-white-subtle bg-white-ghost text-ink-muted flex items-center justify-center cursor-pointer outline-none shrink-0 transition-all duration-200 hover:bg-primary-muted/80 hover:text-ink hover:shadow-[0_0_0_1px_rgba(170,59,255,0.40),_0_0_10px_rgba(170,59,255,0.12)] hover:border-transparent"
            >
              <X size={12} strokeWidth={1.6} />
            </button>
          </div>

          {/* count badge */}
          {reversed.length > 0 && (
            <div className="px-6 py-[7px] shrink-0">
              <span className="text-[10px] font-mono text-secondary opacity-[0.38] tracking-[0.06em]">
                {reversed.length} {reversed.length === 1 ? "entry" : "entries"}
              </span>
            </div>
          )}

          {/* list */}
          <div className="flex-1 overflow-y-auto pb-5 oracle-scroll">
            {reversed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="px-6 py-9 text-xs text-ink-ghost italic leading-[1.8] tracking-[0.02em]"
              >
                The cave has not yet spoken.
              </motion.div>
            ) : (
              reversed.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} />
              ))
            )}
          </div>

          {/* bottom accent shimmer */}
          <div className="h-px shrink-0 bg-gradient-to-r from-secondary-border via-primary/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
