export const FALLBACK_PROJECTS = [
  {
    id: 1,
    name: "site-cave",
    description:
      "An allegory of the cave — AI oracle watches your shadow and speaks through fire-lit projections.",
    topics: ["threejs", "react", "ai", "webgl"],
    language: "JavaScript",
  },
  {
    id: 2,
    name: "phantom-lens",
    description:
      "A privacy-first camera tool that redacts faces in real time before footage leaves the device.",
    topics: ["opencv", "privacy", "computer-vision"],
    language: "Python",
  },
  {
    id: 3,
    name: "type-sculpt",
    description:
      "Variable-font playground where letter forms respond to sound and cursor movement.",
    topics: ["typography", "canvas", "audio"],
    language: "JavaScript",
  },
  {
    id: 4,
    name: "drift-map",
    description:
      "Real-time terrain generator that builds landscapes from ambient microphone noise.",
    topics: ["webgl", "audio", "generative"],
    language: "JavaScript",
  },
  {
    id: 5,
    name: "shadow-protocol",
    description:
      "Encrypted peer-to-peer messaging with ephemeral keys — no server stores your words.",
    topics: ["cryptography", "p2p", "privacy"],
    language: "TypeScript",
  },
];

const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;

export async function fetchProjects() {
  return []
  if (!GITHUB_USER) return FALLBACK_PROJECTS;
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated&type=public`,
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const repos = await res.json();
  return repos
    .filter((r) => !r.fork && r.description)
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || "",
      topics: r.topics || [],
      language: r.language || "",
      html_url: r.html_url,
    }));
}
