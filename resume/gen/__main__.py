import argparse
from gen.config import RESUME_HTML_PATH, CACHE_DIR, MODEL, GITHUB_USER, TARGET_PROJECTS
from gen.html2md import main as update_readme
from gen.html2pdf import main as update_pdf
from gen.projects import get_existing_projects, fetch_public_repos, pick_top_projects, build_working_html


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-cache", action="store_false", dest="use_cache")
    args = parser.parse_args()

    existing = get_existing_projects(RESUME_HTML_PATH)
    needed = TARGET_PROJECTS - len(existing)

    if needed <= 0:
        html_path = RESUME_HTML_PATH
    else:
        print(f"{len(existing)}/{TARGET_PROJECTS} projects in resume — picking {needed} via AI...")
        repos = fetch_public_repos(GITHUB_USER)
        selected = pick_top_projects(repos, needed, MODEL, exclude=set(existing))
        print(f"Selected: {[p['name'] for p in selected]}")
        html_path = build_working_html(RESUME_HTML_PATH, selected, CACHE_DIR)
        args.use_cache = False

    update_readme(html_path=html_path, use_cache=args.use_cache)
    update_pdf(html_path=html_path)
    print("Done!")


main()
