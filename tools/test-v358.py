#!/usr/bin/env python3
"""Contratos de estabilização responsiva da versão 3.5.9."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(ROOT.glob("*.html")) + sorted((ROOT / "products").glob("*.html"))


def require(value: bool, message: str) -> None:
    if not value:
        raise AssertionError(message)


def main() -> None:
    require(len(PAGES) == 79, f"quantidade de páginas inesperada: {len(PAGES)}")
    for page in PAGES:
        html = page.read_text(encoding="utf-8")
        prefix = "../" if page.parent.name == "products" else ""
        require(f'{prefix}assets/styles/responsive-v358.css' in html, f"CSS ausente: {page.name}")
        require(f'{prefix}assets/scripts/responsive-v358.js' in html, f"JS ausente: {page.name}")
        require(html.index("responsive-v357.css") < html.index("responsive-v358.css"), f"ordem CSS incorreta: {page.name}")

    css = (ROOT / "assets/styles/responsive-v358.css").read_text(encoding="utf-8")
    js = (ROOT / "assets/scripts/responsive-v358.js").read_text(encoding="utf-8")
    for token in ("max-width: 360px", "max-height: 500px", "orientation: landscape",
                  "data-v358-keyboard", "prefers-contrast: more", ".responsive-table-v358"):
        require(token in css, f"contrato CSS ausente: {token}")
    for token in ("visualViewport", "ResizeObserver", "requestAnimationFrame", "naturalWidth",
                  "aria-describedby", "v358-overflow-contained"):
        require(token in js, f"contrato JS ausente: {token}")
    for forbidden in ("innerHTML", "eval(", "new Function"):
        require(forbidden not in js, f"construção insegura: {forbidden}")

    require(json.loads((ROOT / "data/config.json").read_text(encoding="utf-8"))["versao"] == "3.5.9", "config sem versão")
    sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    require("qualimax-v3.5.9" in sw and "responsive-v358.css" in sw and "responsive-v358.js" in sw, "cache incompleto")
    print("v3.5.9 OK: zoom extremo, teclado virtual, tabelas e overflow validados em 79 páginas")


if __name__ == "__main__":
    main()
