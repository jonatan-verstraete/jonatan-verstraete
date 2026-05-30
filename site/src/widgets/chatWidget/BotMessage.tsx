import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { splitAtRepeat } from "./utils";

export const BotMessage = ({
  id,
  content,
  shouldAnimate,
  addAnimateId,
}: {
  id: string;
  content: string;
  shouldAnimate: boolean;
  addAnimateId: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [typed, setTyped] = useState(!shouldAnimate);

  const { unique, repeated } = splitAtRepeat(content);
  const hasRepeat = repeated.length > 0;
  const repeatLineCount = repeated
    .split("\n")
    .filter((l) => l.length > 0).length;

  return (
    <div className="flex flex-col items-start">
      {shouldAnimate ? (
        <span className="whitespace-pre-wrap">
          <TypeAnimation
            key={`message-bot-${id}`}
            sequence={[
              unique,
              () => {
                addAnimateId();
                setTyped(true);
              },
            ]}
            speed={62}
            cursor={false}
            wrapper="span"
          />
        </span>
      ) : (
        <span className="whitespace-pre-wrap">{unique}</span>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="repeated"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden w-full"
          >
            <div
              className="mt-2 pt-2 whitespace-pre-wrap"
              style={{
                borderTop: "1px solid var(--gold-dim)",
                opacity: 0.55,
              }}
            >
              {repeated}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasRepeat && typed && (
        <motion.button
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-[11px] transition-opacity hover:opacity-100"
          style={{ color: "color-mix(in srgb, var(--gold) 50%, transparent)" }}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <ChevronDown size={11} />
          </motion.span>
          {expanded
            ? "Show less"
            : `${repeatLineCount} repeated lines — Show more`}
        </motion.button>
      )}
    </div>
  );
};
