import { allPageNames, OWNER } from "@/config";
import { currentPageAtom } from "@/store/generalStore";
import { useAtomValue, useSetAtom } from "jotai";
import { Title } from "./Title";

export const Header = () => {
  const currentPage = useAtomValue(currentPageAtom);
  const setPage = useSetAtom(currentPageAtom);

  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 border-b border-(--border)/40 shrink-0">
      <a href={`https://github.com/${OWNER}`} target="_blank" rel="noreferrer" className="shrink-0 block">
        <img
          src="https://avatars.githubusercontent.com/u/104129830?v=4&size=56"
          alt="avatar"
          className="w-10 h-10 rounded-full border border-white/15 object-cover"
          style={{ filter: "drop-shadow(0 0 10px rgba(79,124,255,0.3))" }}
        />
      </a>

      <div className="min-w-0 overflow-hidden flex items-center justify-center">
        <Title />
      </div>

      <nav className="flex items-center gap-5 shrink-0">
        {allPageNames.map((label) => (
          <button
            key={`page-${label}`}
            type="button"
            onClick={() => setPage(label)}
            className={`font-mono text-[11px] tracking-[0.08em] uppercase transition-colors duration-150 ${
              label === currentPage
                ? "text-(--accent)"
                : "text-(--muted) hover:text-(--text)"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
};
