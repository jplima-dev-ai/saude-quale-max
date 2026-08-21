#!/usr/bin/env python3
from pathlib import Path
import json,re,hashlib,base64
ROOT=Path(__file__).resolve().parents[1]

PAGES={"sobre.html":"about.html","catalogo.html":"catalog.html","conta.html":"account.html","contato.html":"contact.html","atendimento.html":"support.html","carrinho.html":"cart.html","campanhas.html":"campaigns.html"}
SCRIPTS={"acessibilidade.js":"accessibility.js","atendimento.js":"support.js","categorias.js":"categories.js","colecoes.js":"collections.js","conta.js":"account.js","descobertas.js":"discovery.js","interacoes.js":"interactions.js","jornada.js":"journey.js","produto-page.js":"product-page.js","produtos.js":"products.js","promocoes.js":"promotions.js","max-entidades.js":"max-entities.js","max-intencoes.js":"max-intents.js","max-recomendacao.js":"max-recommendation.js","v332.js":"commerce-v332.js","v333.js":"commerce-v333.js"}
DATA={"categorias.json":"categories.json","cestas.json":"baskets.json","produtos.json":"products.json","precos-pesquisa.json":"price-research.json"}
DOCS={"ACESSIBILIDADE.md":"ACCESSIBILITY.md","ARQUITETURA.md":"ARCHITECTURE.md","CATALOGO-E-CONTEUDO.md":"CATALOG-AND-CONTENT.md","CONFIGURACAO.md":"CONFIGURATION.md","OPERACAO-LOCAL.md":"LOCAL-OPERATIONS.md","PRIVACIDADE.md":"PRIVACY.md","PUBLICACAO.md":"DEPLOYMENT.md","TESTES-E-QUALIDADE.md":"TESTING-AND-QUALITY.md","WHITE-LABEL-E-CLIENTES.md":"WHITE-LABEL.md","ANIMACOES.md":"ANIMATIONS.md"}
TOOLS={"auditar_cliente.py":"audit-client.py","auditar_estrutura_331.py":"audit-structure-v331.py","empacotar_publicacao.py":"package-release.py","gerar_loja.py":"generate-store.py","migrar_v332.py":"migrate-v332.py","migrar_v333.py":"migrate-v333.py","migrar_v334.py":"migrate-v334.py","sincronizar_cliente.py":"sync-client.py","atualizar_documentacao_333.py":"update-documentation-v333.py","testar_afinidade_cesta.py":"test-basket-affinity.py","testar_afinidade_presente.py":"test-gift-affinity.py","testar_carrinho_max.py":"test-max-cart.py","testar_cesta_max.cjs":"test-max-basket.cjs","testar_comercial.py":"test-commerce.py","testar_correcao_331.py":"test-fixes-v331.py","testar_decision_328.py":"test-decision-v328.py","testar_decision_max.cjs":"test-max-decision.cjs","testar_estado_max.py":"test-max-state.py","testar_horario_max.cjs":"test-max-time.cjs","testar_horario_max.py":"test-max-time.py","testar_max.cjs":"test-max.cjs","testar_max_nlu.cjs":"test-max-nlu.cjs","testar_memoria_max.py":"test-max-memory.py","testar_promocoes_33.py":"test-promotions-v33.py","testar_seguranca.py":"test-security.py","testar_tom_max.py":"test-max-tone.py","testar_v332.py":"test-v332.py","testar_v333.py":"test-v333.py","testar_v334.py":"test-v334.py"}
SLUGS={"vitamina-c-natural":"natural-vitamin-c","complexo-b-completo":"complete-b-complex","ferro-vitamina-c":"iron-vitamin-c","propolis-premium":"premium-propolis","cha-camomila-premium":"premium-chamomile-tea","oleo-de-coco-organico":"organic-coconut-oil","cha-verde-matcha":"matcha-green-tea","colageno-hidrolisado":"hydrolyzed-collagen","semente-de-chia":"chia-seeds","semente-de-linhaca-dourada":"golden-flaxseed","psyllium-em-po":"psyllium-powder","aveia-em-flocos":"rolled-oats","granola-tradicional":"traditional-granola","castanha-do-para":"brazil-nuts","castanha-de-caju":"cashew-nuts","mix-de-castanhas-e-sementes":"nuts-and-seeds-mix","pasta-de-amendoim-integral":"whole-peanut-butter","oleo-de-coco-extravirgem":"extra-virgin-coconut-oil","vinagre-de-maca":"apple-cider-vinegar","curcuma-em-po":"turmeric-powder","gengibre-em-po":"ginger-powder","canela-em-po":"cinnamon-powder","cha-de-hibisco":"hibiscus-tea","cha-de-erva-cidreira":"lemon-balm-tea","cha-de-gengibre":"ginger-tea","whey-protein":"whey-protein","creatina-monohidratada":"creatine-monohydrate","magnesio":"magnesium","multivitaminico":"multivitamin","vitamina-d":"vitamin-d","sabonete-natural-de-ervas":"natural-herbal-soap","oleo-essencial-de-lavanda":"lavender-essential-oil","pacoca-integral-de-amendoim":"whole-peanut-candy","chocolate-sem-adicao-de-acucares":"no-added-sugar-chocolate","biscoito-integral-de-aveia":"whole-oat-cookies","mel":"honey","acucar-mascavo":"brown-sugar","sal-rosa-do-himalaia":"himalayan-pink-salt","xarope-natural-de-ervas":"natural-herbal-syrup","cacau-em-po":"cocoa-powder","protetor-solar-mineral":"mineral-sunscreen","maca-peruana-em-po":"maca-powder","sabonete-artesanal-vegetal":"handmade-vegetable-soap","oleo-de-rosa-mosqueta-puro":"pure-rosehip-oil","argila-verde-facial":"facial-green-clay","desodorante-natural-em-cristal":"natural-crystal-deodorant","xampu-solido-natural":"natural-solid-shampoo"}
IMAGE_STEMS={"sobre-loja-natural":"about-natural-store","entrega-local":"local-delivery","produtos-naturais":"natural-products","hero-produtos-naturais":"hero-natural-products","bem-estar-natural":"natural-wellness","cuidados-pessoais":"personal-care","chas-ervas":"teas-and-herbs","vitaminas-suplementos":"vitamins-and-supplements","curcuma-po":"turmeric-powder","gengibre-po":"ginger-powder","canela-po":"cinnamon-powder","cha-hibisco":"hibiscus-tea","cha-gengibre":"ginger-tea","cha-erva-cidreira":"lemon-balm-tea","semente-chia":"chia-seeds","semente-linhaca-dourada":"golden-flaxseed","castanha-do-para":"brazil-nuts","castanha-de-caju":"cashew-nuts","mix-castanhas-sementes":"nuts-and-seeds-mix","pasta-amendoim-integral":"whole-peanut-butter","oleo-coco-extravirgem":"extra-virgin-coconut-oil","vinagre-de-maca":"apple-cider-vinegar","aveia-em-flocos":"rolled-oats","granola-tradicional":"traditional-granola","multivitaminico":"multivitamin","vitamina-d":"vitamin-d","magnesio":"magnesium","creatina-monohidratada":"creatine-monohydrate","maca-peruana-em-po":"maca-powder","oleo-essencial-lavanda":"lavender-essential-oil","xampu-solido-natural":"natural-solid-shampoo","biscoito-integral-de-aveia":"whole-oat-cookies","pacoca-integral-de-amendoim":"whole-peanut-candy","xarope-natural-de-ervas":"natural-herbal-syrup","sal-rosa-do-himalaia":"himalayan-pink-salt","sabonete-natural-ervas":"natural-herbal-soap","sabonete-artesanal-vegetal":"handmade-vegetable-soap","argila-verde-facial":"facial-green-clay","acucar-mascavo":"brown-sugar","oleo-rosa-mosqueta-puro":"pure-rosehip-oil","protetor-solar-mineral":"mineral-sunscreen","desodorante-natural-cristal":"natural-crystal-deodorant","cacau-em-po":"cocoa-powder","psyllium-po":"psyllium-powder","chocolate-sem-adicao-de-acucares":"no-added-sugar-chocolate","mel":"honey"}

