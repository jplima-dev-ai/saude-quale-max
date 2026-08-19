#!/usr/bin/env python3
"""
Sincroniza arquivos estáticos da plataforma com data/config.json.

Uso:
    python tools/sincronizar_cliente.py
    python tools/sincronizar_cliente.py --check

Não depende de bibliotecas externas.
"""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import hashlib
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "data" / "config.json"
PRODUTOS = ROOT / "data" / "produtos.json"

PAGINAS = {
    "home": "index.html",
    "catalogo": "catalogo.html",
    "quiz": "quiz.html",
    "sobre": "sobre.html",
    "contato": "contato.html",
}

def carregar_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def exigir(condicao: bool, mensagem: str):
    if not condicao:
        raise ValueError(mensagem)

def site_base(valor: str) -> str:
    valor = str(valor or "").strip()
    exigir(valor.startswith("https://"), "empresa.site deve começar com https://")
    return valor.rstrip("/") + "/"

def substituir_atributo(texto: str, seletor_inicio: str, atributo: str, valor: str) -> str:
    padrao = re.compile(
        rf'(<{seletor_inicio}\b[^>]*\b{atributo}=["\'])[^"\']*(["\'])',
        re.I
    )
    return padrao.sub(lambda m: m.group(1) + html.escape(valor, quote=True) + m.group(2), texto)

def atualizar_meta(texto: str, chave: str, valor: str, property_meta: bool = False) -> str:
    attr = "property" if property_meta else "name"
    padrao = re.compile(
        rf'(<meta\s+{attr}=["\']{re.escape(chave)}["\']\s+content=["\'])[^"\']*(["\'])',
        re.I
    )
    return padrao.sub(lambda m: m.group(1) + html.escape(valor, quote=True) + m.group(2), texto)

def atualizar_canonical(texto: str, valor: str) -> str:
    return re.sub(
        r'(<link\s+rel=["\']canonical["\']\s+href=["\'])[^"\']*(["\'])',
        lambda m: m.group(1) + html.escape(valor, quote=True) + m.group(2),
        texto,
        flags=re.I,
    )

def atualizar_title(texto: str, valor: str) -> str:
    return re.sub(
        r"<title>.*?</title>",
        f"<title>{html.escape(valor)}</title>",
        texto,
        count=1,
        flags=re.I | re.S,
    )

