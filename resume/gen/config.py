from pathlib import Path
import subprocess

# looks like paranoia but actually useful
def get_project_root(start: Path = Path(__file__)) -> Path:
    pth = start.resolve()
    root = Path(
        subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"],
            text=True,
            cwd=pth.parent,
        ).strip()
    ).resolve()
    
    # will error if not matching
    pth.relative_to(root)

    return root


root = get_project_root()
resumeRoot = root / 'resume'

# outputs (created on run — not validated)
OUTPUT_README = root / "README.md"          # simplified visual profile
OUTPUT_MD = root / "assets/resume.md"        # 1-1 machine-readable resume
OUTPUT_PDF = root / "assets/Jonatan-Verstraete-resume-2026.pdf"

CACHE_DIR = resumeRoot / ".cache"

# inputs (must exist)
TEMPLATE_PATH = resumeRoot / "gen/template.readme.j2"
RESUME_TEMPLATE_PATH = resumeRoot / "gen/template.resume.j2"
RESUME_HTML_PATH = resumeRoot / "index.html"

MODEL = "qwen3.5:9b"
GITHUB_USER = "jayf0x"
TARGET_PROJECTS = 3
NPM_TOP_N = 6              # top packages by weekly downloads
CACHE_TTL_HOURS = 48       # serve cache up to 48h; keeps us off rate limits

# only inputs must exist; outputs get created on first run
INPUT_PATHS = [RESUME_HTML_PATH, TEMPLATE_PATH, RESUME_TEMPLATE_PATH]
for value in INPUT_PATHS:
    if not value.exists():
        raise FileNotFoundError(f"input does not exist: {value}")
