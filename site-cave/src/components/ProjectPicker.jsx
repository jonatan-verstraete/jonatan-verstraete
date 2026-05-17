import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FolderOpen, X } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { selectedProjectAtom, pickerOpenAtom } from "../store/cave";
import { fetchProjects, FALLBACK_PROJECTS } from "../data/projects";

const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;

export const ProjectPicker = () => {
  const [open, setOpen]   = useAtom(pickerOpenAtom);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [selected, setSelected]   = useAtom(selectedProjectAtom);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const { data: projects = FALLBACK_PROJECTS } = useQuery({
    queryKey:  ["github-repos", GITHUB_USER ?? "__fallback__"],
    queryFn:   fetchProjects,
    staleTime: 5 * 60 * 1000,
    enabled:   !!GITHUB_USER,
  });

  const filtered = query.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()) ||
          p.topics?.some((t) => t.toLowerCase().includes(query.toLowerCase())),
      )
    : projects;

  // Reset index when query changes
  useEffect(() => { setActiveIdx(0); }, [query]);

  // Focus input when opening, clear state when closing
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    } else {
      setQuery("");
      setActiveIdx(0);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); return; }
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

  // Scroll active item into view
  useEffect(() => {
    listRef.current?.children[activeIdx]?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  // Click outside to close
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
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
          style={{
            position:       "fixed",
            bottom:         88,
            left:           "50%",
            transform:      "translateX(-50%)",
            width:          "min(480px, 90vw)",
            zIndex:         70,
            background:     "rgba(8,6,13,0.93)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius:   14,
            boxShadow:
              "0 8px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.055)",
            overflow:       "hidden",
            fontFamily:     "system-ui, sans-serif",
          }}
        >
          {/* Search row */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            padding:      "13px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <Search size={13} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              style={{
                flex:        1,
                background:  "none",
                border:      "none",
                outline:     "none",
                color:       "rgba(255,255,255,0.82)",
                fontSize:    13,
                letterSpacing: "0.01em",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  background: "none",
                  border:     "none",
                  cursor:     "pointer",
                  color:      "rgba(255,255,255,0.28)",
                  padding:    0,
                  display:    "flex",
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Project list */}
          <div
            ref={listRef}
            className="oracle-scroll"
            style={{ maxHeight: 320, overflowY: "auto" }}
          >
            {filtered.length === 0 ? (
              <div style={{
                padding:   "24px 16px",
                textAlign: "center",
                color:     "rgba(255,255,255,0.22)",
                fontSize:  13,
              }}>
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
          <div style={{
            padding:    "8px 16px",
            borderTop:  "1px solid rgba(255,255,255,0.04)",
            display:    "flex",
            gap:        18,
            color:      "rgba(255,255,255,0.18)",
            fontSize:   11,
            fontFamily: "ui-monospace, monospace",
          }}>
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
            {GITHUB_USER && (
              <span style={{ marginLeft: "auto" }}>@{GITHUB_USER}</span>
            )}
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
    style={{
      display:    "flex",
      alignItems: "flex-start",
      gap:        12,
      width:      "100%",
      padding:    "11px 16px",
      background: active ? "rgba(170,59,255,0.08)" : "transparent",
      border:     "none",
      cursor:     "pointer",
      textAlign:  "left",
      transition: "background 0.1s",
      position:   "relative",
    }}
  >
    {/* Active bar */}
    {active && (
      <div style={{
        position:     "absolute",
        left:         0,
        top:          6,
        bottom:       6,
        width:        2,
        borderRadius: 1,
        background:   "var(--primary)",
      }} />
    )}

    <FolderOpen
      size={13}
      style={{
        marginTop: 2,
        flexShrink: 0,
        color: selected
          ? "var(--secondary)"
          : active
          ? "var(--primary)"
          : "rgba(255,255,255,0.22)",
      }}
    />

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize:    13,
        fontWeight:  500,
        color:       selected ? "var(--secondary)" : "rgba(255,255,255,0.8)",
        fontFamily:  "ui-monospace, monospace",
        marginBottom: 2,
      }}>
        {project.name}
      </div>
      {project.description && (
        <div style={{
          fontSize:     12,
          color:        "rgba(255,255,255,0.32)",
          lineHeight:   1.4,
          whiteSpace:   "nowrap",
          overflow:     "hidden",
          textOverflow: "ellipsis",
        }}>
          {project.description}
        </div>
      )}
    </div>

    {project.language && (
      <span style={{
        flexShrink:  0,
        fontSize:    10,
        color:       "rgba(255,255,255,0.18)",
        fontFamily:  "ui-monospace, monospace",
        paddingTop:  2,
      }}>
        {project.language}
      </span>
    )}
  </button>
);