def move(old,new):
 a,b=ROOT/old,ROOT/new
 if a==b:return
 if a.exists():
  b.parent.mkdir(parents=True,exist_ok=True)
  if b.exists():raise RuntimeError("destination exists: "+str(b))
  a.rename(b)

for a,b in PAGES.items():move(a,b)
move("produto","products");move("img","assets/images");move("js","assets/scripts")
move("style.css","assets/styles/main.css");move("v333.css","assets/styles/commerce.css");move("animations.css","assets/styles/animations.css")
move("script.js","assets/scripts/site.js");move("new-products-contact.jpg","assets/images/new-products-contact.jpg");move("sw.js","service-worker.js")
for a,b in SCRIPTS.items():move("assets/scripts/"+a,"assets/scripts/"+b)
for a,b in DATA.items():move("data/"+a,"data/"+b)
for a,b in DOCS.items():move("docs/"+a,"docs/"+b)
for a,b in SLUGS.items():move("products/"+a+".html","products/"+b+".html")

image_names={}
for p in list((ROOT/"assets/images").rglob("*")):
 if p.is_file() and p.stem in IMAGE_STEMS:
  dest=p.with_name(IMAGE_STEMS[p.stem]+p.suffix);image_names[p.name]=dest.name;p.rename(dest)

PATHS={}
PATHS.update(PAGES)
PATHS.update({"produto/":"products/","img/":"assets/images/","js/":"assets/scripts/","script.js":"assets/scripts/site.js","sw.js":"service-worker.js"})
for a,b in SCRIPTS.items():PATHS["assets/scripts/"+a]="assets/scripts/"+b
for a,b in DATA.items():PATHS["data/"+a]="data/"+b
for a,b in DOCS.items():PATHS[a]=b
for a,b in TOOLS.items():PATHS["tools/"+a]="tools/"+b
PATHS.update({'href="style.css"':'href="assets/styles/main.css"','href="../style.css"':'href="../assets/styles/main.css"','href="v333.css"':'href="assets/styles/commerce.css"','href="../v333.css"':'href="../assets/styles/commerce.css"','href="animations.css"':'href="assets/styles/animations.css"','href="../animations.css"':'href="../assets/styles/animations.css'})
for old,new in SLUGS.items():PATHS["products/"+old+".html"]="products/"+new+".html"
for old,new in image_names.items():PATHS[old]=new

