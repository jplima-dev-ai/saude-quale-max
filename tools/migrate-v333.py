from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
admin=ROOT/'assets/scripts/admin.js';t=admin.read_text(encoding='utf-8').replace('ADMIN_BACKUP_VERSION="3.3.2"','ADMIN_BACKUP_VERSION="3.3.3"');admin.write_text(t,encoding='utf-8')
produtos_js=ROOT/'assets/scripts/products.js';t=produtos_js.read_text(encoding='utf-8').replace('Preço aproximado por 100 g','Preço por 100 g').replace('preço aproximado por 100 g','preço por 100 g');produtos_js.write_text(t,encoding='utf-8')
v332=ROOT/'assets/scripts/commerce-v332.js';t=v332.read_text(encoding='utf-8').replace('historicoPreco(),comparador()','comparador()');v332.write_text(t,encoding='utf-8')
skip={"cart.html","campaigns.html","offline.html","admin.html"}
for p in ROOT.glob("*.html"):
    text=p.read_text(encoding="utf-8")
    if 'Content-Security-Policy' not in text:
        text=text.replace('<meta name="viewport"','<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\'; img-src \'self\' data:; connect-src \'self\'; object-src \'none\'; frame-src \'none\'; base-uri \'self\'; form-action \'self\'"><meta name="viewport"')
    if 'assets/styles/commerce.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="assets/styles/commerce.css"></head>')
    if 'assets/scripts/commerce-v333.js' not in text:text=text.replace('</body>','<script src="assets/scripts/commerce-v333.js" defer></script></body>')
    if p.name in {'index.html','catalog.html','account.html','admin.html'} and 'assets/scripts/commerce-v332.js' not in text:
        text=text.replace('<script src="assets/scripts/commerce-v333.js" defer></script>','<script src="assets/scripts/commerce-v332.js" defer></script><script src="assets/scripts/commerce-v333.js" defer></script>')
    text=text.replace('assets/images/max-avatar.webp','assets/images/max-avatar-v333.svg')
    p.write_text(text,encoding="utf-8")
for p in (ROOT/'products').glob('*.html'):
    text=p.read_text(encoding='utf-8')
    if '../assets/styles/commerce.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="../assets/styles/commerce.css"></head>')
    if '../assets/scripts/commerce-v333.js' not in text:text.replace('</body>','<script src="../assets/scripts/commerce-v333.js" defer></script></body>')
    text=text.replace('assets/images/max-avatar.webp','assets/images/max-avatar-v333.svg').replace('../assets/images/max-avatar.webp','../assets/images/max-avatar-v333.svg')
    if '../assets/scripts/commerce-v333.js' not in text:text=text.replace('</body>','<script src="../assets/scripts/commerce-v333.js" defer></script></body>')
    p.write_text(text,encoding='utf-8')
cfg=json.loads((ROOT/'data/config.json').read_text(encoding='utf-8'));cfg['chatbot']['avatar']='assets/images/max-avatar-v333.svg';cfg['versao']='3.3.3';cfg['comercial']['precosAproximados']=False;cfg['recursos'].update({'carrinho':True,'variantes':True,'estoque':True,'campanhas':True,'kits':True,'comandos':True,'inteligenciaComercial':True});(ROOT/'data/config.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
prod=json.loads((ROOT/'data/products.json').read_text(encoding='utf-8'));prod['versao']='3.3.3';(ROOT/'data/products.json').write_text(json.dumps(prod,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for name in ['baskets.json']:
 p=ROOT/'data'/name;d=json.loads(p.read_text(encoding='utf-8'));d['versao']='3.3.3';p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sw=ROOT/'service-worker.js';t=sw.read_text(encoding='utf-8');t=re.sub(r'qualimax-[^"\']+', 'qualimax-v3.3.3',t,1)
if '"./cart.html"' not in t:t=t.replace('"./catalog.html",','"./catalog.html", "./cart.html", "./campaigns.html", "./assets/styles/commerce.css", "./assets/scripts/commerce-v333.js", "./data/v333.json",')
t=t.replace('"./assets/images/max-avatar.webp"','"./assets/images/max-avatar-v333.svg"');sw.write_text(t,encoding='utf-8')
