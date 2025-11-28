# InstanceV Project

This folder contains the InstanceV project page.

## File Organization

- `index.html` - Main HTML file (processed by Jekyll with `layout: null`)
- `static/` - Static assets (CSS, JS, images, videos, PDFs)

## Important Notes

Due to Jekyll's limitations with collections, static files in `_projects/InstanceV/static/` are also copied to `projects/InstanceV/static/` in the root directory so they can be served by Jekyll.

The HTML file is processed by Jekyll and output to `/projects/InstanceV/`, while static files are served from `/projects/InstanceV/static/`.

## Development

When adding or modifying static files:
1. Edit files in `_projects/InstanceV/static/`
2. Run the sync script: `.\sync-instancev.ps1` (or manually copy to `projects/InstanceV/static/`)

The sync script automatically copies all static files from `_projects/InstanceV/static/` to `projects/InstanceV/static/` so they can be served by Jekyll.

