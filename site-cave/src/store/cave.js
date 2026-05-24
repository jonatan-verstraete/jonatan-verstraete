import { atom } from 'jotai';

const MAX_HISTORY = 100;

export const githubUserAtom = atom('');
export const sidebarOpenAtom = atom(false);
export const selectedProjectAtom = atom(null);
export const pickerOpenAtom = atom(false);
export const historyAtom = atom([
  {
    id: String(Math.random()),
    description: 'text '.repeat(40),
    imageBlob: null,
    timestamp: Date.now(),
  },
]);

export function pushHistory(get, set, entry) {
  const prev = get(historyAtom);
  const next = [...prev, entry];
  if (next.length > MAX_HISTORY) {
    const evicted = next.shift();
    if (evicted?.objectUrl) URL.revokeObjectURL(evicted.objectUrl);
  }
  set(historyAtom, next);
}

export function updateLatestImageBlob(get, set, imageBlob) {
  const prev = get(historyAtom);
  if (!prev.length) return;
  const updated = [...prev];
  updated[updated.length - 1] = { ...updated[updated.length - 1], imageBlob };
  set(historyAtom, updated);
}
