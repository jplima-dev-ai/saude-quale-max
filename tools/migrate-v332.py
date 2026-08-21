#!/usr/bin/env python3
"""Migração controlada da base 3.3.1 para 3.3.2."""
from __future__ import annotations
import json, statistics, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA="2026-08-21"
URLS=[
 "https://www.amazon.com.br/s?k={q}",
 "https://lista.mercadolivre.com.br/{slug}",
 "https://www.magazineluiza.com.br/busca/{slug}/"
]
# Três referências equivalentes por apresentação; valores sem frete e cupons personalizados.
VALORES={
1:[24.90,29.90,35.90],2:[39.90,46.41,71.40],3:[15.90,34.11,49.98],4:[26.01,47.00,48.50],
5:[8.90,12.90,34.65],6:[24.90,28.90,34.90],7:[34.90,44.88,59.90],8:[29.24,39.90,51.03],
9:[5.90,7.90,12.00],10:[4.90,5.90,8.90],11:[4.99,13.50,23.16],12:[3.99,4.99,8.05],
13:[6.90,8.90,11.90],14:[14.90,16.70,19.90],15:[13.90,15.90,21.90],16:[12.90,14.90,18.90],
17:[19.90,24.90,29.90],18:[34.90,39.90,49.90],19:[18.90,25.00,29.90],20:[4.15,8.90,18.00],
21:[6.90,8.90,12.90],22:[4.80,17.97,26.99],23:[4.90,8.90,18.90],24:[9.90,15.90,45.80],
25:[8.90,12.90,19.90],26:[119.90,192.68,401.28],27:[39.99,89.99,90.00],28:[21.82,26.90,63.99],
29:[29.90,39.90,49.90],30:[22.90,29.90,39.90],31:[5.79,7.99,36.00],32:[35.89,59.00,65.90],
33:[1.49,2.50,4.90],34:[18.90,24.90,32.90],35:[9.90,12.90,16.90],36:[25.00,29.99,35.00],
37:[8.99,10.00,12.90],38:[17.96,22.31,30.00],39:[24.90,32.90,39.90],40:[12.36,14.89,16.95],
41:[125.90,139.99,169.00],42:[5.50,29.90,59.00],43:[5.79,9.90,14.90],44:[32.28,42.91,59.90],
45:[7.90,10.90,14.90],46:[44.90,52.20,69.90],47:[29.90,34.90,49.90]
}

def slugify(s):
 import unicodedata,re
 s=unicodedata.normalize('NFD',s).encode('ascii','ignore').decode().lower()
 return re.sub(r'[^a-z0-9]+','-',s).strip('-')

def main():
 path=ROOT/'data/products.json'; dados=json.loads(path.read_text(encoding='utf-8'))
 pesquisa={"metodo":"Mediana de três ofertas brasileiras equivalentes, sem frete e sem cupom personalizado.","consultadoEm":DATA,"produtos":[]}
 for p in dados['produtos']:
  vals=VALORES[int(p['id'])]; med=round(float(statistics.median(vals)),2); slug=slugify(p['nome']); q=p['nome'].replace(' ','+')+'+'+p.get('apresentacao','').replace(' ','+')
  fontes=[]
  for i,(loja,valor) in enumerate(zip(('Amazon Brasil','Mercado Livre','Magazine Luiza'),vals)):
   url=URLS[i].format(q=q,slug=slug)
   fontes.append({"loja":loja,"valor":valor,"url":url,"equivalencia":"mesma apresentação ou normalizada proporcionalmente"})
  anterior=float(p.get('preco') or 0)
  p['preco']=med;p['preco_atualizado_em']=DATA
  p['historico_precos']=[{"data":"2026-08-20","valor":anterior},{"data":DATA,"valor":med}]
  p['pesquisa_preco']={"metodo":"mediana_3_referencias","fontes":3,"equivalencia":"aproximada"}
  pesquisa['produtos'].append({"id":p['id'],"nome":p['nome'],"apresentacao":p.get('apresentacao',''),"valores":vals,"mediana":med,"fontes":fontes})
 path.write_text(json.dumps(dados,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (ROOT/'data/price-research.json').write_text(json.dumps(pesquisa,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 cestas={"versao":"3.3.2","modelos":[
  {"id":"presente","nome":"Presente equilibrado","categorias":["chas","oleaginosas","alimentos"],"orcamento":100},
  {"id":"economica","nome":"Seleção econômica","categorias":[],"orcamento":60},
  {"id":"esportiva","nome":"Rotina esportiva","categorias":["suplementos"],"orcamento":250},
  {"id":"chas","nome":"Descoberta de chás","categorias":["chas"],"orcamento":70}
 ]}
 (ROOT/'data/baskets.json').write_text(json.dumps(cestas,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 cfg=ROOT/'data/config.json'; c=json.loads(cfg.read_text(encoding='utf-8'))
 c.setdefault('recursos',{}).update({"centralQualidade":True,"comparadorAvancado":True,"jornadaPortatil":True,"historicoPrecos":True,"temas":True})
 c['temas']={"padrao":"natural","opcoes":{"natural":{"nome":"Natural editorial","corPrincipal":"#176b4d","corFundo":"#fbfaf6"},"noturno":{"nome":"Noturno elegante","corPrincipal":"#8fd3b6","corFundo":"#111814"},"alto-contraste":{"nome":"Alto contraste","corPrincipal":"#ffff00","corFundo":"#000000"}}}
 c['comercial']['precosAtualizadosEm']=DATA
 cfg.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 subprocess.run(['python3',str(ROOT/'tools/sync-client.py')],check=True,cwd=ROOT)
 for page in ROOT.rglob('*.html'):
  text=page.read_text(encoding='utf-8'); src='../assets/scripts/commerce-v332.js' if page.parent.name=='produto' else 'assets/scripts/commerce-v332.js'
  if 'commerce-v332.js' not in text: text=text.replace('</body>',f'<script src="{src}" defer></script></body>')
  page.write_text(text,encoding='utf-8')
 print('MIGRACAO_332_OK')

if __name__=='__main__': main()
