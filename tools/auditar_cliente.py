#!/usr/bin/env python3
"""
Auditoria de entrega white-label da Saúde Qualimax.

Uso:
    python tools/auditar_cliente.py
    python tools/auditar_cliente.py --proibir "Saúde Qualimax" --proibir "contato.sqm@gmail.com"
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TEXT_EXT = {".html", ".js", ".json", ".xml", ".txt", ".webmanifest", ".md"}

def carregar(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def main() -> int:
    parser = argparse.ArgumentParser(description="Audita a configuração e a entrega pública do cliente.")
    parser.add_argument("--proibir", action="append", default=[], help="Texto que não pode permanecer nos arquivos públicos.")
    args = parser.parse_args()

    erros = []
    avisos = []

    try:
        config = carregar(ROOT / "data" / "config.json")
        produtos = carregar(ROOT / "data" / "produtos.json").get("produtos", [])
        categorias = carregar(ROOT / "data" / "categorias.json").get("categorias", [])
    except Exception as exc:
        print(f"ERRO: falha ao carregar JSON: {exc}", file=sys.stderr)
        return 2

    empresa = config.get("empresa", {})
    nome = str(empresa.get("nome") or "").strip()
    site = str(empresa.get("site") or "").strip().rstrip("/") + "/"

    if not nome:
        erros.append("empresa.nome está vazio.")
    if not site.startswith("https://"):
        erros.append("empresa.site deve usar HTTPS.")

    # Integridade do catálogo.
    cat_ids = {str(c.get("id")) for c in categorias}
    ids = [p.get("id") for p in produtos]
    slugs = [str(p.get("slug") or "") for p in produtos]
    if len(ids) != len(set(ids)):
        erros.append("Há IDs de produtos duplicados.")
    if len(slugs) != len(set(slugs)):
        erros.append("Há slugs de produtos duplicados.")

    for produto in produtos:
        slug = str(produto.get("slug") or "")
        imagem = str(produto.get("imagem") or "")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            erros.append(f"Slug inválido: {slug!r}")
            continue
        if not re.fullmatch(r"[A-Za-z0-9._-]+", imagem):
            erros.append(f"Nome de imagem inválido no produto {produto.get('nome')!r}")
            continue
        if str(produto.get("categoria")) not in cat_ids:
            erros.append(f"Categoria inválida no produto {produto.get('nome')}.")
        if not (ROOT / "produto" / f"{slug}.html").exists():
            erros.append(f"Página individual ausente: {slug}.html")
        if not (ROOT / "img" / imagem).exists():
            erros.append(f"Imagem ausente: img/{imagem}")
        if not (ROOT / "img" / "thumbs" / imagem).exists():
            erros.append(f"Miniatura ausente: img/thumbs/{imagem}")

    # HTML: referências locais, IDs, H1 e CSP.
    paginas = list(ROOT.rglob("*.html"))
    for page in paginas:
        texto = page.read_text(encoding="utf-8")

        ids_page = re.findall(r'\bid=["\']([^"\']+)', texto)
        if len(ids_page) != len(set(ids_page)):
            erros.append(f"ID duplicado em {page.relative_to(ROOT)}")

        if len(re.findall(r'<h1\b', texto, re.I)) != 1:
            erros.append(f"{page.relative_to(ROOT)} deve ter exatamente um H1.")

        for _, valor in re.findall(r'\b(src|href)=["\']([^"\']+)', texto, re.I):
            if not valor or valor.startswith(("http://", "https://", "#", "mailto:", "tel:", "data:")):
                continue
            caminho = valor.split("?")[0].split("#")[0]
            if caminho and not (page.parent / caminho).exists():
                erros.append(f"Referência local quebrada em {page.relative_to(ROOT)}: {valor}")

        meta = re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]+)">', texto, re.I)
        if not meta:
            erros.append(f"CSP ausente em {page.relative_to(ROOT)}")
        else:
            policy = meta.group(1)
            for script in re.finditer(r'<script\b([^>]*)>(.*?)</script>', texto, re.I | re.S):
                if "src=" in script.group(1).lower() or not script.group(2).strip():
                    continue
                digest = base64.b64encode(
                    hashlib.sha256(script.group(2).encode("utf-8")).digest()
                ).decode()
                if f"'sha256-{digest}'" not in policy:
                    erros.append(f"Hash CSP inválido em {page.relative_to(ROOT)}")

    # SEO/site.
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    if site not in sitemap:
        erros.append("sitemap.xml não contém empresa.site.")

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    if f"{site}sitemap.xml" not in robots:
        erros.append("robots.txt não aponta para o sitemap do cliente.")

    manifest = carregar(ROOT / "manifest.webmanifest")
    if manifest.get("name") != nome:
        erros.append("manifest.webmanifest não está sincronizado com empresa.nome.")
    recursos = config.get("recursos", {})
    quiz_ativo = recursos.get("quiz", True) is not False
    quiz_html = (ROOT / "quiz.html").read_text(encoding="utf-8")
    if quiz_ativo:
        if "quiz.html" not in sitemap:
            erros.append("Quiz ativo, mas ausente do sitemap.")
        if 'content="noindex, nofollow"' in quiz_html:
            erros.append("Quiz ativo, mas marcado como noindex.")
    else:
        if "quiz.html" in sitemap:
            erros.append("Quiz desativado ainda aparece no sitemap.")
        if 'content="noindex, nofollow"' not in quiz_html:
            erros.append("Quiz desativado não está marcado como noindex.")

    if recursos.get("colecoes", True) is False:
        catalogo_html = (ROOT / "catalogo.html").read_text(encoding="utf-8")
        tags_colecoes = re.findall(r'<[^>]+data-recurso=["\']colecoes["\'][^>]*>', catalogo_html, re.I)
        if any(not re.search(r'\bhidden\b', tag, re.I) for tag in tags_colecoes):
            erros.append("Coleções desativadas possuem bloco estático visível no catálogo.")


    # Marca principal deve aparecer nas páginas públicas centrais e produtos.
    centrais = [ROOT / x for x in ("index.html", "catalogo.html", "quiz.html", "sobre.html", "contato.html")]
    for page in centrais:
        if nome and nome not in page.read_text(encoding="utf-8"):
            avisos.append(f"A marca não aparece no fallback estático de {page.name}.")

    for page in (ROOT / "produto").glob("*.html"):
        if nome and nome not in page.read_text(encoding="utf-8"):
            erros.append(f"Marca do cliente ausente em {page.relative_to(ROOT)}")

    # Busca por resíduos explicitamente proibidos.
    publicos = centrais + list((ROOT / "produto").glob("*.html")) + list((ROOT / "js").glob("*.js")) + [
        ROOT / "script.js", ROOT / "manifest.webmanifest", ROOT / "sitemap.xml", ROOT / "robots.txt"
    ]
    for termo in args.proibir:
        if not termo:
            continue
        encontrados = []
        for page in publicos:
            if termo.casefold() in page.read_text(encoding="utf-8", errors="ignore").casefold():
                encontrados.append(str(page.relative_to(ROOT)))
        if encontrados:
            erros.append(f'Termo proibido "{termo}" encontrado em: ' + ", ".join(encontrados[:8]))

    print(f"Cliente: {nome or '(sem nome)'}")
    print(f"Produtos: {len(produtos)}")
    print(f"Páginas HTML: {len(paginas)}")
    print(f"Erros: {len(erros)}")
    print(f"Avisos: {len(avisos)}")

    if avisos:
        print("\nAVISOS:")
        for item in avisos:
            print(f"- {item}")

    if erros:
        print("\nERROS:")
        for item in erros:
            print(f"- {item}")
        return 1

    print("\nAuditoria aprovada.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
