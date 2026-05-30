import { type CheckpointItem } from "@/store/checkPointStore";

export const OWNER = "jayf0x";
export const CACHE_INVALIDATION_TIME = 2 * 60 * 60 * 1000;

export const allCheckpointItems: CheckpointItem[] = [
  { tag: "Conway", percentage: 20 },
  { tag: "Fluid", percentage: 50 },
  // { tag: "Void", percentage: 0, invert: true },
  { tag: "🐔🥚", percentage: 60 },
  { tag: "Ads", percentage: 80 },
  { tag: "Red Button", percentage: 30 },
];
