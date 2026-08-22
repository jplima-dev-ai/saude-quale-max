#!/usr/bin/env python3
import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def ok(c,m):
 if not c: raise AssertionError(m)
p=json.loads((R/'data/products.json').read_text(encoding='utf-8'))['produtos']
r=json.loads((R/'data/price-research.json').read_text(encoding='utf-8'))
c=json.loads((R/'data/baskets.json').read_text(encoding='utf-8'))
ok(len(p)==60 and len(r['produtos'])==47,'O catálogo deve ter 60 produtos e preservar a pesquisa histórica dos 47 itens originais')
ok(all(len(x['fontes'])==3 and x['mediana']>0 for x in r['produtos']),'Cada item precisa de três fontes e mediana')
ok(all(x.get('preco_atualizado_em') for x in p),'Data de preço ausente')
ok(all(x.get('preco_fixo') is True and not x.get('preco_aproximado') for x in p if x['id']>=48),'Novos produtos devem usar preço fixo administrável')
ok(len(c['modelos'])>=4,'Modelos de cesta ausentes')
js=(R/'assets/scripts/commerce-v332.js').read_text(encoding='utf-8')
for termo in ('Central de qualidade','Jornada portátil','Comparação acessível','manifesto-publicacao'):
 ok(termo in js,f'Recurso ausente: {termo}')
for page in ('index.html','catalog.html','account.html','admin.html'):
 ok('commerce-v332.js' in (R/page).read_text(encoding='utf-8'),f'v332.js ausente em {page}')
print('V332_REGRESSION_TESTS_OK')
