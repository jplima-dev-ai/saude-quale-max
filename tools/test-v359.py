#!/usr/bin/env python3
"""Auditoria de conflitos sutis e documentação da versão 3.5.9."""
from collections import Counter
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    config = json.loads((ROOT / "data/config.json").read_text(encoding="utf-8"))
    routes = json.loads((ROOT / "data/routes.json").read_text(encoding="utf-8"))
    require(config["versao"] == routes["version"] == "3.5.9", "versões divergentes")

    sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    shell_match = re.search(r"const SHELL = \[(.*?)\];", sw, re.S)
    require(shell_match is not None, "lista SHELL ausente")
    shell_items = re.findall(r'"([^"]+)"', shell_match.group(1))
    duplicates = [item for item, count in Counter(shell_items).items() if count > 1]
    require(not duplicates, f"assets duplicados no cache: {duplicates}")
    require("qualimax-v3.5.9" in sw, "cache sem versão 3.5.9")

    v357 = (ROOT / "assets/scripts/responsive-v357.js").read_text(encoding="utf-8")
    v358 = (ROOT / "assets/scripts/responsive-v358.js").read_text(encoding="utf-8")
    css = (ROOT / "assets/styles/responsive-v358.css").read_text(encoding="utf-8")
    require("wrapper.tabIndex = overflow ? 0 : -1" in v357, "tabela 3.5.7 sempre focável")
    require("table-hint-v357-" in v358 and "if (!hint.isConnected)" in v358, "instrução tabular pode duplicar")
    require('input:not([type="checkbox"])' in css, "checkbox afetado por largura total")

    markdown = sorted(DOCS.glob("*.md"))
    require(len(markdown) >= 20, "documentação incompleta")
    for page in markdown:
        text = page.read_text(encoding="utf-8")
        require(re.search(r"^# [^#]", text), f"título principal ausente: {page.name}")
        for target in re.findall(r"\[[^]]+\]\(([^)]+)\)", text):
            if target.startswith(("http://", "https://", "#", "mailto:")):
                continue
            require((page.parent / target.split("#", 1)[0]).exists(), f"link quebrado em {page.name}: {target}")
    current_docs = "\n".join(p.read_text(encoding="utf-8") for p in markdown if p.name != "CHANGELOG.md")
    require("qualimax-v3.5.5" not in current_docs, "cache obsoleto documentado")
    require('v3.5.5"' not in current_docs, "release obsoleta documentada")
    require((DOCS / "DOCUMENTATION-STANDARD.md").exists(), "padrão editorial ausente")
    print("v3.5.9 OK: conflitos sutis e documentação profissional validados")


if __name__ == "__main__":
    main()
