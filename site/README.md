# Intention
This site is meant as a fun project and search for my own projects.

## Security scanning

[opengrep](https://github.com/opengrep/opengrep) runs automatically on every deploy (via the `security-scan` job in [deploy.yml](../.github/workflows/deploy.yml)). The deploy is blocked if any findings at `ERROR` severity are detected.

### Rules

Rules live in [`.opengrep/rules.yml`](../.opengrep/rules.yml). Enabled by default:

| Rule | Severity | What it catches |
|------|----------|-----------------|
| `react-dangerously-set-inner-html` | ERROR | XSS via `dangerouslySetInnerHTML` |
| `dom-innerhtml-assignment` | ERROR | XSS via `element.innerHTML = …` |
| `no-eval` | ERROR | Dynamic code execution via `eval()` |
| `no-new-function` | WARNING | Dynamic code execution via `new Function()` |
| `hardcoded-secret-assignment` | WARNING | Secrets in source code |
| `prototype-pollution-merge` | WARNING | Unsafe `Object.assign` with user input |

Additional rules are commented out in the file (e.g. `p/typescript`, `p/react`, `p/secrets` rulesets, `no-console-log`, `open-redirect`). Uncomment to enable.

### Run locally

```sh
bash scripts/opengrep-scan.sh
```

Requires Python — opengrep is installed automatically if missing.