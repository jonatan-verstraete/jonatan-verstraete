import json, subprocess, difflib
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from ollama import chat

PICK_PROMPT = """You are a resume assistant. Given a list of GitHub repositories, pick the top {n} to highlight on a frontend/fullstack engineer resume.

This engineer's differentiators are creative rendering (WebGL, 3D, canvas), browser performance engineering, and original developer tooling.

Prefer repositories that:
- Show technical depth (complex rendering, algorithms, system design, browser internals)
- Are original tools/apps — not forks, boilerplate, exercises, or personal utilities
- Have a clear, non-trivial problem they solve — not CLI one-liners, not macOS tray apps, not niche personal scripts
- Are relevant to software engineering (libraries, dev tools, visualizations, fullstack apps)
- Picks should be varied across types — spread across different categories (e.g. not all browser libraries, not all 3D demos)
- no WIP

These are already on the resume (do not pick these):
{already_picked}

All repositories:
```json
{repos_json}
```

Output ONLY valid JSON: {{"picks": ["name1", "name2", ...]}}
Pick exactly {n}. Use the exact repo names from the list."""


def get_existing_projects(html_path: Path) -> list[str]:
    """Returns repo names (from href) of uncommented project entries."""
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")
    names = []
    for el in soup.find_all(class_="project-name"):
        a = el.find("a", href=True)
        if a:
            names.append(a["href"].rstrip("/").split("/")[-1])
    return names


def fetch_public_repos(github_user: str) -> list[dict]:
    result = subprocess.run(
        ["gh", "repo", "list", github_user, "--visibility=public", "--json", "name,description,url,primaryLanguage", "--limit", "100"],
        capture_output=True, text=True, check=True
    )
    repos = json.loads(result.stdout)
    return [
        {
            "name": r["name"],
            "description": r.get("description") or "",
            "link": r["url"],
            "language": (r.get("primaryLanguage") or {}).get("name") or "",
        }
        for r in repos
    ]


def pick_top_projects(repos: list[dict], n: int, model: str, exclude: set[str] = set()) -> list[dict]:
    already_picked = ", ".join(list(exclude))
    candidates = [r for r in repos if r["name"] not in exclude]
    repos_json = json.dumps(
        [{"name": r["name"], "description": r["description"], "language": r.get("language", "")} for r in candidates],
        indent=2
    )
    response = chat(
        model=model,
        messages=[{"role": "user", "content": PICK_PROMPT.format(n=n, repos_json=repos_json, already_picked=already_picked)}],
        format="json",
        think=False,
        options={"temperature": 0.8, "seed": 42}
    )
    data = json.loads(response.message.content)
    picks = data.get("picks", [])

    repo_map = {r["name"]: r for r in candidates}
    names = list(repo_map.keys())

    selected = []
    for pick in picks:
        matches = difflib.get_close_matches(pick, names, n=1, cutoff=0.4)
        if matches:
            selected.append(repo_map[matches[0]])

    return selected[:n]


def build_working_html(html_path: Path, extra_projects: list[dict], cache_dir: Path) -> Path:
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")

    h2 = next(
        (h for h in soup.find_all("h2") if "project" in h.get_text().lower()),
        None
    )
    if h2:
        section = h2.parent
        for comment in section.find_all(string=lambda t: isinstance(t, Comment)):
            comment.extract()
        for proj in extra_projects:
            new_tag = BeautifulSoup(
                f'<div class="project">'
                f'<span class="project-name"><a href="{proj["link"]}">{proj["name"]}</a></span>'
                f'<span class="project-desc">{proj["description"]}</span>'
                f'</div>',
                "html.parser"
            )
            section.append(new_tag)

    cache_dir.mkdir(exist_ok=True)
    working_path = cache_dir / "resume_cached.html"
    working_path.write_text(str(soup), encoding="utf-8")
    return working_path