def atualizar_textos_configuraveis(texto: str, config: dict) -> str:
    empresa = config.get("empresa", {})
    contato = config.get("contato", {})
    marca = config.get("marca", {})
    nome = str(empresa.get("nome") or "Loja")
    localidade = " - ".join(x for x in [empresa.get("cidade"), empresa.get("estado")] if x)
    frase_rodape = (
        f"Produtos naturais e atendimento humanizado em {localidade}."
        if localidade else str(empresa.get("descricao") or "Produtos naturais e atendimento humanizado.")
    )
    redes = config.get("redes", {})
    instagram_bruto = str(redes.get("instagram") or "").strip()
    instagram_handle = ""
    instagram_url = ""
    if instagram_bruto:
        if instagram_bruto.startswith("https://"):
            instagram_url = instagram_bruto
            instagram_handle = "Instagram"
        else:
            usuario = instagram_bruto.lstrip("@")
            if re.fullmatch(r"[A-Za-z0-9._-]{1,100}", usuario):
                instagram_handle = "@" + usuario
                instagram_url = f"https://www.instagram.com/{usuario}/"

    # Elementos com hooks data-config-* preservam fallback estático útil sem JS.
    substituicoes = [
        (r'(<[^>]+\bdata-config-nome\b[^>]*>).*?(</[^>]+>)', nome),
        (r'(<[^>]+\bdata-config-telefone\b[^>]*>).*?(</[^>]+>)', str(contato.get("telefone") or "")),
        (r'(<[^>]+\bdata-config-email\b[^>]*>).*?(</[^>]+>)', str(contato.get("email") or "")),
        (r'(<[^>]+\bdata-config-endereco\b[^>]*>).*?(</[^>]+>)', str(contato.get("endereco") or "")),
        (r'(<[^>]+\bdata-config-localidade\b[^>]*>).*?(</[^>]+>)', localidade),
        (r'(<[^>]+\bdata-config-frase-rodape\b[^>]*>).*?(</[^>]+>)', frase_rodape),
    ]
    for padrao, valor in substituicoes:
        texto = re.sub(
            padrao,
            lambda m, v=valor: m.group(1) + html.escape(v) + m.group(2),
            texto,
            flags=re.I | re.S,
        )
    texto = re.sub(
        r'(<[^>]+\bdata-config-instagram-handle\b[^>]*>).*?(</[^>]+>)',
        lambda m: m.group(1) + html.escape(instagram_handle) + m.group(2),
        texto,
        flags=re.I | re.S,
    )
    def atualizar_href_em_tag(tag: str, valor: str) -> str:
        if re.search(r'\bhref=["\'][^"\']*["\']', tag, re.I):
            return re.sub(
                r'(\bhref=["\'])[^"\']*(["\'])',
                lambda m: m.group(1) + html.escape(valor, quote=True) + m.group(2),
                tag,
                count=1,
                flags=re.I,
            )
        return tag[:-1] + f' href="{html.escape(valor, quote=True)}">'

    if instagram_url:
        texto = re.sub(
            r'<a\b[^>]*\bdata-config-instagram-link\b[^>]*>',
            lambda m: atualizar_href_em_tag(m.group(0), instagram_url),
            texto,
            flags=re.I,
        )

    email = str(contato.get("email") or "").strip()
    if email:
        texto = re.sub(
            r'<a\b[^>]*\bdata-config-email-link\b[^>]*>',
            lambda m: atualizar_href_em_tag(m.group(0), "mailto:" + email),
            texto,
            flags=re.I,
        )

    texto = re.sub(
        r'(<a\b[^>]*\bdata-config-logo-label\b[^>]*\baria-label=["\'])[^"\']*(["\'])',
        lambda m: m.group(1) + html.escape(f"{nome} - voltar ao início", quote=True) + m.group(2),
        texto,
        flags=re.I,
    )

    comercial = config.get("comercial", {})
    possui_comercial = False
    for chave in ("horario", "entrega", "retirada", "observacoes"):
        valor = str(comercial.get(chave) or "").strip()
        texto = re.sub(
            rf'(<[^>]+\bdata-config-comercial-{chave}\b[^>]*>).*?(</[^>]+>)',
            lambda m, v=valor: m.group(1) + html.escape(v) + m.group(2),
            texto,
            flags=re.I | re.S,
        )
        if valor:
            possui_comercial = True
            texto = re.sub(
                rf'(<article\b[^>]*\bdata-comercial-item=["\']{chave}["\'][^>]*)\s+hidden([^>]*>)',
                r'\1\2',
                texto,
                flags=re.I,
            )

    if possui_comercial:
        texto = re.sub(
            r'(<section\b[^>]*\bdata-comercial-container\b[^>]*)\s+hidden([^>]*>)',
            r'\1\2',
            texto,
            flags=re.I,
        )

    recursos = config.get("recursos", {})
    for chave in ("quiz", "jornadaLocal", "colecoes"):
        ativo = recursos.get(chave, True) is not False
        padrao_tag = re.compile(
            rf'<(?P<tag>[a-z0-9]+)\b(?P<attrs>[^>]*\bdata-recurso=["\']{re.escape(chave)}["\'][^>]*)>',
            re.I,
        )
        def ajustar_recurso(m):
            tag = m.group("tag")
            attrs = m.group("attrs")
            if ativo:
                attrs = re.sub(r'\s+hidden(?=\s|>|$)', '', attrs, flags=re.I)
            elif not re.search(r'\bhidden\b', attrs, re.I):
                attrs += ' hidden'
            return f"<{tag}{attrs}>"
        texto = padrao_tag.sub(ajustar_recurso, texto)

    logo = str(marca.get("logoImagem") or "")
    if logo:
        texto = re.sub(
            r'(<img\b[^>]*\bdata-config-logo-img\b[^>]*\bsrc=["\'])[^"\']*(["\'])',
            lambda m: m.group(1) + html.escape(logo, quote=True) + m.group(2),
            texto,
            flags=re.I,
        )
        texto = re.sub(
            r'(<img\b[^>]*\bdata-config-logo-img\b[^>]*\balt=["\'])[^"\']*(["\'])',
            lambda m: m.group(1) + html.escape(nome, quote=True) + m.group(2),
            texto,
            flags=re.I,
        )

    # Fallback visível do nome na marca.
    texto = re.sub(
        r'(<span\b[^>]*class=["\'][^"\']*\blogo-texto\b[^"\']*["\'][^>]*>).*?(</span>)',
        lambda m: m.group(1) + html.escape(nome) + m.group(2),
        texto,
        flags=re.I | re.S,
    )
    return texto

