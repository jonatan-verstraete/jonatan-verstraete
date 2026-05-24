from weasyprint import HTML
from pathlib import Path

from gen.config import HTML_PATH, OUTPUT_PDF


def main(html_path: Path = HTML_PATH):
    if not html_path.exists():
        raise SystemExit(f"No HTML file found at {html_path}")
    HTML(filename=str(html_path)).write_pdf(str(OUTPUT_PDF))
    print("Created PDF.")


if __name__ == "__main__":
    main()
