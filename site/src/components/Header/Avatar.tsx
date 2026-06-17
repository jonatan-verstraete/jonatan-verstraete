import { OWNER } from "@/config";

export const Avatar = () => (
  <a
    href={`https://github.com/${OWNER}`}
    target="_blank"
    rel="noreferrer"
    className="shrink-0 block"
  >
    <img
      src="https://avatars.githubusercontent.com/u/104129830?v=4&size=56"
      alt="avatar"
      className="w-11 h-11 rounded-full border-b-2 border-white/50 object-cover"
      style={{ filter: "drop-shadow(0 0 10px rgba(79,124,255,0.3))" }}
    />
  </a>
);