def recalcular_csp(texto: str) -> str:
    meta = re.search(
        r'<meta\s+http-equiv=["\']Content-Security-Policy["\']\s+content="([^"]*)">',
        texto,
        re.I,
    )
    if not meta:
        return texto
    policy = meta.group(1)
    hashes = []
    for m in re.finditer(r"<script\b([^>]*)>(.*?)</script>", texto, re.I | re.S):
        if "src=" in m.group(1).lower() or not m.group(2).strip():
            continue
        digest = base64.b64encode(hashlib.sha256(m.group(2).encode("utf-8")).digest()).decode()
        hashes.append(f"'sha256-{digest}'")
    script_src = "script-src 'self'" + ((" " + " ".join(hashes)) if hashes else "")
    policy = re.sub(r"script-src\s+[^;]*", script_src, policy)
    novo = f'<meta http-equiv="Content-Security-Policy" content="{policy}">'
    return texto[:meta.start()] + novo + texto[meta.end():]

def atualizar_paginas_principais(config: dict):
    seo = config.get("seo", {})
    empresa = config.get("empresa", {})
    nome = str(empresa.get("nome") or "Loja")

    for pagina, arquivo in PAGINAS.items():
        path = ROOT / arquivo
        texto = path.read_text(encoding="utf-8")
        dados = (seo.get("paginas", {}) or {}).get(pagina, {})
        if pagina == "home":
            dados = {
                "title": seo.get("title"),
                "description": seo.get("description"),
                "canonical": seo.get("canonical"),
                **dados,
            }
        title = str(dados.get("title") or f"{nome} | Produtos Naturais")
        description = str(dados.get("description") or empresa.get("descricao") or "")
        canonical = str(dados.get("canonical") or empresa.get("site") or "")
        texto = atualizar_title(texto, title)
        texto = atualizar_meta(texto, "description", description)
        texto = atualizar_meta(texto, "author", nome)
        if pagina == "quiz" and config.get("recursos", {}).get("quiz", True) is False:
            texto = atualizar_meta(texto, "robots", "noindex, nofollow")
        else:
            texto = atualizar_meta(texto, "robots", "index, follow")
        texto = atualizar_meta(texto, "og:title", title, True)
        texto = atualizar_meta(texto, "og:description", description, True)
        if canonical:
            texto = atualizar_canonical(texto, canonical)
            texto = atualizar_meta(texto, "og:url", canonical, True)
        texto = atualizar_textos_configuraveis(texto, config)
        m_jsonld = re.search(
            r'(<script type=["\']application/ld\+json["\'] id=["\']dados-estruturados["\']>)(.*?)(</script>)',
            texto,
            re.I | re.S,
        )
        if m_jsonld:
            try:
                dados_jsonld = json.loads(m_jsonld.group(2))
                if isinstance(dados_jsonld, dict):
                    if dados_jsonld.get("@type") == "Organization":
                        dados_jsonld["name"] = nome
                        dados_jsonld["url"] = canonical or empresa.get("site")
                    elif isinstance(dados_jsonld.get("@graph"), list):
                        for item in dados_jsonld["@graph"]:
                            if isinstance(item, dict) and item.get("@type") in {"Organization", "Store"}:
                                item["name"] = nome
                    novo_jsonld = json.dumps(dados_jsonld, ensure_ascii=False, separators=(",", ":"))
                    texto = texto[:m_jsonld.start(2)] + novo_jsonld + texto[m_jsonld.end(2):]
            except json.JSONDecodeError:
                pass
        texto = recalcular_csp(texto)
        path.write_text(texto, encoding="utf-8", newline="\n")


