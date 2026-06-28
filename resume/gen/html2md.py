import json, argparse
import requests
from ollama import chat
from jinja2 import Template
from pathlib import Path
from bs4 import BeautifulSoup

from gen.config import (
    RESUME_HTML_PATH, OUTPUT_MD, OUTPUT_README, CACHE_DIR,
    TEMPLATE_PATH, RESUME_TEMPLATE_PATH, MODEL, GITHUB_USER,
    NPM_TOP_N, CACHE_TTL_HOURS,
)
from gen.cache import load_or_fetch

TEMP_JSON = CACHE_DIR / "resume-data.json"
NPM_CACHE = CACHE_DIR / "npm-packages.json"

PROMPT = """
Extract resume data from HTML into the following JSON format.
Be concise and accurate and keep original content.

JSON Structure:
{{
  "firstname": "",
  "lastname": "",
  "tagline": "",
  "location": "",
  "contact": {{"email": "", "linkedin": ""}},
  "experience": [
    {{"role": "", "company": "", "period": "", "bullets": [""]}}
  ],
  "projects": [
    {{"name": "", "link": "", "description": ""}}
  ],
  "skills": {{"core": [], "ai_tooling": [], "ecosystem": [], "experienced": [], "languages": []}}
}}

Rules:
- Output ONLY valid **JSON data**.
- No markdown formatting in the response.
- Ensure skills are categorized into the exact keys: core, ai_tooling, ecosystem, experienced, languages.
- Extract links (a) from a project and add as `link`. Leave empty if there is no link.
- `projects` must only include items from the "Project Highlights" section — NOT from experience/work history.
- if key is not found (eg. no experience[0].name), use an empty string

HTML:
{html_content}
"""


def get_clean_html(html_path: Path) -> str:
    if not html_path.exists():
        raise FileNotFoundError(f"Oops. Missing {html_path}")
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")
    for a in soup.find_all("a"):
        text = a.get_text(strip=True)
        href = a.get("href", "")
        a.replace_with(f"{text} ({href})")
    return soup.find("body").get_text(strip=False)


def _weekly_downloads(pkg: str) -> int:
    try:
        r = requests.get(f"https://api.npmjs.org/downloads/point/last-week/{pkg}", timeout=5)
        if r.ok:
            return r.json().get("downloads", 0)
    except Exception:
        pass
    return 0


def fetch_npm_packages(github_user: str, use_cache: bool = True) -> list[dict]:
    """Top NPM_TOP_N packages maintained by the user, ranked by weekly downloads."""
    def fetch():
        url = f"https://registry.npmjs.org/-/v1/search?text=maintainer:{github_user}&size=50"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        names = [o["package"]["name"] for o in resp.json().get("objects", [])]
        ranked = sorted(
            ({"name": n, "downloads": _weekly_downloads(n)} for n in names),
            key=lambda p: p["downloads"],
            reverse=True,
        )
        return ranked[:NPM_TOP_N]

    try:
        return load_or_fetch(NPM_CACHE, CACHE_TTL_HOURS if use_cache else 0, fetch)
    except Exception as e:
        print(f"npm lookup failed ({e}) — skipping badges")
        return []


PLACEHOLDER_URL = f"https://raw.githubusercontent.com/{GITHUB_USER}/{GITHUB_USER}/main/assets/placeholder.gif"


def _preview_url(repo: str) -> str:
    """Prefer animated preview.gif, fall back to preview.png, then placeholder."""
    base = f"https://raw.githubusercontent.com/{GITHUB_USER}/{repo}/main/assets/preview"
    for ext in ("gif", "png"):
        try:
            if requests.head(f"{base}.{ext}", timeout=5, allow_redirects=True).status_code == 200:
                return f"{base}.{ext}"
        except Exception:
            pass
    return PLACEHOLDER_URL


def get_projects_from_html(html_path: Path) -> list[dict]:
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")
    projects = []
    for el in soup.find_all(class_="project-name"):
        a = el.find("a", href=True)
        if not a:
            continue
        link = a["href"].strip()
        repo = link.rstrip("/").split("/")[-1]
        desc_el = el.find_next_sibling(class_="project-desc")
        desc = desc_el.get_text(strip=True) if desc_el else ""
        projects.append({
            "name": a.get_text(strip=True),
            "link": link,
            "description": desc,
            "preview_url": _preview_url(repo),
        })
    return projects


def get_readme_data_from_html(html_path: Path) -> dict:
    """Header fields + projects for the simplified profile — no LLM."""
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")

    title = soup.find(class_="main-title")
    fullname = title.get_text(strip=True) if title else ""
    tagline_el = soup.find(class_="tagline")

    linkedin = ""
    for a in soup.find_all("a", href=True):
        if "linkedin.com" in a["href"]:
            linkedin = a["href"]
            break

    return {
        "firstname": fullname.split()[0] if fullname else "",
        "tagline": tagline_el.get_text(strip=True) if tagline_el else "",
        "contact": {"linkedin": linkedin},
        "projects": get_projects_from_html(html_path),
    }


def _render(template_path: Path, data: dict, out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(Template(template_path.read_text(encoding="utf-8")).render(**data), encoding="utf-8")


def main(html_path: Path = RESUME_HTML_PATH, use_cache: bool = True):
    if not TEMPLATE_PATH.exists() or not RESUME_TEMPLATE_PATH.exists():
        print("Oi.. template file missing")
        return

    # --- README.md: simplified profile, parsed straight from HTML (no LLM) ---
    readme_data = get_readme_data_from_html(html_path)
    readme_data["npm_packages"] = fetch_npm_packages(GITHUB_USER, use_cache)
    readme_data["model"] = MODEL
    readme_data["projects_file_url"] = f"https://github.com/{GITHUB_USER}/{GITHUB_USER}/blob/main/resume/gen/projects.py"
    _render(TEMPLATE_PATH, readme_data, OUTPUT_README)
    print("Updated README.md")

    # --- assets/resume.md: full 1-1 resume via LLM (cached) ---
    def parse_resume():
        html_text = get_clean_html(html_path)
        response = chat(
            model=MODEL,
            messages=[{"role": "user", "content": PROMPT.format(html_content=html_text)}],
            format="json",
            think=False,
            options={"temperature": 0.1, "seed": 42}
        )
        content = response.message.content
        return json.loads(content) if isinstance(content, str) else content

    try:
        data = load_or_fetch(TEMP_JSON, CACHE_TTL_HOURS if use_cache else 0, parse_resume)
    except Exception as e:
        print(f"Error parsing LLM output: {e}")
        return

    _render(RESUME_TEMPLATE_PATH, data, OUTPUT_MD)
    print("Updated assets/resume.md")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a GitHub profile README + machine-readable resume from an HTML resume.")
    parser.add_argument("--no-cache", action="store_false", dest="use_cache", help="Skip cache and force LLM generation")
    args = parser.parse_args()
    main(use_cache=args.use_cache)
