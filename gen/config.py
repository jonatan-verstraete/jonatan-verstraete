from pathlib import Path

root = Path(__file__).resolve().parent.parent

HTML_PATH = root / "assets/resume.html"
OUTPUT_MD = root / "README.md"
OUTPUT_PDF = root / "assets/Jonatan-Verstraete-resume-2026.pdf"
CACHE_DIR = root / ".cache"
TEMPLATE_PATH = root / "gen/template.readme.j2"

MODEL = "qwen3.5:9b"
GITHUB_USER = "jayf0x"
