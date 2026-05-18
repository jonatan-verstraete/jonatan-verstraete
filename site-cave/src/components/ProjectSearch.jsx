import { useState, useEffect, useRef } from "react";
import { Search, FolderOpen, X } from "lucide-react";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { selectedProjectAtom } from "../store/cave";

const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;

async function fetchProjects() {
  return [];
  if (!GITHUB_USER) return [];
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated&type=public`,
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const repos = await res.json();
  return repos
    .filter((r) => !r.fork && r.description)
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || "",
      topics: r.topics || [],
      language: r.language || "",
      html_url: r.html_url,
    }));
}

/**
 * Layout-agnostic project search + select.
 * Callers provide background/width via className.
 *
 * Props:
 *   onSelect(project) — called when user picks a project
 *   onClose()         — called on Escape (optional)
 *   autoFocus         — focus input on mount (default false)
 *   listMaxHeight     — max-height of results list (default "180px")
 */
export function ProjectSearch({
  onSelect,
  onClose,
  autoFocus = false,
  listMaxHeight = "180px",
}) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);
  const [selected, setSelected] = useAtom(selectedProjectAtom);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["github-repos", GITHUB_USER ?? "__fallback__"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
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
    if (autoFocus) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!hasFocus && !autoFocus) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
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
          onSelect?.(filtered[activeIdx]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasFocus, autoFocus, filtered, activeIdx, setSelected, onSelect, onClose]);

  useEffect(() => {
    listRef.current?.children[activeIdx]?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  return (
    <div
      ref={containerRef}
      onFocus={() => setHasFocus(true)}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) {
          setHasFocus(false);
        }
      }}
    >
      {/* Search input row */}
      <div className="flex items-center gap-2.5 px-4 py-[9px]">
        <Search size={12} className="text-ink-ghost shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects…"
          className="text-label flex-1 border-0 bg-transparent font-mono tracking-fine text-ink/70 placeholder:text-ink-ghost outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-ink-ghost flex cursor-pointer border-0 bg-transparent p-0 transition-colors hover:text-ink-muted"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Results list */}
      <div
        ref={listRef}
        className="oracle-scroll overflow-y-auto"
        style={{ maxHeight: listMaxHeight }}
      >
        {filtered.length === 0 ? (
          <div className="text-ink-ghost text-label px-4 py-4 text-center font-mono">
            {projects.length === 0 ? "No projects" : "No matches"}
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
                onSelect?.(project);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProjectRow({ project, active, selected, onHover, onClick }) {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      className={[
        "relative flex w-full items-start gap-2.5 px-4 py-[8px]",
        "cursor-pointer border-0 text-left transition-colors duration-100",
        active ? "bg-primary-muted/60" : "bg-transparent",
      ].join(" ")}
    >
      {active && (
        <div className="bg-primary absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-[1px]" />
      )}

      <FolderOpen
        size={12}
        className={[
          "mt-0.5 shrink-0",
          selected
            ? "text-secondary"
            : active
              ? "text-primary"
              : "text-ink-ghost",
        ].join(" ")}
      />

      <div className="min-w-0 flex-1">
        <div
          className={[
            "text-label mb-0.5 font-mono",
            selected ? "text-secondary" : "text-ink/75",
          ].join(" ")}
        >
          {project.name}
        </div>
        {project.description && (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] text-ink-ghost">
            {project.description}
          </div>
        )}
      </div>

      {project.language && (
        <span className="shrink-0 pt-0.5 font-mono text-[10px] text-ink-ghost/60">
          {project.language}
        </span>
      )}
    </button>
  );
}
