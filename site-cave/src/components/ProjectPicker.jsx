import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FolderOpen, X } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { selectedProjectAtom, pickerOpenAtom } from "../store/cave";
import { fetchProjects, FALLBACK_PROJECTS } from "../data/projects";

const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;

export const ProjectPicker = () => {
  const [open, setOpen] = useAtom(pickerOpenAtom);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [selected, setSelected] = useAtom(selectedProjectAtom);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { data: projects = FALLBACK_PROJECTS } = useQuery({
    queryKey: ["github-repos", GITHUB_USER ?? "__fallback__"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
    enabled: !!GITHUB_USER,
  });

  const filtered = query.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()) ||
          p.topics?.some((t) => t.toLowerCase().includes(query.toLowerCase())),
      )
    : projects;

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    } else {
      setQuery("");
      setActiveIdx(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        if (filtered[activeIdx]) {
          setSelected(filtered[activeIdx]);
          setOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, activeIdx, setSelected, setOpen]);

  useEffect(() => {
    listRef.current?.children[activeIdx]?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={wrapRef}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 440, damping: 36 }}
          style={{ transform: "translateX(-50%)" }}
          className="z-picker bg-overlay-high shadow-overlay fixed bottom-[88px] left-1/2 w-[min(480px,90vw)] overflow-hidden rounded-xl font-sans backdrop-blur-[20px]"
        >
          {/* Search row */}
          <div className="flex items-center gap-2.5 border-b border-white/6 px-4 py-[13px]">
            <Search size={13} className="text-white-soft shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="text-ui flex-1 border-0 bg-transparent tracking-[0.01em] text-white/80 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-white-soft flex cursor-pointer border-0 bg-transparent p-0"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Project list */}
          <div
            ref={listRef}
            className="oracle-scroll max-h-[320px] overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <div className="text-ink-ghost text-ui px-4 py-6 text-center">
                No matches
              </div>
            ) : (
              filtered.map((project, i) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  active={i === activeIdx}
                  selected={selected?.id === project.id}
                  onHover={() => setActiveIdx(i)}
                  onClick={() => {
                    setSelected(project);
                    setOpen(false);
                  }}
                />
              ))
            )}
          </div>

          {/* Keyboard hint footer */}
          <div className="border-white-ghost text-label flex gap-[18px] border-t px-4 py-2 font-mono text-white/[0.18]">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
            {GITHUB_USER && <span className="ml-auto">@{GITHUB_USER}</span>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProjectRow = ({ project, active, selected, onHover, onClick }) => (
  <button
    onMouseEnter={onHover}
    onClick={onClick}
    className={[
      "relative flex w-full items-start gap-3 px-4 py-[11px]",
      "cursor-pointer border-0 text-left transition-colors duration-100",
      active ? "bg-primary-muted/80" : "bg-transparent",
    ].join(" ")}
  >
    {/* Active bar */}
    {active && (
      <div className="bg-primary absolute top-[6px] bottom-[6px] left-0 w-0.5 rounded-[1px]" />
    )}

    <FolderOpen
      size={13}
      className={[
        "mt-0.5 shrink-0",
        selected
          ? "text-secondary"
          : active
            ? "text-primary"
            : "text-white/[0.22]",
      ].join(" ")}
    />

    <div className="min-w-0 flex-1">
      <div
        className={[
          "text-ui mb-0.5 font-mono font-medium",
          selected ? "text-secondary" : "text-white/80",
        ].join(" ")}
      >
        {project.name}
      </div>
      {project.description && (
        <div className="overflow-hidden text-xs leading-[1.4] text-ellipsis whitespace-nowrap text-white/[0.32]">
          {project.description}
        </div>
      )}
    </div>

    {project.language && (
      <span className="shrink-0 pt-0.5 font-mono text-[10px] text-white/[0.18]">
        {project.language}
      </span>
    )}
  </button>
);
