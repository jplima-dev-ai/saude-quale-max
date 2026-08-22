#!/usr/bin/env python3
"""Integra a estabilização responsiva 3.5.8 nas páginas existentes."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def migrate(page: Path) -> bool:
    text = page.read_text(encoding="utf-8")
    prefix = "../" if page.parent.name == "products" else ""
    css = f'<link rel="stylesheet" href="{prefix}assets/styles/responsive-v358.css">'
    js = f'<script src="{prefix}assets/scripts/responsive-v358.js" defer></script>'
    before = text
    if css not in text:
        text = text.replace("</head>", css + "</head>", 1)
    if js not in text:
        text = text.replace("</body>", js + "</body>", 1)
    if text != before:
        page.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    pages = sorted(ROOT.glob("*.html")) + sorted((ROOT / "products").glob("*.html"))
    changed = sum(migrate(page) for page in pages)
    print(f"v3.5.8: {changed}/{len(pages)} páginas atualizadas")


if __name__ == "__main__":
    main()
