import argparse, subprocess
import requests
from jinja2 import Template
from pathlib import Path
from bs4 import BeautifulSoup

from gen.config import (
    RESUME_HTML_PATH, OUTPUT_README, CACHE_DIR,
    TEMPLATE_PATH, MODEL, GITHUB_USER,
    NPM_TOP_N, CACHE_TTL_HOURS,
)
from gen.cache import load_or_fetch

NPM_CACHE = CACHE_DIR / "npm-packages.json"
BIO_CACHE = CACHE_DIR / "bio.json"


def fetch_bio(use_cache: bool = True) -> str:
    """GitHub profile bio (plain text)."""
    def fetch():
        out = subprocess.run(
            ["gh", "api", "user", "--jq", ".bio"],
            capture_output=True, text=True, check=True,
        )
        return {"bio": out.stdout.strip()}

    try:
        return load_or_fetch(BIO_CACHE, CACHE_TTL_HOURS if use_cache else 0, fetch)["bio"]
    except Exception as e:
        print(f"bio lookup failed ({e})")
        return ""


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
        print(f"npm lookup failed ({e}) — skipping packages")
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

    return {
        "firstname": fullname.split()[0] if fullname else "",
        "projects": get_projects_from_html(html_path),
    }


def _render(template_path: Path, data: dict, out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(Template(template_path.read_text(encoding="utf-8")).render(**data), encoding="utf-8")


def main(html_path: Path = RESUME_HTML_PATH, use_cache: bool = True):
    if not TEMPLATE_PATH.exists():
        print("Oi.. template file missing")
        return

    data = get_readme_data_from_html(html_path)
    data["bio"] = fetch_bio(use_cache)
    # selection by downloads, display sorted by name
    data["npm_packages"] = sorted(fetch_npm_packages(GITHUB_USER, use_cache), key=lambda p: p["name"].lower())
    data["model"] = MODEL
    data["projects_file_url"] = f"https://github.com/{GITHUB_USER}/{GITHUB_USER}/blob/main/resume/gen/projects.py"
    _render(TEMPLATE_PATH, data, OUTPUT_README)
    print("Updated README.md")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a GitHub profile README from an HTML resume.")
    parser.add_argument("--no-cache", action="store_false", dest="use_cache", help="Skip cache and force a refetch")
    args = parser.parse_args()
    main(use_cache=args.use_cache)
