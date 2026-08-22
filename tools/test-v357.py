#!/usr/bin/env python3
"""Valida os contratos responsivos da versão 3.5.9."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(ROOT.glob("*.html")) + sorted((ROOT / "products").glob("*.html"))


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    check(len(PAGES) == 79, f"esperadas 79 páginas, encontradas {len(PAGES)}")
    for page in PAGES:
        text = page.read_text(encoding="utf-8")
        prefix = "../" if page.parent.name == "products" else ""
        check(f'{prefix}assets/styles/responsive-v357.css' in text, f"CSS ausente: {page}")
        check(f'{prefix}assets/scripts/responsive-v357.js' in text, f"JS ausente: {page}")
        viewport = text.lower().split('name="viewport"', 1)[-1][:180]
        check("user-scalable=no" not in viewport and "maximum-scale=1" not in viewport,
              f"zoom bloqueado: {page}")

    css = (ROOT / "assets/styles/responsive-v357.css").read_text(encoding="utf-8")
    js = (ROOT / "assets/scripts/responsive-v357.js").read_text(encoding="utf-8")
    for token in ("max-width: 640px", "max-height: 560px", "orientation: landscape",
                  "pointer: coarse", "forced-colors: active", ".responsive-table-v357",
                  ".destaques-grid"):
        check(token in css, f"contrato CSS ausente: {token}")
    for token in ("ResizeObserver", "visualViewport", "aria-describedby", "orientationchange",
                  "document.createElement", "loading = \"lazy\""):
        check(token in js, f"contrato JS ausente: {token}")
    for forbidden in ("innerHTML", "eval(", "new Function"):
        check(forbidden not in js, f"construção insegura no JS: {forbidden}")

    sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    check('qualimax-v3.5.9' in sw, "cache da versão não atualizado")
    check("responsive-v357.css" in sw and "responsive-v357.js" in sw, "assets fora do cache")
    print(f"OK: contratos responsivos 3.5.9 validados em {len(PAGES)} páginas")


if __name__ == "__main__":
    main()
