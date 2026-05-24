from pathlib import Path

root = Path(__file__).resolve().parent.parent

CACHE_DIR = root / ".cache"
ASSETS_DIR = root / "assets"
HTML_PATH = ASSETS_DIR / "resume.html"
OUTPUT_PDF = ASSETS_DIR / "Jonatan-Verstraete-resume-2026.pdf"
OUTPUT_MD = root / "README.md"
TEMPLATE_PATH = root / "gen/template.readme.j2"

MODEL = "qwen3.5:9b"
GITHUB_USER = "jayf0x"
