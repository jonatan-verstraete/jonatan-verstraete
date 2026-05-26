import json, argparse
from ollama import chat
from jinja2 import Template
from pathlib import Path
from bs4 import BeautifulSoup

from gen.config import RESUME_HTML_PATH, OUTPUT_MD, CACHE_DIR, TEMPLATE_PATH, MODEL

TEMP_JSON = CACHE_DIR / "resume-data.json"

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
  "skills": {{"core": [], "libraries": []}}
}}

Rules:
- Output ONLY valid **JSON data**.
- No markdown formatting in the response.
- Ensure skills are categorized.
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


def main(html_path: Path = RESUME_HTML_PATH, use_cache: bool = True):
    if not TEMPLATE_PATH.exists():
        print(f"Oi.. template file is not there: {TEMPLATE_PATH}")
        return

    data = {}

    if use_cache and TEMP_JSON.exists():
        try:
            data = json.loads(TEMP_JSON.read_text(encoding="utf-8"))
        except Exception:
            print("Uups failed to load cache")
            use_cache = False

    if not data:
        html_text = get_clean_html(html_path)
        response = chat(
            model=MODEL,
            messages=[{"role": "user", "content": PROMPT.format(html_content=html_text)}],
            format="json",
            think=False,
            options={"temperature": 0.1, "seed": 42}
        )
        content = response.message.content

        try:
            data = json.loads(content) if isinstance(content, str) else content
            CACHE_DIR.mkdir(exist_ok=True)
            TEMP_JSON.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception as e:
            print("Error parsing LLM output:")
            print(content)
            print(e)
            return

    template_str = TEMPLATE_PATH.read_text(encoding="utf-8")
    rendered_md = Template(template_str).render(**data)
    OUTPUT_MD.write_text(rendered_md, encoding="utf-8")
    print("Updated readme.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a fancy GitHub README from an HTML resume.")
    parser.add_argument("--no-cache", action="store_false", dest="use_cache", help="Skip cache and force LLM generation")
    args = parser.parse_args()
    main(use_cache=args.use_cache, model=args.model)
