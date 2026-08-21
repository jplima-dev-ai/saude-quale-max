from pathlib import Path
import json,re,sys
R=Path(__file__).resolve().parents[1];errors=[]
for f in ['cart.html','campaigns.html','assets/styles/commerce.css','assets/scripts/commerce-v333.js','data/v333.json','assets/images/max-avatar-v333.svg']:
 if not (R/f).exists():errors.append('ausente: '+f)
for p in list(R.glob('*.html'))+list((R/'products').glob('*.html')):
 t=p.read_text(encoding='utf-8')
 if p.name not in ['offline.html','404.html'] and 'commerce-v333.js' not in t:errors.append(f'{p}: sem v333.js')
json.load(open(R/'data/v333.json',encoding='utf-8'));products=json.load(open(R/'data/products.json',encoding='utf-8'))['produtos'];slugs={p['slug'] for p in products}
cfg=json.load(open(R/'data/v333.json',encoding='utf-8'))
for k in cfg['kits']:
 for s in k['slugs']:
  if s not in slugs:errors.append(f'kit {k["id"]}: slug inválido {s}')
js=(R/'assets/scripts/commerce-v333.js').read_text(encoding='utf-8')
for feature in ['commandPalette','pageCart','campaigns','accountRebuy','substitution','admin','smartSearch']:
 if f'function {feature}' not in js:errors.append('recurso ausente: '+feature)
if 'historicoPreco(),comparador()' in (R/'assets/scripts/commerce-v332.js').read_text(encoding='utf-8'):errors.append('transparência pública de pesquisa de preço ainda ativa')
if json.load(open(R/'data/config.json',encoding='utf-8'))['comercial']['precosAproximados']:errors.append('preço ainda marcado como aproximado')
print('v3.3.3:', 'OK' if not errors else 'FALHOU');print('\n'.join(errors));sys.exit(bool(errors))