extensions={".html",".js",".css",".json",".md",".py",".cjs",".xml",".txt",".webmanifest"}
for p in ROOT.rglob("*"):
 if not p.is_file() or p.suffix.lower() not in extensions or "tools" in p.parts:continue
 text=p.read_text(encoding="utf-8",errors="ignore")
 for old,new in sorted(PATHS.items(),key=lambda x:len(x[0]),reverse=True):text=text.replace(old,new)
 p.write_text(text,encoding="utf-8")

def translate_json(value):
 if isinstance(value,dict):return {k:translate_json(v) for k,v in value.items()}
 if isinstance(value,list):return [translate_json(v) for v in value]
 if isinstance(value,str):
  if value in SLUGS:return SLUGS[value]
  if value in image_names:return image_names[value]
 return value
for p in (ROOT/"data").glob("*.json"):
 value=translate_json(json.loads(p.read_text(encoding="utf-8")))
 if p.name in {"config.json","products.json"}:value["versao"]="3.3.5"
 p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

for a,b in TOOLS.items():move("tools/"+a,"tools/"+b)

tool_paths=dict(PATHS)
tool_paths.update({"'style.css'":"'assets/styles/main.css'","\"style.css\"":"\"assets/styles/main.css\"","'v333.css'":"'assets/styles/commerce.css'","\"v333.css\"":"\"assets/styles/commerce.css\"","'animations.css'":"'assets/styles/animations.css'","\"animations.css\"":"\"assets/styles/animations.css\""})
for old,new in DATA.items():
 tool_paths["'"+old+"'"]="'"+new+"'";tool_paths['"'+old+'"']='"'+new+'"'
for old,new in SCRIPTS.items():
 tool_paths["'"+old+"'"]="'"+new+"'";tool_paths['"'+old+'"']='"'+new+'"'
for p in (ROOT/"tools").iterdir():
 if not p.is_file() or p.name in {"migrate-v335.py","test-v335.py"} or p.suffix.lower() not in {".py",".cjs",".md"}:continue
 text=p.read_text(encoding="utf-8",errors="ignore")
 for old,new in sorted(tool_paths.items(),key=lambda x:len(x[0]),reverse=True):text=text.replace(old,new)
 text=text.replace("(R/'produto')","(R/'products')").replace('(R/"produto")','(R/"products")').replace('p.parent.name=="produto"','p.parent.name=="products"')
 text=text.replace('ROOT / "js"','ROOT / "assets" / "scripts"').replace("ROOT / 'js'","ROOT / 'assets' / 'scripts'").replace('R/"js"','R/"assets"/"scripts"').replace("R/'js'","R/'assets'/'scripts'")
 text=text.replace('ROOT/"js"','ROOT/"assets"/"scripts"').replace("ROOT/'js'","ROOT/'assets'/'scripts'")
 text=text.replace('ROOT / "img"','ROOT / "assets" / "images"').replace("ROOT / 'img'","ROOT / 'assets' / 'images'").replace('R/"img"','R/"assets"/"images"').replace("R/'img'","R/'assets'/'images'")
 text=text.replace('ROOT / "produto"','ROOT / "products"').replace("ROOT / 'produto'","ROOT / 'products'").replace('R/"produto"','R/"products"').replace("R/'produto'","R/'products'")
 text=text.replace('ROOT/"produto"','ROOT/"products"').replace("ROOT/'produto'","ROOT/'products'")
 text=text.replace("catalogo\\\\.html","catalog\\\\.html").replace("catalogo.html","catalog.html")
 text=text.replace("honeyhorCupom","melhorCupom")
 p.write_text(text,encoding="utf-8")

