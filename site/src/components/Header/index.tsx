import { allPageNames } from "@/config";
import { currentPageAtom } from "@/store/generalStore";
import { useAtomValue, useSetAtom } from "jotai";
import { Avatar } from "./Avatar";
import { Title } from "./Title";

export const Header = () => {
  const currentPage = useAtomValue(currentPageAtom);
  const setPage = useSetAtom(currentPageAtom);

  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 border-b border-(--border)/50 shrink-0">
      <Avatar />

      <div className="min-w-0 overflow-hidden flex items-center justify-center">
        <Title />
      </div>

      <nav className="flex items-center gap-5 shrink-0">
        {allPageNames.map((label) => (
          <button
            key={`page-${label}`}
            type="button"
            onClick={() => setPage(label)}
            className={`font-mono text-sm uppercase tracking-[0.06em] transition-colors duration-150 ${
              label === currentPage
                ? "text-accent"
                : "text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
};
