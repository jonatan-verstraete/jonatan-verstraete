## FT: auto update resume linkedin
Automate updating resume via linkedin api.  https://developer.linkedin.com/

Goal: scripts/update-resume.sh should update: pdf, md, linkedin

---

## FT: simplified GitHub profile README + dual output pipeline

### Goal
Replace the current resume-mirrored README.md with a minimal, visual GitHub profile page. Keep a full 1-1 resume copy at `assets/resume.md` for agents/crawlers.

### Current state (do not break)
- `resume/gen/__main__.py` — entry point, orchestrates everything
- `resume/gen/html2md.py` — parses resume HTML via LLM (ollama), renders Jinja template → `README.md`
- `resume/gen/projects.py` — uses LLM to pick top projects from public GitHub repos, injects them into the HTML before parsing
- `resume/gen/config.py` — all paths + constants. Validates ALL `Path` globals on import (will error if output path doesn't exist yet — needs fixing)
- `resume/gen/template.readme.j2` — Jinja template for current README (experience, projects table, tech stack, activity graph)
- `resume/index.html` — source of truth for resume content
- `assets/` — contains `clippy.gif`, `matrix-walker.gif`, PDF resume
- Python deps available: `requests`, `bs4` (BeautifulSoup), `ollama`, `jinja2`

### What to build

#### 1. Fix `config.py` path validation
The loop at the bottom raises `FileNotFoundError` for ALL `Path` globals. Output paths don't exist until first run. Fix: only validate input/source paths, not output paths. Add:
- `OUTPUT_README = root / "README.md"` (new simplified profile)  
- Change `OUTPUT_MD = root / "assets/resume.md"` (was root/README.md)
- Add `RESUME_TEMPLATE_PATH = resumeRoot / "gen/template.resume.j2"`
- Only validate: `RESUME_HTML_PATH`, `TEMPLATE_PATH`, `RESUME_TEMPLATE_PATH` (inputs)

#### 2. Create `resume/gen/template.resume.j2`
Copy of the **current** `template.readme.j2` — this becomes the 1-1 resume for agents. Output goes to `assets/resume.md`. Add a note at the top:
```
> Machine-readable resume. Source: resume/index.html — [Download PDF](https://raw.githubusercontent.com/jayf0x/jayf0x/main/assets/Jonatan-Verstraete-resume-2026.pdf)
```
No other changes to this template.

#### 3. Rewrite `resume/gen/template.readme.j2` — new simplified README
Structure (top to bottom):

```
<h1 align="center">{{ firstname }} <img src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif" width="25"></h1>

<p align="center">
  <b>{{ tagline }}</b><br/>
  <a href="https://jayf0x.github.io/">jayf0x.github.io</a>
  &nbsp;•&nbsp;
  <a href="{{ contact.linkedin }}">LinkedIn</a>
</p>

---

<!-- npm badges — only rendered if npm_packages is non-empty -->
{% if npm_packages %}
<p align="center">
{% for pkg in npm_packages %}
<a href="https://www.npmjs.com/package/{{ pkg.name }}"><img src="https://img.shields.io/npm/dm/{{ pkg.name }}?style=flat-square&color=E8612C&logo=npm&logoColor=white&label={{ pkg.name }}" alt="{{ pkg.name }} downloads"/></a>
{% endfor %}
</p>
{% endif %}

<!-- project preview cards — one per row, full width, clickable image -->
{% for project in projects %}
<a href="{{ project.link }}">
  <img src="{{ project.preview_url }}" width="100%" alt="{{ project.name }}"/>
</a>

{% endfor %}

---

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github-readme-activity-graph.vercel.app/graph?username=jayf0x&theme=github-dark&hide_border=true&hide_title=true&area=true&bg_color=transparent"/>
  <source media="(prefers-color-scheme: light)" srcset="https://github-readme-activity-graph.vercel.app/graph?username=jayf0x&theme=github-light&hide_border=true&hide_title=true&area=true&bg_color=transparent"/>
  <img alt="GitHub Activity Graph" src="https://github-readme-activity-graph.vercel.app/graph?username=jayf0x&theme=github-light&hide_border=true&hide_title=true&area=true&bg_color=transparent"/>
</picture>
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/jayf0x/jayf0x/main/assets/Jonatan-Verstraete-resume-2026.pdf">Resume PDF ↓</a>
  &nbsp;•&nbsp;
  <a href="https://raw.githubusercontent.com/jayf0x/jayf0x/main/assets/resume.md">resume.md</a>
</p>
```

**Design notes:**
- No table, no tech stack list, no experience section — all that lives on the site
- Badge color `#E8612C` = fox orange
- Preview images: `https://raw.githubusercontent.com/jayf0x/{repo}/main/assets/preview.png`
  - All repos confirmed to have `./assets/preview.png`

#### 4. Update `resume/gen/html2md.py`

**Add npm discovery (no LLM, no new deps — stdlib `urllib` or existing `requests`):**
```python
def fetch_npm_packages(github_user: str) -> list[dict]:
    url = f"https://registry.npmjs.org/-/v1/search?text=maintainer:{github_user}&size=20"
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
    objects = resp.json().get("objects", [])
    return [{"name": o["package"]["name"]} for o in objects]
```

**Add direct HTML project parsing (no LLM needed for README):**
```python
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
            "preview_url": f"https://raw.githubusercontent.com/jayf0x/{repo}/main/assets/preview.png",
        })
    return projects
```

**Update `main()` to render both outputs:**
- README.md: parsed directly from HTML (no LLM), uses new template.readme.j2, includes `npm_packages`
- assets/resume.md: existing LLM path (cached), uses new template.resume.j2
- Signature stays the same: `main(html_path, use_cache)`

Import `OUTPUT_README`, `RESUME_TEMPLATE_PATH` from config.

#### 5. Update `resume/gen/__main__.py`
No structural changes needed — just make sure imports still match after config changes.

#### 6. Create `assets/resume.md`
Touch the file (empty) so config path validation doesn't fail on first run. Or better: skip validation for output paths (see item 1).

### What NOT to change
- `html2pdf.py` — untouched
- `projects.py` — untouched, still used by `__main__.py` for AI project picking
- `scripts/update-resume.sh` — untouched
- The LLM-based resume data extraction in `html2md.py` — keep it, just redirect its output to `assets/resume.md`

### Testing
Run `bun run update` (or `python -m gen` from `resume/`) and verify:
1. `README.md` — contains preview images, npm badges, activity graph; no experience/tech stack
2. `assets/resume.md` — contains full resume: experience, projects, skills
3. No errors on first run (path validation fixed)