import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const CLI_SLIDES = [
  {
    name: ":git-nuke()",
    headline: "BURN YOUR\nGIT HISTORY.",
    tagline: "Type YES to confirm. It's theatrical.",
    color: "var(--c-ff4500)",
    bg: "var(--bg)",
  },
  {
    name: "git-folder-dl",
    headline: "CHERRY-PICK\nYOUR REPOS.",
    tagline: "TUI sparse checkout. Files only.",
    color: "var(--c-00d4ff)",
    bg: "var(--bg)",
  },
  {
    name: "fn-grep-react",
    headline: "HUNT DOWN\nCOMPONENTS.",
    tagline: "Search. Find. Auto-Prettier.",
    color: "var(--c-ffd700)",
    bg: "var(--bg)",
  },
  {
    name: ":llm()",
    headline: "CHAT WITH\nLOCAL AI.",
    tagline: "Ollama · Llama · Mistral",
    color: "var(--c-c084fc)",
    bg: "var(--bg)",
  },
  {
    name: "app-bgTxt.py",
    headline: "AI DESKTOP\nWALLPAPER.",
    tagline: "Summarize. Render. Set as bg.",
    color: "var(--c-4ade80)",
    bg: "var(--bg)",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-40%" : "40%", opacity: 0 }),
};

const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const CliUtils = () => {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setDir(1);
      setIdx((i) => (i + 1) % CLI_SLIDES.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const slide = CLI_SLIDES[idx];

  return (
    <a
      href="https://github.com/jayf0x/cli-utils"
      target="_blank"
      rel="noreferrer"
      className="relative block size-full overflow-hidden"
      style={{ background: slide.bg, transition: "background 0.4s ease" }}
    >
      <AnimatePresence custom={dir} mode="popLayout">
        <motion.div
          key={idx}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 30,
            duration: 0.55,
            ease: EXPO_OUT,
          }}
          className="absolute inset-0 flex flex-col justify-between p-3"
        >
          <span
            className="text-xl"
            style={{
              fontFamily: "monospace",
              color: `${slide.color}77`,
              letterSpacing: "0.05em",
            }}
          >
            $ {slide.name}
          </span>

          <div>
            <p
              className="font-black leading-none uppercase whitespace-pre-line"
              style={{
                fontSize: "clamp(17px, 4vw, 24px)",
                color: slide.color,
                textShadow: `0 0 28px ${slide.color}99`,
                letterSpacing: "-0.02em",
              }}
            >
              {slide.headline}
            </p>
            <p
              className="mt-1.5"
              style={{ fontSize: "9px", color: "var(--border-a38)" }}
            >
              {slide.tagline}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {CLI_SLIDES.map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  height: "3px",
                  width: i === idx ? "14px" : "4px",
                  background: i === idx ? slide.color : `${slide.color}33`,
                  transition: "all 0.35s ease",
                }}
              />
            ))}
            <span
              className="ml-auto"
              style={{
                fontSize: "8px",
                color: "var(--overlay-md)",
                fontFamily: "monospace",
              }}
            >
              jayf0x/cli-utils →
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </a>
  );
};