v334=ROOT/"tools/test-v334.py";text=v334.read_text(encoding="utf-8").replace('if cfg.get("versao")!="3.3.4"','if cfg.get("versao")!="3.3.5"').replace('for p in list(R.glob("*.html"))+list((R/"products").glob("*.html")):','for p in [x for x in R.glob("*.html") if x.name!="404.html"]+list((R/"products").glob("*.html")):')
v334.write_text(text,encoding="utf-8")
v333=ROOT/"tools/test-v333.py";text=v333.read_text(encoding="utf-8").replace("if p.name not in ['offline.html']","if p.name not in ['offline.html','404.html']")
v333.write_text(text,encoding="utf-8")
for name in ("test-fixes-v331.py","audit-client.py"):
 p=ROOT/"tools"/name;text=p.read_text(encoding="utf-8").replace('qualimax-v3.3.4','qualimax-v3.3.5').replace('ADMIN_BACKUP_VERSION="3.3.4"','ADMIN_BACKUP_VERSION="3.3.5"');p.write_text(text,encoding="utf-8")
admin=ROOT/"assets/scripts/admin.js";admin.write_text(admin.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.3.4"','ADMIN_BACKUP_VERSION="3.3.5"'),encoding="utf-8")

routes={"version":"3.3.5","defaultLocale":"pt-BR","routes":{},"legacyAliases":PAGES}
for old,new in PAGES.items():routes["routes"][Path(new).stem]={"path":new,"label":Path(old).stem}
routes["routes"].update({"home":{"path":"index.html","label":"inicio"},"admin":{"path":"admin.html","label":"admin"},"quiz":{"path":"quiz.html","label":"quiz"}})
(ROOT/"data/routes.json").write_text(json.dumps(routes,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

(ROOT/"404.html").write_text("""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Página não encontrada</title><link rel="stylesheet" href="assets/styles/main.css"></head><body><main class="container"><h1>Página não encontrada</h1><p>O endereço pode ter mudado durante a atualização.</p><p><a href="index.html">Voltar ao início</a></p></main></body></html>
""",encoding="utf-8")
manifest=ROOT/"manifest.webmanifest";manifest.write_text(manifest.read_text(encoding="utf-8").replace("v3.3.4","v3.3.5"),encoding="utf-8")
sw=ROOT/"service-worker.js";text=sw.read_text(encoding="utf-8").replace("qualimax-v3.3.4","qualimax-v3.3.5")
text=text.replace('"./v333.css"','"./assets/styles/commerce.css"').replace('"./animations.css"','"./assets/styles/animations.css"').replace('"./style.css"','"./assets/styles/main.css"')
if '"./data/routes.json"' not in text:text=text.replace('"./data/config.json",','"./data/config.json", "./data/routes.json",')
sw.write_text(text,encoding="utf-8")
readme=ROOT/"README.md";text=readme.read_text(encoding="utf-8").replace("**Versão atual: 3.3.4**","**Versão atual: 3.3.5**")
if "International-ready architecture" not in text:text=text.replace("## Estado atual","## International-ready architecture\n\nTechnical paths and public routes use English while storefront content remains in Portuguese. Route metadata is centralized in data/routes.json for future pt-BR and en-US layers.\n\n## Estado atual")
readme.write_text(text,encoding="utf-8")
(ROOT/"docs/INTERNATIONAL-ARCHITECTURE.md").write_text("""# International-ready architecture

Technical filenames and routes use English while customer-facing content remains independent.

## Structure

- assets/images: media;
- assets/scripts: application modules;
- assets/styles: stylesheets;
- data: configuration and content;
- products: product pages;
- docs: documentation;
- tools: automation.

data/routes.json is the route registry. Future locales translate content and labels, not engineering paths. This version changes public URLs; review canonical URLs, sitemap, external links and deployment redirects.
""",encoding="utf-8")

for page in [*ROOT.glob("*.html"),*(ROOT/"products").glob("*.html")]:
 text=page.read_text(encoding="utf-8").replace("animations.css></head>","animations.css\"></head>")
 inline=[]
 for match in re.finditer(r"<script\b([^>]*)>(.*?)</script>",text,re.I|re.S):
  if "src=" not in match.group(1).lower() and match.group(2).strip():
   digest=base64.b64encode(hashlib.sha256(match.group(2).encode("utf-8")).digest()).decode()
   inline.append("'sha256-"+digest+"'")
 meta=re.search(r'(<meta http-equiv="Content-Security-Policy" content=")([^"]+)(">)',text,re.I)
 if meta:
  policy=re.sub(r"\s*'sha256-[^']+'","",meta.group(2))
  if inline:
   policy=policy.replace("script-src 'self'","script-src 'self' "+" ".join(inline))
  text=text[:meta.start()]+meta.group(1)+policy+meta.group(3)+text[meta.end():]
 page.write_text(text,encoding="utf-8")
print("International architecture v3.3.5 applied.")
