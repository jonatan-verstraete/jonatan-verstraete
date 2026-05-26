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

OUTPUT_MD = root / "README.md"
OUTPUT_PDF = root / "assets/Jonatan-Verstraete-resume-2026.pdf"

CACHE_DIR = resumeRoot / ".cache"
TEMPLATE_PATH = resumeRoot / "gen/template.readme.j2"
RESUME_HTML_PATH = resumeRoot / "index.html"

MODEL = "qwen3.5:9b"
GITHUB_USER = "jayf0x"
TARGET_PROJECTS = 3

# just makign sure all paths actually exist
for name, value in list(globals().items()):
    if isinstance(value, Path):
        if not value.exists():
            raise FileNotFoundError(f"{name} does not exist: {value}")
