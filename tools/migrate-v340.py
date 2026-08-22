from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]

root_pages=list(ROOT.glob("*.html"))
for p in root_pages:
    s=p.read_text(encoding="utf-8")
    if "platform-v340.css" not in s:s=s.replace("</head>",'<link rel="stylesheet" href="assets/styles/platform-v340.css"></head>')
    if "platform-v340.js" not in s:s=s.replace("</body>",'<script src="assets/scripts/platform-v340.js" defer></script></body>')
    if "animations.css" not in s:s=s.replace("</head>",'<link rel="stylesheet" href="assets/styles/animations.css"></head>')
    if "commerce-v333.js" not in s:s=s.replace("</body>",'<script src="assets/scripts/commerce-v333.js" defer></script></body>')
    if "animations.js" not in s:s=s.replace("</body>",'<script src="assets/scripts/animations.js" defer></script></body>')
    if '<a href="discover.html">Descobrir</a>' not in s and '<a href="catalog.html">Catálogo</a>' in s:
        s=s.replace('<a href="catalog.html">Catálogo</a>','<a href="catalog.html">Catálogo</a><a href="discover.html">Descobrir</a>',1)
    p.write_text(s,encoding="utf-8")

# Corrige a recuperação para não depender da ordem assíncrona do módulo comercial.
platform=ROOT/"assets/scripts/platform-v340.js";s=platform.read_text(encoding="utf-8")
s=s.replace('const cart=window.QualimaxV333?.cart?.()||[];if(!cart.length)return;', 'const cart=window.QualimaxV333?.cart?.()||read("qualimax-carrinho-v333",[]);if(!cart.length)return;')
platform.write_text(s,encoding="utf-8")

# Atualiza a versão corrente sem alterar o histórico do changelog.
for rel in ["README.md","SECURITY.md","data/config.json","data/products.json","data/routes.json","tools/test-fixes-v331.py","tools/test-v334.py","tools/test-v335.py","tools/audit-client.py","tools/test-security-v336.py","tools/test-v337.py"]:
    p=ROOT/rel
    if p.exists():p.write_text(p.read_text(encoding="utf-8").replace("3.3.9","3.4.0").replace("qualimax-v3.3.9","qualimax-v3.4.0"),encoding="utf-8")
for rel in ["tools/test-sales-v3388.py","tools/test-v3388.py","tools/test-v339.py"]:
    p=ROOT/rel
    p.write_text(p.read_text(encoding="utf-8").replace("3.3.8","3.4.0").replace("3.3.9","3.4.0").replace("qualimax-v3.3.8","qualimax-v3.4.0").replace("qualimax-v3.3.9","qualimax-v3.4.0"),encoding="utf-8")
admin=ROOT/"assets/scripts/admin.js";admin.write_text(admin.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.3.9"','ADMIN_BACKUP_VERSION="3.4.0"'),encoding="utf-8")

routes=ROOT/"data/routes.json";r=json.loads(routes.read_text(encoding="utf-8"));r["version"]="3.4.0"
for page in ["guided-shopping.html","kit-builder.html","compare.html","discover.html","recipes.html"]:r.setdefault("routes",{})[page]={"locale":"pt-BR","public":True}
routes.write_text(json.dumps(r,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

sw=ROOT/"service-worker.js";s=sw.read_text(encoding="utf-8").replace("qualimax-v3.3.9","qualimax-v3.4.0")
items=['"./guided-shopping.html"','"./kit-builder.html"','"./compare.html"','"./discover.html"','"./recipes.html"','"./data/v340.json"','"./assets/styles/platform-v340.css"','"./assets/scripts/platform-v340.js"']
if "guided-shopping.html" not in s:s=s.replace('const SHELL = [','const SHELL = [\n  '+', '.join(items)+',')
sw.write_text(s,encoding="utf-8")

sitemap=ROOT/"sitemap.xml";s=sitemap.read_text(encoding="utf-8")
base="https://jplima-dev-ai.github.io/saude-quali-max/"
for page in ["guided-shopping.html","kit-builder.html","compare.html","discover.html","recipes.html"]:
    if page not in s:s=s.replace("</urlset>",f"  <url><loc>{base}{page}</loc></url>\n</urlset>")
sitemap.write_text(s,encoding="utf-8")

ch=ROOT/"docs/CHANGELOG.md";c=ch.read_text(encoding="utf-8")
entry='''## [3.4.0] — 2026-08-21\n\n### Plataforma comercial\n\n- Compra Guiada acessível em quatro etapas;\n- construtor de kits por orçamento e categoria;\n- comparador profissional de até quatro produtos;\n- central Descobrir por ocasiões;\n- receitas e combinações com ingredientes compráveis;\n- perfil local de preferências;\n- recuperação de carrinho com descarte explícito;\n- editor local do comportamento comercial do MAX;\n- base para métricas e oportunidades comerciais;\n- cinco novas rotas públicas, cache offline e sitemap atualizados.\n\n'''
if "## [3.4.0]" not in c:c=c.replace("## [3.3.9]",entry+"## [3.3.9]",1)
ch.write_text(c,encoding="utf-8")
