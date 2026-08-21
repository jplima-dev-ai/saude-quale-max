#!/usr/bin/env python3
"""Auditoria estrutural complementar para HTML, ARIA e referências locais."""
from __future__ import annotations

import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

from lxml import html


ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    erros: list[str] = []
    avisos: list[str] = []
    paginas = sorted(ROOT.rglob("*.html"))

    for pagina in paginas:
        relativo = pagina.relative_to(ROOT).as_posix()
        try:
            arvore = html.fromstring(pagina.read_text(encoding="utf-8"))
        except Exception as exc:
            erros.append(f"{relativo}: HTML não pôde ser analisado: {exc}")
            continue

        ids = {valor for valor in arvore.xpath("//*[@id]/@id") if valor}

        for atributo in ("aria-controls", "aria-labelledby", "aria-describedby"):
            for elemento in arvore.xpath(f"//*[@{atributo}]"):
                for destino in elemento.get(atributo, "").split():
                    if destino and destino not in ids:
                        erros.append(f"{relativo}: {atributo} aponta para ID ausente: {destino}")

        for rotulo in arvore.xpath("//label[@for]"):
            destino = rotulo.get("for", "")
            if destino and destino not in ids:
                erros.append(f"{relativo}: label aponta para ID ausente: {destino}")

        for campo in arvore.xpath("//input[not(@type='hidden') and not(@hidden)] | //select | //textarea"):
            campo_id = campo.get("id", "")
            tem_label = bool(campo_id and arvore.xpath(f"//label[@for={campo_id!r}]"))
            tem_label = tem_label or bool(campo.xpath("ancestor::label"))
            nome = campo.get("aria-label") or campo.get("aria-labelledby") or campo.get("title")
            if not tem_label and not nome:
                erros.append(f"{relativo}: campo sem nome acessível ({campo.tag}, id={campo_id!r})")

        for imagem in arvore.xpath("//img"):
            if imagem.get("alt") is None:
                erros.append(f"{relativo}: imagem sem atributo alt")

        for link in arvore.xpath("//a[@href]"):
            href = link.get("href", "").strip()
            partes = urlsplit(href)
            if partes.scheme or href.startswith(("#", "//")):
                continue
            caminho = unquote(partes.path)
            if not caminho:
                continue
            alvo = (pagina.parent / caminho).resolve()
            try:
                alvo.relative_to(ROOT.resolve())
            except ValueError:
                erros.append(f"{relativo}: caminho sai da raiz pública: {href}")
                continue
            if not alvo.exists():
                erros.append(f"{relativo}: referência local ausente: {href}")
            elif partes.fragment and alvo.suffix.lower() == ".html":
                try:
                    destino = html.fromstring(alvo.read_text(encoding="utf-8"))
                    if not destino.xpath(f"//*[@id={partes.fragment!r}]"):
                        avisos.append(f"{relativo}: fragmento ausente em {href}")
                except Exception:
                    pass

        for link in arvore.xpath("//a[@target='_blank']"):
            rel = set((link.get("rel") or "").lower().split())
            if "noopener" not in rel or "noreferrer" not in rel:
                erros.append(f"{relativo}: link _blank sem noopener e noreferrer")

        titulo = arvore.xpath("string(//title)").strip()
        idioma = arvore.xpath("string(/html/@lang)").strip()
        if not titulo:
            erros.append(f"{relativo}: título ausente")
        if idioma.lower() != "pt-br":
            erros.append(f"{relativo}: idioma deve ser pt-BR")

    print(f"Páginas verificadas: {len(paginas)}")
    print(f"Erros: {len(erros)}")
    print(f"Avisos: {len(avisos)}")
    for item in erros:
        print(f"ERRO: {item}")
    for item in avisos:
        print(f"AVISO: {item}")
    return 1 if erros else 0


if __name__ == "__main__":
    sys.exit(main())
