import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useSetAtom } from 'jotai';
import { FolderOpen, Search, Terminal, X } from 'lucide-react';
import { ACTIVE_COMMANDS } from '../data/commands';
import { useDebounce } from '../hooks/useDebounce';
import {
  githubUserAtom,
  pickerOpenAtom,
  selectedProjectAtom,
  sidebarOpenAtom,
} from '../store/cave';

async function fetchProjects(user) {
  if (!user) return [];
  const res = await fetch(
    `https://api.github.com/users/${user}/repos?per_page=100&sort=updated&type=public`,
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const repos = await res.json();
  return repos
    .filter((r) => !r.fork && r.description)
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      topics: r.topics || [],
      language: r.language || '',
      html_url: r.html_url,
    }));
}

export const ProjectPicker = () => {
  const [open, setOpen] = useAtom(pickerOpenAtom);
  const [selected, setSelected] = useAtom(selectedProjectAtom);
  const setSidebarOpen = useSetAtom(sidebarOpenAtom);
  const [githubUser, setGithubUser] = useAtom(githubUserAtom);

  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const debouncedQuery = useDebounce(query, 150);

  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ['github-repos', githubUser ?? '__fallback__'],
    queryFn: () => fetchProjects(githubUser),
    staleTime: 5 * 60 * 1000,
  });

  const onSearchInput = useCallback(
    (event) => {
      const value = event.target.value;
      if (query === '' && value === ' ') {
        setOpen(false);
        return;
      }
      setQuery(value);
    },
    [query],
  );

  // Space hotkey: open when closed, close when open (150ms grace after open)
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const editable = document.activeElement?.isContentEditable;
      if (tag === 'input' || tag === 'textarea' || editable) return;
      if (e.key !== ' ') return;
      setOpen((prev) => !prev);

      e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Reset + focus on open; record open timestamp
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);

      const onClickOutside = (e) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onClickOutside);
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        clearTimeout(id);
        document.removeEventListener('mousedown', onClickOutside);
      };
    }
  }, [open]);

  // Derived search state
  const trimmed = debouncedQuery.trim().toLowerCase();
  const queryWord = trimmed.split(' ')[0];

  const filteredCommands = trimmed
    ? ACTIVE_COMMANDS.filter((c) => c.label.startsWith(queryWord) || c.label.includes(queryWord))
    : ACTIVE_COMMANDS;

  const filteredProjects = trimmed
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.description?.toLowerCase().includes(trimmed) ||
          p.topics?.some((t) => t.toLowerCase().includes(trimmed)),
      )
    : projects;

  // First command whose label starts with query but isn't an exact match — autocomplete target
  const autoCmd = trimmed
    ? ACTIVE_COMMANDS.find((c) => c.label.startsWith(queryWord) && c.label !== queryWord)
    : null;

  const allItems = [
    ...filteredCommands.map((c) => ({ kind: 'command', data: c })),
    ...filteredProjects.map((p) => ({ kind: 'project', data: p })),
  ];

  const activeIdxClamped = Math.max(0, Math.min(activeIdx, allItems.length - 1));

  const executeItem = useCallback(
    (item) => {
      if (item.kind === 'project') {
        setSelected(item.data);
        setOpen(false);
        return;
      }
      const arg = debouncedQuery.trim().split(' ').slice(1).join(' ').trim();
      switch (item.data.action) {
        case 'list':
          setQuery('');
          break;
        case 'recent':
          setQuery('');
          break;
        case 'open-sidebar':
          setSidebarOpen(true);
          setOpen(false);
          break;
        case 'set-user':
          if (arg) {
            setGithubUser(arg);
            queryClient.invalidateQueries({ queryKey: ['github-repos'] });
          }
          setOpen(false);
          break;
        default:
          break;
      }
    },
    [debouncedQuery, setSelected, setOpen, setSidebarOpen, setGithubUser, queryClient],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        const item = allItems[activeIdxClamped];
        if (item) executeItem(item);
      } else if (e.key === 'Tab' && autoCmd) {
        e.preventDefault();
        setQuery(autoCmd.label + (autoCmd.param ? ' ' : ''));
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, allItems, activeIdxClamped, autoCmd, executeItem, setOpen]);

  useEffect(() => {
    setActiveIdx(0);
  }, [debouncedQuery]);

  // Scroll active row into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-row-idx="${activeIdxClamped}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdxClamped]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[69] bg-black/45"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            ref={wrapRef}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="z-picker bg-overlay-high/96 border-white-dim shadow-overlay backdrop-blur-high fixed top-[20%] left-1/2 w-[580px] max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-2xl border"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4">
              <Search size={14} className="text-ink-ghost/50 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={onSearchInput}
                placeholder="Search projects or type a command…"
                className="text-ui tracking-fine text-ink/80 placeholder:text-ink-ghost/28 min-w-0 flex-1 border-0 bg-transparent font-mono outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="text-ink-ghost/30 hover:text-ink-ghost/60 cursor-pointer border-0 bg-transparent p-0 transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            <div className="bg-white-dim h-px" />

            {/* Results */}
            <div ref={listRef} className="oracle-scroll max-h-[360px] overflow-y-auto">
              {allItems.length === 0 && (
                <p className="text-ink-ghost/30 text-label py-10 text-center font-mono">
                  {projects.length === 0 ? 'no projects loaded' : 'no matches'}
                </p>
              )}

              {filteredCommands.length > 0 && (
                <>
                  <SectionLabel>Commands</SectionLabel>
                  {filteredCommands.map((cmd, i) => {
                    const idx = i;
                    const isActive = idx === activeIdxClamped;
                    const isAutoSuggest = autoCmd?.id === cmd.id && !isActive;
                    return (
                      <PaletteRow
                        key={cmd.id}
                        rowIdx={idx}
                        active={isActive}
                        autoSuggest={isAutoSuggest}
                        onHover={() => setActiveIdx(idx)}
                        onClick={() => executeItem({ kind: 'command', data: cmd })}
                        icon={<Terminal size={10} className="text-rose-400/65" />}
                        title={cmd.param ? `${cmd.label} ${cmd.param}` : cmd.label}
                        subtitle={cmd.description}
                        pillType="command"
                        isSelected={false}
                      />
                    );
                  })}
                </>
              )}

              {filteredProjects.length > 0 && (
                <>
                  <SectionLabel>Projects</SectionLabel>
                  {filteredProjects.map((proj, i) => {
                    const idx = filteredCommands.length + i;
                    const isActive = idx === activeIdxClamped;
                    const isSelected = selected?.id === proj.id;
                    return (
                      <PaletteRow
                        key={proj.id}
                        rowIdx={idx}
                        active={isActive}
                        onHover={() => setActiveIdx(idx)}
                        onClick={() => executeItem({ kind: 'project', data: proj })}
                        icon={
                          <FolderOpen
                            size={10}
                            className={isSelected ? 'text-secondary/70' : 'text-ink-ghost/35'}
                          />
                        }
                        title={proj.name}
                        subtitle={proj.description}
                        tags={proj.topics?.slice(0, 3)}
                        lang={proj.language}
                        isSelected={isSelected}
                      />
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-white-dim text-micro text-ink-ghost/40 flex items-center gap-[18px] border-t px-5 py-2.5 font-mono">
              <KbdHint keys="↑↓" label="navigate" />
              <KbdHint keys="↵" label="select" />
              {autoCmd && <KbdHint keys="tab" label="complete" />}
              <KbdHint keys="esc" label="close" />
              <span className="ml-auto opacity-50">space to open</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function SectionLabel({ children }) {
  return (
    <div className="text-micro tracking-ultra text-ink-ghost/30 px-5 pt-3.5 pb-1 font-mono uppercase">
      {children}
    </div>
  );
}

function KbdHint({ keys, label }) {
  return (
    <span className="flex items-center gap-1">
      <kbd className="text-ink-ghost/50 bg-white-dim rounded px-1 py-0.5 font-mono text-[9px] not-italic">
        {keys}
      </kbd>
      <span>{label}</span>
    </span>
  );
}

function Pill({ color, children }) {
  const styles = {
    red: 'bg-rose-500/10 text-rose-400/65 border border-rose-500/18',
    blue: 'bg-blue-500/10 text-blue-400/65 border border-blue-500/18',
  };
  return (
    <span
      className={[
        'inline-flex shrink-0 items-center rounded px-1.5 py-[2px]',
        'font-mono text-[9px] leading-none',
        styles[color] ?? 'text-ink-ghost/35',
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function PaletteRow({
  rowIdx,
  active,
  autoSuggest,
  onHover,
  onClick,
  icon,
  title,
  subtitle,
  pillType,
  tags,
  lang,
  isSelected,
}) {
  return (
    <button
      data-row-idx={rowIdx}
      onMouseEnter={onHover}
      onClick={onClick}
      className={[
        'relative flex w-full items-center gap-3 px-5 py-2.5',
        'cursor-pointer border-0 text-left transition-all duration-75',
        active ? 'bg-white-dim' : 'bg-transparent',
        // Autocomplete suggestion: subtle ring + dimmed (not active)
        autoSuggest ? 'ring-1 ring-rose-400/15 ring-inset' : '',
      ].join(' ')}
    >
      {/* Active left bar */}
      {active && (
        <div
          className={[
            'absolute inset-y-2 left-0 w-[2px] rounded-[1px]',
            pillType === 'command'
              ? 'bg-rose-400/60'
              : isSelected
                ? 'bg-secondary'
                : 'bg-primary/50',
          ].join(' ')}
        />
      )}

      <span className="shrink-0">{icon}</span>

      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <span
          className={[
            'text-label truncate font-mono',
            active ? 'text-ink/80' : autoSuggest ? 'text-ink/28' : 'text-ink/50',
            isSelected && !active ? 'text-secondary/75' : '',
          ].join(' ')}
        >
          {title}
        </span>

        {pillType === 'command' && <Pill color="red">cmd</Pill>}

        {tags?.map((t) => (
          <Pill key={t} color="blue">
            {t}
          </Pill>
        ))}
      </div>

      {subtitle && (
        <span
          className={[
            'text-micro max-w-[200px] shrink-0 truncate font-mono',
            active ? 'text-ink-ghost/50' : autoSuggest ? 'text-ink-ghost/18' : 'text-ink-ghost/25',
          ].join(' ')}
        >
          {subtitle}
        </span>
      )}

      {lang && !subtitle && (
        <span className="text-micro text-ink-ghost/25 shrink-0 font-mono">{lang}</span>
      )}
    </button>
  );
}
