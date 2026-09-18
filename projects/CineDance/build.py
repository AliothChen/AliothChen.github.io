#!/usr/bin/env python3
"""Inject cases.json into the CineDance project page."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HTML = ROOT / "index.html"
TEMPLATE = ROOT / "template.html"
CASES = ROOT / "static" / "data" / "cases.json"


def main() -> None:
    cases = json.loads(CASES.read_text(encoding="utf-8"))
    data = json.dumps(cases, ensure_ascii=False, indent=2).replace("<", "\\u003c")
    source = TEMPLATE if TEMPLATE.exists() else HTML
    html = source.read_text(encoding="utf-8")
    pattern = re.compile(
        r'<script id="case-data" type="application/json">.*?</script>',
        re.S,
    )
    html, n = pattern.subn(
        lambda _: f'<script id="case-data" type="application/json">{data}</script>',
        html,
        count=1,
    )
    if n != 1:
        raise SystemExit("could not find unique case-data script tag")
    HTML.write_text(html, encoding="utf-8")
    print(f"Wrote {HTML} with {len(cases)} cases ({HTML.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
