import { useEffect, useRef } from 'react';

export const useDisposableItems = (factory) => {
  const ref = useRef(factory());
  if (!ref.current) ref.current = factory();

  useEffect(
    () => () => {
      const items = ref.current;
      if (!items) return devLog('Nothing to cleanup..');
      for (const k in items) items[k]?.dispose?.();
      ref.current = null;
    },
    [],
  );

  return ref;
};
