#!/usr/bin/env python3
"""resume/index.html -> assets/<name>.pdf

All that survived of the old gen/ package. The résumé HTML is hand-maintained now,
so there is nothing to template — WeasyPrint just prints it.

    python3 resume/pdf.py
"""

import sys
from pathlib import Path

from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resume/index.html"
OUTPUT = ROOT / "assets/Jonatan-Verstraete-resume-2026.pdf"


def main(source: Path = SOURCE, output: Path = OUTPUT) -> Path:
    if not source.exists():
        raise SystemExit(f"No résumé HTML at {source}")
    output.parent.mkdir(parents=True, exist_ok=True)
    HTML(filename=str(source), base_url=str(source.parent)).write_pdf(str(output))
    return output


if __name__ == "__main__":
    out = main()
    print(f"PDF: {out.relative_to(ROOT)} ({out.stat().st_size / 1000:.0f} kB)", file=sys.stderr)
