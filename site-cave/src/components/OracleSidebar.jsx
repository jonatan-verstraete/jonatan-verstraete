import { useRef, useEffect, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { historyAtom, sidebarOpenAtom } from "../store/cave";

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

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
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="relative flex gap-3 pt-[14px] pr-5 pb-[14px] pl-7 after:absolute after:right-5 after:bottom-0 after:left-5 after:h-px after:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.055)_30%,rgba(255,255,255,0.055)_70%,transparent)] after:content-['']"
    >
      {/* timeline accent bar */}
      <div className="from-secondary-border absolute top-[18px] left-4 h-[calc(100%-28px)] w-[3px] shrink-0 rounded-sm bg-gradient-to-b to-transparent" />

      <div className="bg-white-ghost shadow-inset h-[46px] w-[46px] shrink-0 overflow-hidden rounded-lg">
        {url && (
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover opacity-[0.88]"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-secondary tracking-loose mb-[5px] font-mono text-[10px] opacity-60">
          {formatTime(entry.timestamp)}
        </div>
        <div className="text-ink/75 tracking-fine line-clamp-3 text-xs leading-[1.65]">
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
          transition={{
            type: "spring",
            stiffness: 340,
            damping: 40,
            mass: 0.85,
          }}
          className="z-sidebar bg-overlay-mid shadow-sidebar fixed inset-y-0 left-0 flex w-[300px] flex-col overflow-hidden backdrop-blur-[36px] backdrop-saturate-[170%]"
        >
          {/* header */}
          <div className="relative flex shrink-0 items-center justify-between pt-5 pr-5 pb-[18px] pl-6">
            {/* header bottom separator */}
            <div className="from-secondary-border via-primary/15 absolute right-4 bottom-0 left-4 h-px bg-gradient-to-r to-transparent" />

            <div className="flex items-center gap-[10px]">
              <span className="oracle-live-dot bg-secondary inline-block h-1.5 w-1.5 shrink-0 rounded-full" />
              <span className="tracking-ultra text-ink-muted font-mono text-[10px] uppercase">
                Oracle Memory
              </span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="border-white-subtle bg-white-ghost text-ink-muted hover:bg-primary-muted/80 hover:text-ink relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 outline-none hover:border-transparent hover:shadow-[0_0_0_1px_rgba(170,59,255,0.40),_0_0_10px_rgba(170,59,255,0.12)]"
            >
              <X size={12} strokeWidth={1.6} />
            </button>
          </div>

          {/* count badge */}
          {reversed.length > 0 && (
            <div className="shrink-0 px-6 py-[7px]">
              <span className="text-secondary font-mono text-[10px] tracking-[0.06em] opacity-[0.38]">
                {reversed.length} {reversed.length === 1 ? "entry" : "entries"}
              </span>
            </div>
          )}

          {/* list */}
          <div className="oracle-scroll flex-1 overflow-y-auto pb-5">
            {reversed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-ink-ghost px-6 py-9 text-xs leading-[1.8] tracking-[0.02em] italic"
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
          <div className="from-secondary-border via-primary/20 h-px shrink-0 bg-gradient-to-r to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
