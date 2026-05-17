import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSetAtom } from "jotai";
import { historyAtom, pushHistory } from "../store/cave";
import { devLog } from "../utils";

const MAX_HIS = 5;

export const useAnalyze = (captureFrame = () => {}) => {
  const captureRef = useRef(captureFrame);
  const timeoutRef = useRef(null);
  const history = useRef([]);
  const setHistory = useSetAtom(historyAtom);

  const scheduleNext = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      captureRef.current?.()?.then((base64 = "") => {
        if (!base64 || !base64.startsWith("data:image/jpeg;base64")) {
          devLog("Invalid canvas image", base64);
          return;
        }
        mutate(base64);
      });
    }, 3000);
  };

  const mutationFn = useCallback(async (imageBase64) => {
    const response = await axios.post("http://127.0.0.1:8042/analyze", {
      image: imageBase64,
      history: history.current,
    });
    const text = response.data.result;

    if (text) {
      history.current.push(text);
      setHistory((prev) => {
        const entry = {
          id: crypto.randomUUID(),
          description: text,
          imageBlob: null,
          timestamp: Date.now(),
        };
        const next = [...prev, entry];
        if (next.length > 100) {
          const evicted = next.shift();
          if (evicted?.objectUrl) URL.revokeObjectURL(evicted.objectUrl);
        }
        return next;
      });
    } else {
      devLog("No data in response");
    }
    if (history.current.length > MAX_HIS) {
      history.current.shift();
    }

    return text;
  }, []);

  const { data, isPending, error, mutate } = useMutation({
    mutationFn,
    onSettled: scheduleNext,
  });

  // Kick off the first request after initial delay
  useEffect(() => {
    scheduleNext();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    captureRef.current = captureFrame;
  }, [captureFrame]);

  return {
    isLoading: isPending,
    result: data ?? "",
    error,
  };
};