def gerar_pagina_produto(config: dict, produto: dict, categoria_nome: str) -> str:
    empresa = config.get("empresa", {})
    marca = config.get("marca", {})
    nome_loja = str(empresa.get("nome") or "Loja")
    base = site_base(empresa.get("site"))
    slug = str(produto.get("slug") or "")
    nome = str(produto.get("nome") or "")
    descricao = str(produto.get("copy") or produto.get("descricao") or "")
    imagem_nome = str(produto.get("imagem") or "")
    url = urljoin(base, f"produto/{slug}.html")
    imagem_url = urljoin(base, f"img/{imagem_nome}")
    logo = str(marca.get("logoImagem") or "img/logo-saude-qualimax.webp")
    logo_rel = "../" + logo
    categoria = str(produto.get("categoria") or "")

    itens = []
    if produto.get("tipo"):
        itens.append(f"Formato: {produto['tipo']}")
    if produto.get("vegana"):
        itens.append("Cadastrado como vegano")
    if produto.get("sem_gluten"):
        itens.append("Cadastrado como sem glúten")
    itens.extend(str(x) for x in produto.get("beneficios", []) if str(x).strip())
    lista_html = "".join(f"<li>{html.escape(x)}</li>" for x in itens)

    estruturado = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "name": nome,
                "description": descricao,
                "image": imagem_url,
                "category": categoria_nome,
                "url": url,
                "brand": {"@type": "Brand", "name": nome_loja},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Início", "item": base},
                    {"@type": "ListItem", "position": 2, "name": "Catálogo", "item": urljoin(base, "catalogo.html")},
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": categoria_nome,
                        "item": urljoin(base, f"catalogo.html?categoria={categoria}#produtos"),
                    },
                    {"@type": "ListItem", "position": 4, "name": nome, "item": url},
                ],
            },
        ],
    }

    texto = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests">
