# About
Pipeline where I can edit [raw HTML](./resume/resume.html) or [template](./resume/gen/template.readme.j2) and simply have to run [update.sh](./scripts/update-resume.sh) to push changes, create a PDF version and README.md - with build in caching and versioning.


```sh
├── gen/             # functionality to automate updates and versioning
├── scripts/         # commit hooks
├── assets/          # Resume (pdf and raw html) and general assets like images
├── site/            # Active site
├── site-3d/         # WIP project for threeJS version of ./site
```