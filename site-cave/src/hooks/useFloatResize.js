import { useCallback, useEffect, useRef, useState } from 'react';

const LS_KEYS = {
  sidebar: 'cave-resize-sidebar',
  tile: 'cave-resize-oracle-tile',
  picker: 'cave-resize-project-picker',
};

export function clearAllSizes() {
  Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event('cave-sizes-cleared'));
}

function readStored(key, defaults) {
  try {
    const s = JSON.parse(localStorage.getItem(key));
    return s ? { ...defaults, ...s } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

function clamp(v, mn, mx) {
  return Math.min(mx, Math.max(mn, v));
}

/**
 * key: one of the LS_KEYS keys ("sidebar" | "tile" | "picker")
 * defaults: { width, height?, x?, y? }
 * constraints: { minW, maxW, minH, maxH }
 */
export function useFloatResize(key, defaults, constraints) {
  const lsKey = LS_KEYS[key];
  const defaultsRef = useRef(defaults);
  const constraintsRef = useRef(constraints);

  const [size, _setSize] = useState(() => readStored(lsKey, defaults));
  const sizeRef = useRef(size);

  const setSize = useCallback((next) => {
    sizeRef.current = next;
    _setSize(next);
  }, []);

  useEffect(() => {
    const onClear = () => {
      const fresh = { ...defaultsRef.current };
      sizeRef.current = fresh;
      _setSize(fresh);
    };
    window.addEventListener('cave-sizes-cleared', onClear);
    return () => window.removeEventListener('cave-sizes-cleared', onClear);
  }, []);

  const startResize = useCallback(
    (e, edges) => {
      e.preventDefault();
      e.stopPropagation();
      const { minW = 100, maxW = 1000, minH = 60, maxH = 800 } = constraintsRef.current ?? {};
      const sx = e.clientX,
        sy = e.clientY;
      const snap = { ...sizeRef.current };

      function onMove(me) {
        const dx = me.clientX - sx,
          dy = me.clientY - sy;
        const next = { ...snap };
        if (edges.e) next.width = clamp(snap.width + dx, minW, maxW);
        if (edges.w) {
          const w = clamp(snap.width - dx, minW, maxW);
          if ('x' in snap) next.x = snap.x - (w - snap.width);
          next.width = w;
        }
        if (edges.s) next.height = clamp(snap.height + dy, minH, maxH);
        if (edges.n) {
          const h = clamp(snap.height - dy, minH, maxH);
          if ('y' in snap) next.y = snap.y - (h - snap.height);
          next.height = h;
        }
        sizeRef.current = next;
        _setSize(next);
      }

      function onUp() {
        localStorage.setItem(lsKey, JSON.stringify(sizeRef.current));
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [lsKey],
  );

  return { size, setSize, startResize };
}

/** Standard handle descriptors for all-4-sides resize */
export const RESIZE_HANDLES = [
  {
    id: 'n',
    cursor: 'ns-resize',
    pos: { top: 0, left: 8, right: 8, height: 6 },
    edges: { n: true },
  },
  {
    id: 's',
    cursor: 'ns-resize',
    pos: { bottom: 0, left: 8, right: 8, height: 6 },
    edges: { s: true },
  },
  {
    id: 'e',
    cursor: 'ew-resize',
    pos: { right: 0, top: 8, bottom: 8, width: 6 },
    edges: { e: true },
  },
  {
    id: 'w',
    cursor: 'ew-resize',
    pos: { left: 0, top: 8, bottom: 8, width: 6 },
    edges: { w: true },
  },
  {
    id: 'nw',
    cursor: 'nwse-resize',
    pos: { top: 0, left: 0, width: 10, height: 10 },
    edges: { n: true, w: true },
  },
  {
    id: 'ne',
    cursor: 'nesw-resize',
    pos: { top: 0, right: 0, width: 10, height: 10 },
    edges: { n: true, e: true },
  },
  {
    id: 'sw',
    cursor: 'nesw-resize',
    pos: { bottom: 0, left: 0, width: 10, height: 10 },
    edges: { s: true, w: true },
  },
  {
    id: 'se',
    cursor: 'nwse-resize',
    pos: { bottom: 0, right: 0, width: 10, height: 10 },
    edges: { s: true, e: true },
  },
];
