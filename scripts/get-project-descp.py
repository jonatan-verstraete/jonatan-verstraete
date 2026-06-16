#!/usr/bin/env python3

import json
import subprocess
from pathlib import Path

OUTPUT_FILE = "repo_descriptions.md"

# Fetch all repos for the authenticated user
cmd = [
    "gh",
    "repo",
    "list",
    "--limit",
    "1000",
    "--json",
    "name,description"
]

repos = json.loads(subprocess.check_output(cmd, text=True))



with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("# All my projects with description\n\n")

    for repo in sorted(repos, key=lambda r: r["name"].lower()):
        description = (repo.get("description") or "").strip()

        if len(description) > 30:
            f.write(f"## {repo['name']}\n")
            f.write(f"{description}\n\n")


print(f"See: {Path(__name__).parent}/{OUTPUT_FILE}")