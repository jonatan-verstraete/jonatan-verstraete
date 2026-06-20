import { useIsMobile } from "@/hooks/useDevice";
import { motion } from "framer-motion";
import { memo } from "react";
import { TypeAnimation } from "react-type-animation";

const terminalLines = [
  "Frontend engineer++",
  "Friction > Problem > Solution",
  "Bridging users and tech",
  "Quality > Speed",
  "Challenge me: www.chess.com/member/chaos_70b",
  "('b' + 'a' + + 'a' + 'a').toLowerCase()",
  "Status 418 ☕",
  "2B||!2B",
].flatMap((l) => [l, 3500]);

export const Title = () => {
  const isMobile = useIsMobile();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-1 overflow-hidden"
    >
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-2xl font-black tracking-tight text-(--text) select-none"
        >
          <TextWithSecret text="Jonatan" secret="JayF0x" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.22 }}
        className="font-mono text-sm text-(--muted) flex items-center gap-1"
      >
        <TypeAnimation
          sequence={terminalLines}
          wrapper="span"
          speed={68}
          repeat={Infinity}
        />
        <span className="inline-block h-[0.7em] w-[1.5px] animate-blink bg-(--accent) align-middle" />
      </motion.div>
    </motion.div>
  );
};

export const TextWithSecret = memo(
  ({ text, secret }: { text: string; secret: string }) => {
    const N = Math.max(text.length, secret.length);
    const textStart = Math.floor((N - text.length) / 2);
    const secretStart = Math.floor((N - secret.length) / 2);
    const delays = Array.from({ length: N }).map(
      (_, i) => i * 28 + Math.random() * 70,
    );

    const textSlots = Array.from({ length: N }).map((_, i) => {
      const char = text[i - textStart];
      return char === undefined ? " " : char;
    });

    const secretSlots = Array.from({ length: N }).map((_, i) => {
      const char = secret[i - secretStart];
      return char === undefined ? " " : char;
    });

    return (
      <div className="group inline-block cursor-pointer select-none font-mono">
        {Array.from({ length: N }).map((_, i) => (
          <span
            key={i}
            className="relative inline-block pointer-events-none perspective-[700px]"
            style={{ width: "0.7em" }}
          >
            <span
              className="relative block transform-3d transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:transform-[rotateX(180deg)]"
              style={{ transitionDelay: `${delays[i]}ms` }}
            >
              <span className="block backface-hidden">
                {textSlots[i] === " " ? " " : textSlots[i]}
              </span>
              <span className="absolute inset-0 block transform-[rotateX(180deg)] backface-hidden text-(--accent)">
                {secretSlots[i] === " " ? " " : secretSlots[i]}
              </span>
            </span>
          </span>
        ))}
      </div>
    );
  },
);
