#!/usr/bin/env python3
"""Integra a camada responsiva 3.5.7 em todas as páginas."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def asset_prefix(page: Path) -> str:
    return "../" if page.parent.name == "products" else ""


def migrate_page(page: Path) -> bool:
    text = page.read_text(encoding="utf-8")
    prefix = asset_prefix(page)
    css = f'<link rel="stylesheet" href="{prefix}assets/styles/responsive-v357.css">'
    js = f'<script src="{prefix}assets/scripts/responsive-v357.js" defer></script>'
    changed = False
    if css not in text:
        text = text.replace("</head>", css + "</head>", 1)
        changed = True
    if js not in text:
        text = text.replace("</body>", js + "</body>", 1)
        changed = True
    if changed:
        page.write_text(text, encoding="utf-8")
    return changed


def main() -> None:
    pages = sorted(ROOT.glob("*.html")) + sorted((ROOT / "products").glob("*.html"))
    changed = sum(migrate_page(page) for page in pages)
    print(f"v3.5.7: {changed}/{len(pages)} páginas atualizadas")


if __name__ == "__main__":
    main()
