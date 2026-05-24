import json, subprocess, difflib
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from ollama import chat

PICK_PROMPT = """You are a resume assistant. Given a list of GitHub repositories, pick the top 3 most impressive ones to highlight on a frontend/fullstack engineer resume.

Repositories:
{repos_json}

Output ONLY valid JSON: {{"picks": ["name1", "name2", "name3"]}}
Pick exactly 3. Use the exact repo names from the list."""


def has_uncommented_projects(html_path: Path) -> bool:
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")
    return len(soup.find_all(class_="project")) > 0


def fetch_public_repos(github_user: str) -> list[dict]:
    result = subprocess.run(
        ["gh", "repo", "list", github_user, "--public", "--json", "name,description,url", "--limit", "100"],
        capture_output=True, text=True, check=True
    )
    repos = json.loads(result.stdout)
    return [
        {"name": r["name"], "description": r.get("description") or "", "link": r["url"]}
        for r in repos
    ]


def pick_top_projects(repos: list[dict], model: str) -> list[dict]:
    repos_json = json.dumps(
        [{"name": r["name"], "description": r["description"]} for r in repos],
        indent=2
    )
    response = chat(
        model=model,
        messages=[{"role": "user", "content": PICK_PROMPT.format(repos_json=repos_json)}],
        format="json",
        think=False,
        options={"temperature": 0.1, "seed": 42}
    )
    data = json.loads(response.message.content)
    picks = data.get("picks", [])

    repo_map = {r["name"]: r for r in repos}
    names = list(repo_map.keys())

    selected = []
    for pick in picks:
        matches = difflib.get_close_matches(pick, names, n=1, cutoff=0.4)
        if matches:
            selected.append(repo_map[matches[0]])

    return selected[:3]


def build_working_html(html_path: Path, projects: list[dict], cache_dir: Path) -> Path:
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")

    h2 = next(
        (h for h in soup.find_all("h2") if "project" in h.get_text().lower()),
        None
    )
    if h2:
        section = h2.parent
        for comment in section.find_all(string=lambda t: isinstance(t, Comment)):
            comment.extract()
        for div in section.find_all(class_="project"):
            div.decompose()
        for proj in projects:
            new_tag = BeautifulSoup(
                f'<div class="project">'
                f'<span class="project-name"><a href="{proj["link"]}">{proj["name"]}</a></span>'
                f'<span class="project-desc">{proj["description"]}</span>'
                f'</div>',
                "html.parser"
            )
            section.append(new_tag)

    cache_dir.mkdir(exist_ok=True)
    working_path = cache_dir / "resume_working.html"
    working_path.write_text(str(soup), encoding="utf-8")
    return working_path
