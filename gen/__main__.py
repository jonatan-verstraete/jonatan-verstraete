from gen.config import HTML_PATH, CACHE_DIR, MODEL, GITHUB_USER
from gen.html2md import main as update_readme
from gen.html2pdf import main as update_pdf
from gen.projects import has_uncommented_projects, fetch_public_repos, pick_top_projects, build_working_html


def main():
    if has_uncommented_projects(HTML_PATH):
        html_path = HTML_PATH
    else:
        print("No uncommented projects in resume — auto-selecting via AI...")
        repos = fetch_public_repos(GITHUB_USER)
        selected = pick_top_projects(repos, MODEL)
        print(f"Selected: {[p['name'] for p in selected]}")
        html_path = build_working_html(HTML_PATH, selected, CACHE_DIR)

    use_cache = html_path == HTML_PATH
    update_readme(html_path=html_path, use_cache=use_cache)
    update_pdf(html_path=html_path)
    print("Done!")


main()
