#!/usr/bin/env python3
from pathlib import Path
import re, sys

ROOT=Path(__file__).resolve().parents[1]
erros=[]

def ler(rel):
    return (ROOT/rel).read_text(encoding="utf-8")

# 1. Pré-atendimento nunca deve ter submit nativo.
at=ler("atendimento.html")
if re.search(r'<button\b[^>]*\btype=["\']submit["\']',at,re.I):
    erros.append("Pré-atendimento voltou a ter botão submit nativo.")
if 'data-atendimento-enviar' not in at:
    erros.append("Botão seguro do pré-atendimento não encontrado.")

atjs=ler("js/atendimento.js")
if 'form.addEventListener("submit",e=>e.preventDefault())' not in atjs:
    erros.append("Pré-atendimento não bloqueia submissão nativa.")
if 'data-atendimento-enviar' not in atjs:
    erros.append("Handler explícito do botão de atendimento ausente.")

# 2. URL de retorno do catálogo deve ser estritamente relativa.
prodpage=ler("js/produto-page.js")
if r'^catalogo\.html(?:\?[^#]*)?#produtos$' not in prodpage:
    erros.append("Validação estrita da URL de retorno do catálogo ausente.")
if r'^\/?.*catalogo\.html' in prodpage:
    erros.append("Regex permissiva de retorno do catálogo reapareceu.")

produtos=ler("js/produtos.js")
if 'sessionStorage.setItem("qualimax-catalogo-url", `catalogo.html' not in produtos:
    erros.append("Catálogo não armazena retorno relativo canônico.")

# 3. Proteção contra framing.
headers=ler("_headers") if (ROOT/"_headers").exists() else ""
for trecho in ["frame-ancestors 'none'","X-Frame-Options: DENY","X-Content-Type-Options: nosniff"]:
    if trecho not in headers:
        erros.append(f"Header de segurança ausente: {trecho}")

for page in ["admin.html","atendimento.html","conta.html"]:
    texto=ler(page)
    if re.search(r'<script src="js/frame-guard\.js"\s+defer',texto):
        erros.append(f"frame-guard tardio em {page}.")
    if '<script src="js/frame-guard.js"></script>' not in texto:
        erros.append(f"frame-guard síncrono ausente em {page}.")

# 4. Admin backup anti-DoS.
admin=ler("js/admin.js")
checks=[
    'file.size>64*1024*1024',
    'b.produtos.length>500',
    'imagensBackup.length>500',
    'String(img.dataUrl).length>7*1024*1024',
]
for c in checks:
    if c not in admin:
        erros.append(f"Limite de backup ausente: {c}")

# 5. Sinks perigosos proibidos.
fontes=list((ROOT/"js").glob("*.js"))+[ROOT/"script.js",ROOT/"sw.js"]
proibidos={
    "eval(":r'\beval\s*\(',
    "new Function":r'\bnew\s+Function\s*\(',
    "document.write":r'document\.write\s*\(',
    "javascript:":r'javascript\s*:',
}
for p in fontes:
    texto=p.read_text(encoding="utf-8",errors="ignore")
    for nome,pat in proibidos.items():
        if re.search(pat,texto,re.I):
            erros.append(f"{nome} encontrado em {p.relative_to(ROOT)}.")

# 6. WhatsApp direto só pode existir no último passo.
wa=[]
for p in list(ROOT.glob("*.html"))+list((ROOT/"js").glob("*.js"))+list((ROOT/"produto").glob("*.html")):
    if "wa.me/" in p.read_text(encoding="utf-8",errors="ignore"):
        wa.append(str(p.relative_to(ROOT)))
if wa != ["js/atendimento.js"]:
    erros.append(f"wa.me fora do ponto final esperado: {wa}")

# 7. Integridade do pedido e acessibilidade dos controles comerciais.
if 'data-atendimento-preview rows="18" maxlength="5000" readonly' not in at:
    erros.append("Prévia comercial deve permanecer somente leitura.")
if 'window.open(' in atjs:
    erros.append("Atendimento voltou a depender de window.open para WhatsApp.")
if 'link.rel="noopener noreferrer"' not in atjs:
    erros.append("Abertura do WhatsApp sem noopener/noreferrer.")
if 'label.className="atendimento-produto-item"' in atjs:
    erros.append("Controle de quantidade voltou a ficar dentro do label do checkbox.")
if 'nomeLabel.htmlFor=check.id' not in atjs or 'qLabel.htmlFor=qId' not in atjs:
    erros.append("Labels independentes de produto/quantidade ausentes.")

if erros:
    print("FALHA NA AUDITORIA DE SEGURANÇA")
    for e in erros:
        print("-",e)
    sys.exit(1)

print("SECURITY_REGRESSION_TESTS_OK")