<meta name="referrer" content="strict-origin-when-cross-origin">
<script src="../js/frame-guard.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(nome)} | {html.escape(nome_loja)}</title>
<meta name="description" content="{html.escape(descricao, quote=True)}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="{html.escape(str(marca.get("corPrincipal") or "#176b4d"), quote=True)}">
<link rel="canonical" href="{html.escape(url, quote=True)}">
<meta property="og:type" content="product">
<meta property="og:title" content="{html.escape(nome + " | " + nome_loja, quote=True)}">
<meta property="og:description" content="{html.escape(descricao, quote=True)}">
<meta property="og:url" content="{html.escape(url, quote=True)}">
<meta property="og:image" content="{html.escape(imagem_url, quote=True)}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(nome + " | " + nome_loja, quote=True)}">
<meta name="twitter:description" content="{html.escape(descricao, quote=True)}">
<meta name="twitter:image" content="{html.escape(imagem_url, quote=True)}">
<link rel="manifest" href="../manifest.webmanifest">
<script type="application/ld+json" id="produto-estruturado">{json.dumps(estruturado, ensure_ascii=False, separators=(",", ":"))}</script>
<link rel="stylesheet" href="../style.css">
<script src="../js/pwa.js" defer></script>
<script src="../js/interacoes.js" defer></script>
</head>
<body class="produto-pagina" data-produto-id="{int(produto.get("id") or 0)}">
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header class="produto-pagina-topo"><div class="container produto-topo-conteudo"><a href="../index.html" class="logo logo-imagem-link" data-config-logo-label aria-label="{html.escape(nome_loja, quote=True)} - voltar ao início"><img src="{html.escape(logo_rel, quote=True)}" data-config-logo-img class="logo-imagem" alt="{html.escape(nome_loja, quote=True)}"><span class="sr-only logo-texto">{html.escape(nome_loja)}</span></a><div class="produto-topo-acoes"><a href="../catalogo.html#produtos">Catálogo</a><a href="../conta.html">Minha conta</a></div></div></header>
<nav class="breadcrumb container produto-breadcrumb" aria-label="Você está aqui"><ol><li><a href="../index.html">Início</a></li><li><a href="../catalogo.html">Catálogo</a></li><li><a href="../catalogo.html?categoria={html.escape(categoria, quote=True)}#produtos">{html.escape(categoria_nome)}</a></li><li aria-current="page">{html.escape(nome)}</li></ol></nav>
<main id="conteudo" class="produto-pagina-main"><div class="container produto-pagina-grid">
<div><img class="produto-pagina-img" src="../img/{html.escape(imagem_nome, quote=True)}" alt="{html.escape(nome, quote=True)}"></div>
<article class="produto-pagina-info">
<p class="secao-subtitulo"><a class="produto-categoria-link" href="../catalogo.html?categoria={html.escape(categoria, quote=True)}#produtos">{html.escape(categoria_nome)}</a></p>
<h1>{html.escape(nome)}</h1>
<p class="produto-pagina-copy">{html.escape(descricao)}</p>
<ul class="produto-modal-lista">{lista_html}</ul>
<p class="produto-pagina-aviso">Disponibilidade, valor atual e condições comerciais devem ser confirmados diretamente com a equipe.</p>
<div class="produto-pagina-acoes"><a class="botao botao-principal" href="#" data-produto-whatsapp>Consultar pelo WhatsApp</a><button class="botao botao-secundario" type="button" data-compartilhar>Compartilhar produto</button><a class="botao botao-secundario" href="../catalogo.html#produtos" data-retomar-catalogo>Voltar ao catálogo</a></div>
<p class="sr-only" role="status" aria-live="polite" data-share-status></p>
</article></div>
<div class="container produto-pos-conteudo">
<section class="produto-relacionados-pagina" aria-labelledby="relacionados-titulo" data-produto-relacionados hidden><h2 id="relacionados-titulo">Você também pode explorar</h2><div class="produto-relacionados-grid-pagina" data-relacionados-grid></div></section>
<nav class="produto-navegacao" aria-label="Navegação entre produtos" data-produto-navegacao></nav>
</div></main>
<script src="../js/db.js" defer></script>
<script src="../js/produto-page.js" defer></script>
</body>
</html>'''
    return recalcular_csp(texto)

def atualizar_produtos(config: dict, produtos: list[dict], categorias: list[dict]):
    empresa = config.get("empresa", {})
    marca = config.get("marca", {})
    nome_loja = str(empresa.get("nome") or "Loja")
    base = site_base(empresa.get("site"))
    logo = str(marca.get("logoImagem") or "")

    nomes_categorias = {str(c.get("id")): str(c.get("nome") or c.get("id") or "") for c in categorias}

    slugs_ativos = set()

    for produto in produtos:
        slug = str(produto.get("slug") or "")
        slugs_ativos.add(slug)
        path = ROOT / "produto" / f"{slug}.html"
        path.parent.mkdir(exist_ok=True)
        categoria_nome = nomes_categorias.get(
            str(produto.get("categoria") or ""),
            str(produto.get("categoria") or "").replace("-", " ").title(),
        )

        # Regenera a página inteira para que alterações feitas no Admin Studio
        # (nome, copy, imagem, categoria, características etc.) apareçam no HTML.
        path.write_text(
            gerar_pagina_produto(config, produto, categoria_nome),
            encoding="utf-8",
            newline="\n",
        )

        texto = path.read_text(encoding="utf-8")
        nome = str(produto.get("nome") or "")
        descricao = str(produto.get("copy") or produto.get("descricao") or "")
        url = urljoin(base, f"produto/{slug}.html")
        imagem = urljoin(base, f"img/{produto.get('imagem','')}")

        texto = atualizar_title(texto, f"{nome} | {nome_loja}")
        texto = atualizar_meta(texto, "description", descricao)
        texto = atualizar_meta(texto, "og:title", f"{nome} | {nome_loja}", True)
        texto = atualizar_meta(texto, "og:description", descricao, True)
        texto = atualizar_meta(texto, "og:url", url, True)
        texto = atualizar_meta(texto, "og:image", imagem, True)
        texto = atualizar_meta(texto, "twitter:title", f"{nome} | {nome_loja}")
        texto = atualizar_meta(texto, "twitter:description", descricao)
        texto = atualizar_meta(texto, "twitter:image", imagem)
        texto = atualizar_canonical(texto, url)
        texto = atualizar_textos_configuraveis(texto, config)

        m = re.search(
            r'(<script type=["\']application/ld\+json["\'] id=["\']produto-estruturado["\']>)(.*?)(</script>)',
            texto,
            re.I | re.S,
        )
        if m:
            dados = json.loads(m.group(2))
            for item in dados.get("@graph", []):
                tipo = item.get("@type")
                if tipo == "Product":
                    item["name"] = nome
                    item["description"] = descricao
                    item["image"] = imagem
                    item["url"] = url
                    item["brand"] = {"@type": "Brand", "name": nome_loja}
                elif tipo == "BreadcrumbList":
                    elementos = item.get("itemListElement", [])
                    if elementos:
                        elementos[0]["item"] = base
                    if len(elementos) > 1:
                        elementos[1]["item"] = urljoin(base, "catalogo.html")
                    if len(elementos) > 2:
                        cat = str(produto.get("categoria") or "")
                        elementos[2]["item"] = urljoin(base, f"catalogo.html?categoria={cat}#produtos")
                    if len(elementos) > 3:
                        elementos[3]["item"] = url
            novo = json.dumps(dados, ensure_ascii=False, separators=(",", ":"))
            texto = texto[:m.start(2)] + novo + texto[m.end(2):]

        if logo:
            # páginas de produto usam caminho relativo para a imagem da marca
            rel_logo = "../" + logo
            texto = re.sub(
                r'(<img\b[^>]*\bdata-config-logo-img\b[^>]*\bsrc=["\'])[^"\']*(["\'])',
                lambda x: x.group(1) + html.escape(rel_logo, quote=True) + x.group(2),
                texto,
                flags=re.I,
            )

        texto = recalcular_csp(texto)
        path.write_text(texto, encoding="utf-8", newline="\n")


    # Remove páginas individuais de produtos excluídos do catálogo.
    pasta_produtos = ROOT / "produto"
    for pagina in pasta_produtos.glob("*.html"):
        if pagina.stem not in slugs_ativos:
            pagina.unlink()


def atualizar_manifest(config: dict):
    path = ROOT / "manifest.webmanifest"
    manifest = carregar_json(path)
    empresa = config.get("empresa", {})
    marca = config.get("marca", {})
    nome = str(empresa.get("nome") or "Loja")
    manifest["name"] = nome
    manifest["short_name"] = nome[:24]
    manifest["description"] = str(empresa.get("descricao") or "")
    if marca.get("corPrincipal"):
        manifest["theme_color"] = marca["corPrincipal"]
    if marca.get("corFundo"):
        manifest["background_color"] = marca["corFundo"]
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

def atualizar_sitemap(config: dict, produtos: list[dict]):
    base = site_base(config.get("empresa", {}).get("site"))
    hoje = dt.date.today().isoformat()
    paginas = ["catalogo.html", "sobre.html", "contato.html"]
    if config.get("recursos", {}).get("quiz", True) is not False:
        paginas.insert(1, "quiz.html")
    urls = [base] + [urljoin(base, x) for x in paginas]
    urls += [urljoin(base, f"produto/{p['slug']}.html") for p in produtos]
    linhas = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        linhas.append(f"  <url><loc>{html.escape(url)}</loc><lastmod>{hoje}</lastmod></url>")
    linhas.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(linhas) + "\n", encoding="utf-8", newline="\n")
    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {urljoin(base, 'sitemap.xml')}\n",
        encoding="utf-8",
        newline="\n",
    )

def atualizar_security(config: dict):
    empresa = config.get("empresa", {})
    contato = config.get("contato", {})
    base = site_base(empresa.get("site"))
    email = str(contato.get("email") or "").strip()
    if not email:
        return
    expires = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=365)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    pasta = ROOT / ".well-known"
    pasta.mkdir(exist_ok=True)
    (pasta / "security.txt").write_text(
        f"Contact: mailto:{email}\n"
        "Preferred-Languages: pt-BR\n"
        f"Canonical: {urljoin(base, '.well-known/security.txt')}\n"
        f"Expires: {expires}\n",
        encoding="utf-8",
        newline="\n",
    )

def validar(config: dict, produtos: list[dict]):
    empresa = config.get("empresa", {})
    exigir(str(empresa.get("nome") or "").strip(), "empresa.nome é obrigatório")
    site_base(empresa.get("site"))
    exigir(len(produtos) > 0, "O catálogo não possui produtos.")
    slugs = [str(p.get("slug") or "") for p in produtos]
    exigir(len(slugs) == len(set(slugs)), "Existem slugs de produtos duplicados.")
    for produto in produtos:
        slug = str(produto.get("slug") or "")
        imagem = str(produto.get("imagem") or "")
        exigir(bool(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug)), f"Slug inválido: {slug!r}")
        exigir(bool(re.fullmatch(r"[A-Za-z0-9._-]+", imagem)), f"Nome de imagem inválido no produto {produto.get('nome')!r}")

    recursos = config.get("recursos", {})
    for chave in ("quiz", "jornadaLocal", "colecoes", "pwa"):
        if chave in recursos:
            exigir(isinstance(recursos[chave], bool), f"recursos.{chave} deve ser true ou false")

    comercial = config.get("comercial", {})
    for chave in ("horario", "entrega", "retirada", "observacoes"):
        if chave in comercial:
            exigir(isinstance(comercial[chave], str), f"comercial.{chave} deve ser texto")

def main():
    parser = argparse.ArgumentParser(description="Sincroniza a plataforma com data/config.json.")
    parser.add_argument("--check", action="store_true", help="Valida a configuração sem alterar arquivos.")
    args = parser.parse_args()

    try:
        config = carregar_json(CONFIG)
        produtos = carregar_json(PRODUTOS).get("produtos", [])
        categorias = carregar_json(ROOT / "data" / "categorias.json").get("categorias", [])
        validar(config, produtos)
        if args.check:
            print("Configuração válida.")
            print(f"Cliente: {config['empresa']['nome']}")
            print(f"Site: {site_base(config['empresa']['site'])}")
            print(f"Produtos: {len(produtos)}")
            return 0

        atualizar_paginas_principais(config)
        atualizar_produtos(config, produtos, categorias)
        atualizar_manifest(config)
        atualizar_sitemap(config, produtos)
        atualizar_security(config)
        print("Sincronização concluída.")
        print(f"Cliente: {config['empresa']['nome']}")
        print(f"Páginas de produto: {len(produtos)}")
        return 0
    except Exception as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
