import { Github, Linkedin } from "lucide-react";

const year = new Date().getFullYear();

export const FooterSection = () => (
  <footer className="px-5 py-3 shrink-0 border-t border-(--border)/30">
    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
      <p className="font-mono text-mini text-(--muted)/60 tracking-wide">
        Jonatan · Ghent · {year}
      </p>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/jayf0x"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-mini text-(--muted)/60 hover:text-(--muted) transition-colors"
        >
          <Github size={11} />
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/jonatan-verstraete/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-mini text-(--muted)/60 hover:text-(--muted) transition-colors"
        >
          <Linkedin size={11} />
          LinkedIn
        </a>
      </div>
    </div>
  </footer>
);
