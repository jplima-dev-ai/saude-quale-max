#!/usr/bin/env python3
"""
Auditoria de entrega white-label da Saúde Qualimax.

Uso:
    python tools/audit-client.py
    python tools/audit-client.py --proibir "Saúde Qualimax" --proibir "contato.sqm@gmail.com"
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
        produtos = carregar(ROOT / "data" / "products.json").get("produtos", [])
        categorias = carregar(ROOT / "data" / "categories.json").get("categorias", [])
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
        if not (ROOT / "products" / f"{slug}.html").exists():
            erros.append(f"Página individual ausente: {slug}.html")
        if not (ROOT / "assets" / "images" / imagem).exists():
            erros.append(f"Imagem ausente: assets/images/{imagem}")
        if not (ROOT / "assets" / "images" / "thumbs" / imagem).exists():
            erros.append(f"Miniatura ausente: assets/images/thumbs/{imagem}")

    # HTML: referências locais, IDs, H1 e CSP.
    paginas = list(ROOT.rglob("*.html"))
    for page in paginas:
        texto = page.read_text(encoding="utf-8")

        ids_page = re.findall(r'\bid=["\']([^"\']+)', texto)
        if len(ids_page) != len(set(ids_page)):
            erros.append(f"ID duplicado em {page.relative_to(ROOT)}")

        if len(re.findall(r'<h1\b', texto, re.I)) != 1:
            erros.append(f"{page.relative_to(ROOT)} deve ter exatamente um H1.")

        for tag in re.findall(r'<img\b[^>]*>', texto, re.I):
            if not re.search(r'\balt\s*=', tag, re.I):
                erros.append(f"Imagem sem atributo alt em {page.relative_to(ROOT)}")

        for tag in re.findall(r'<button\b[^>]*>', texto, re.I):
            if not re.search(r'\btype\s*=', tag, re.I):
                erros.append(f"Botão sem type em {page.relative_to(ROOT)}")

        for tag in re.findall(r'<a\b[^>]*target=["\']_blank["\'][^>]*>', texto, re.I):
            rel = re.search(r'\brel=["\']([^"\']*)["\']', tag, re.I)
            if not rel or "noopener" not in rel.group(1).lower().split():
                erros.append(f"Link _blank sem noopener em {page.relative_to(ROOT)}")

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


    # Max: módulos internos obrigatórios e ordem de carregamento.
    max_scripts = [
        "assets/scripts/max-core.js",
        "assets/scripts/max-entities.js",
        "assets/scripts/max-recommendation.js",
        "assets/scripts/max-nlu.js",
        "assets/scripts/max-decision.js",
        "assets/scripts/max-intents.js",
        "assets/scripts/chatbot.js",
    ]
    paginas_max = [ROOT / x for x in ("index.html", "catalog.html", "quiz.html", "about.html", "contact.html")]
    for page in paginas_max:
        texto = page.read_text(encoding="utf-8")
        scripts = re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']', texto, re.I)
        posicoes = []
        for esperado in max_scripts:
            candidatos = [esperado, f"./{esperado}"]
            pos = next((scripts.index(c) for c in candidatos if c in scripts), -1)
            posicoes.append(pos)
        if any(pos < 0 for pos in posicoes):
            erros.append(f"Módulo do Max ausente em {page.name}.")
        elif posicoes != sorted(posicoes):
            erros.append(f"Ordem de módulos do Max inválida em {page.name}.")

    sw_texto = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    for esperado in max_scripts:
        if f"./{esperado}" not in sw_texto:
            erros.append(f"Service Worker não inclui {esperado} no shell.")

    # Admin Studio: backup deve acompanhar a release atual.
    admin_js = (ROOT / "assets" / "scripts" / "admin.js").read_text(encoding="utf-8")
    if 'ADMIN_BACKUP_VERSION="3.5.9"' not in admin_js:
        erros.append("Admin Studio está exportando backup com versão obsoleta.")

    # Segurança de jornada e deploy.
    atendimento_html = (ROOT / "support.html").read_text(encoding="utf-8")
    atendimento_js = (ROOT / "assets" / "scripts" / "support.js").read_text(encoding="utf-8")
    if re.search(r"<button\\b[^>]*\\btype=[\"']submit[\"']", atendimento_html, re.I):
        erros.append("Pré-atendimento não pode usar submit nativo.")
    if 'data-atendimento-enviar' not in atendimento_html or 'form.addEventListener("submit",e=>e.preventDefault())' not in atendimento_js:
        erros.append("Proteção contra submissão nativa do pré-atendimento está incompleta.")

    produto_page_js = (ROOT / "assets" / "scripts" / "product-page.js").read_text(encoding="utf-8")
    if r'^catalogo\.html(?:\?[^#]*)?#produtos$' not in produto_page_js or r'^\/?.*catalogo\.html' in produto_page_js:
        erros.append("Validação da URL de retorno do catálogo é permissiva.")

    headers_path = ROOT / "_headers"
    if not headers_path.exists():
        erros.append("Arquivo _headers ausente para deploy Netlify.")
    else:
        headers_text = headers_path.read_text(encoding="utf-8")
        for esperado in ("frame-ancestors 'none'", "X-Frame-Options: DENY", "X-Content-Type-Options: nosniff"):
            if esperado not in headers_text:
                erros.append(f"Header de segurança ausente: {esperado}")

    for util in ("admin.html","support.html","account.html"):
        txt = (ROOT / util).read_text(encoding="utf-8")
        if re.search(r'<script src="assets/scripts/frame-guard\\.js"\\s+defer', txt):
            erros.append(f"frame-guard deve carregar sem defer em {util}.")

    # Pré-atendimento estático.
    atendimento = ROOT / "support.html"
    atendimento_js = ROOT / "assets" / "scripts" / "support.js"
    if not atendimento.exists() or not atendimento_js.exists():
        erros.append("Pré-atendimento incompleto.")
    else:
        atendimento_html = atendimento.read_text(encoding="utf-8")
        atendimento_codigo = atendimento_js.read_text(encoding="utf-8")
        if 'content="noindex,follow"' not in atendimento_html.replace(" ", ""):
            erros.append("support.html deve permanecer noindex,follow.")
        if "support.html" in (ROOT / "sitemap.xml").read_text(encoding="utf-8"):
            erros.append("support.html não deve aparecer no sitemap.")
        if "https://wa.me/" not in atendimento_codigo:
            erros.append("Pré-atendimento não contém a etapa final de abertura do WhatsApp.")
        if "https://brasilapi.com.br/api/cep/v1/" not in atendimento_codigo or "https://viacep.com.br/ws/" not in atendimento_codigo:
            erros.append("Consulta automática de CEP está incompleta.")
        if 'name="cidade"' in atendimento_html or 'name="estado"' in atendimento_html:
            erros.append("Cidade/estado não devem voltar como campos manuais do pré-atendimento.")
        if 'origem==="max" ? lerSessao(MAX_CONTEXTO_KEY) : {}' not in atendimento_codigo:
            erros.append("Contexto do Max não está isolado pela origem do atendimento.")

    # wa.me deve existir apenas na etapa final do pré-atendimento.
    arquivos_web = list(ROOT.glob("*.html")) + list((ROOT / "products").glob("*.html")) + list((ROOT / "assets" / "scripts").glob("*.js"))
    wa_me = [p.relative_to(ROOT).as_posix() for p in arquivos_web if "wa.me/" in p.read_text(encoding="utf-8")]
    if wa_me != ["assets/scripts/support.js"]:
        erros.append(f"wa.me encontrado fora do fluxo final de atendimento: {wa_me}")

    # O shell da PWA não pode apontar para arquivos inexistentes.
    shell = re.search(r'const SHELL = \[(.*?)\];', sw_texto, re.S)
    if shell:
        for item in re.findall(r'["\'](\./[^"\']+)["\']', shell.group(1)):
            alvo = ROOT / ("index.html" if item == "./" else item[2:])
            if not alvo.exists():
                erros.append(f"Service Worker referencia arquivo inexistente: {item}")

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
        catalogo_html = (ROOT / "catalog.html").read_text(encoding="utf-8")
        tags_colecoes = re.findall(r'<[^>]+data-recurso=["\']colecoes["\'][^>]*>', catalogo_html, re.I)
        if any(not re.search(r'\bhidden\b', tag, re.I) for tag in tags_colecoes):
            erros.append("Coleções desativadas possuem bloco estático visível no catálogo.")


    # Marca principal deve aparecer nas páginas públicas centrais e produtos.
    centrais = [ROOT / x for x in ("index.html", "catalog.html", "quiz.html", "about.html", "contact.html")]
    for page in centrais:
        if nome and nome not in page.read_text(encoding="utf-8"):
            avisos.append(f"A marca não aparece no fallback estático de {page.name}.")

    for page in (ROOT / "products").glob("*.html"):
        if nome and nome not in page.read_text(encoding="utf-8"):
            erros.append(f"Marca do cliente ausente em {page.relative_to(ROOT)}")

    # Busca por resíduos explicitamente proibidos.
    publicos = centrais + [ROOT / "account.html", ROOT / "support.html", ROOT / "admin.html"] + list((ROOT / "products").glob("*.html")) + list((ROOT / "assets" / "scripts").glob("*.js")) + [
        ROOT / "assets/scripts/site.js", ROOT / "manifest.webmanifest", ROOT / "sitemap.xml", ROOT / "robots.txt"
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
