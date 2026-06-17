import { allPageNames, OWNER } from "@/config";
import { currentPageAtom } from "@/store/generalStore";
import { useAtomValue, useSetAtom } from "jotai";
import { Title } from "./Title";

export const Header = () => {
  const currentPage = useAtomValue(currentPageAtom);
  const setPage = useSetAtom(currentPageAtom);

  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-0 p-6 w-full text-nowrap top-6">
      <div className="flex items-center">
        <a href={`https://github.com/${OWNER}`} target="_blank">
          <img
            src="https://avatars.githubusercontent.com/u/104129830?v=4&size=64"
            alt="avatar"
            style={{
              filter: "drop-shadow(-2px -1px 6px #888)",
            }}
            className="rounded-full overflow-hidden border-[#fff5] border-b-2"
          />
        </a>
      </div>

      <div className="min-w-0 overflow-hidden flex items-center justify-center">
        <Title />
      </div>
      <nav className="items-center justify-end pr-12 flex">
        <div className="flex items-center gap-6">
          {allPageNames.map((label) => (
            <button
              key={`page-${label}`}
              type="button"
              onClick={() => setPage(label)}
              className={`text-lg capitalize transition hover:underline ${label === currentPage ? "text-accent" : "text-muted) hover:text-text"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );

  return;
};
