export const cleanResponse = (raw: string): string =>
  raw
    .split("\n")
    .map((l) => l.replace(/"/g, "").trim())
    .filter((l) => l.length > 0)
    .join("\n");

export const splitAtRepeat = (
  response: string,
): { unique: string; repeated: string } => {
  const text = cleanResponse(response);
  const lines = text.split("\n").filter((l) => l.length > 0);
  const counts = new Map<string, number>();
  let repeatStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const n = (counts.get(lines[i]) ?? 0) + 1;
    counts.set(lines[i], n);
    if (n === 2) {
      repeatStart = i;
      break;
    }
  }

  if (repeatStart === -1) return { unique: lines.join("\n"), repeated: "" };
  return {
    unique: lines.slice(0, repeatStart).join("\n"),
    repeated: lines.slice(repeatStart).join("\n"),
  };
};
