#!/usr/bin/env python3
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
for p in ROOT.glob("*.html"):
 text=p.read_text(encoding="utf-8")
 if "assets/styles/animations.css" not in text:text=text.replace("</head>",'<link rel="stylesheet" href="assets/styles/animations.css"></head>')
 if "assets/scripts/animations.js" not in text:text=text.replace("</body>",'<script src="assets/scripts/animations.js" defer></script></body>')
 p.write_text(text,encoding="utf-8")
for p in (ROOT/"products").glob("*.html"):
 text=p.read_text(encoding="utf-8")
 if "../assets/styles/animations.css" not in text:text=text.replace("</head>",'<link rel="stylesheet" href="../assets/styles/animations.css"></head>')
 if "../assets/scripts/animations.js" not in text:text=text.replace("</body>",'<script src="../assets/scripts/animations.js" defer></script></body>')
 p.write_text(text,encoding="utf-8")
cfgp=ROOT/"data/config.json";cfg=json.loads(cfgp.read_text(encoding="utf-8"));cfg["versao"]="3.3.4";cfg["animacoes"]={"ativo":True,"nivel":"suave","estilo":"folhas","revelacao":True,"hero":True,"cards":True,"conversao":True,"cabecalho":True};cfgp.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
manifest=ROOT/"manifest.webmanifest";manifest.write_text(manifest.read_text(encoding="utf-8").replace("v3.3.3","v3.3.4"),encoding="utf-8")
admin=ROOT/"assets/scripts/admin.js";admin.write_text(admin.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.3.3"','ADMIN_BACKUP_VERSION="3.3.4"'),encoding="utf-8")
v333=ROOT/"assets/scripts/commerce-v333.js";v333.write_text(v333.read_text(encoding="utf-8").replace("substitution();animate();emit","substitution();emit").replace("Qualimax v3.3.3:","Qualimax v3.3.4:"),encoding="utf-8")
for name in ("testar_correcao_331.py","auditar_cliente.py"):
 p=ROOT/"tools"/name;t=p.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.3.3"','ADMIN_BACKUP_VERSION="3.3.4"').replace('const CACHE = "qualimax-v3.3.3";','const CACHE = "qualimax-v3.3.4";');p.write_text(t,encoding="utf-8")
sw=ROOT/"service-worker.js";text=sw.read_text(encoding="utf-8").replace("qualimax-v3.3.3","qualimax-v3.3.4")
if '"./assets/styles/animations.css"' not in text:text=text.replace('"./assets/styles/commerce.css",','"./assets/styles/commerce.css", "./assets/styles/animations.css", "./assets/scripts/animations.js",')
sw.write_text(text,encoding="utf-8")
readme=ROOT/"README.md";text=readme.read_text(encoding="utf-8").replace("**Versão atual: 3.3.3**","**Versão atual: 3.3.4**")
if "sistema white-label de animações" not in text:text=text.replace("## Estado atual","## Estado atual\n\n- sistema white-label de animações estratégicas, configurável e acessível;")
readme.write_text(text,encoding="utf-8")
docs=ROOT/"docs";index=docs/"README.md";text=index.read_text(encoding="utf-8").replace("versão **3.3.3**","versão **3.3.4**")
if "ANIMATIONS.md" not in text:text=text.replace("| [Acessibilidade]","| [Animações](ANIMATIONS.md) | Movimento white-label e acessível |\n| [Acessibilidade]")
index.write_text(text,encoding="utf-8")
(docs/"ANIMATIONS.md").write_text("""# Animações estratégicas

## Objetivo

O sistema orienta atenção, reforça confiança e confirma ações sem bloquear conteúdo ou navegação.

## Configuração

A seção animacoes de data/config.json controla ativação, intensidade, estilo, revelação, hero, cards, conversão e cabeçalho. Use suave como padrão white-label.

## Camadas

- atmosfera orgânica no hero;
- revelação progressiva de conteúdo;
- microinterações em cards e controles;
- confirmação visual de conversão;
- estados do MAX e carrinho;
- cabeçalho responsivo ao scroll.

## Acessibilidade

prefers-reduced-motion tem prioridade. Com redução ativa, o conteúdo fica imediatamente visível e movimentos decorativos são removidos. Nenhuma informação depende de animação.

## Admin Studio

A aba Animações testa a intensidade localmente e exporta um fragmento de configuração reutilizável.

## Critérios

Evite autoplay agressivo, paralaxe intensa, flashes, loops rápidos e atrasos de navegação. Teste teclado, NVDA, zoom, mobile e redução de movimento.
""",encoding="utf-8")
change=docs/"CHANGELOG.md";text=change.read_text(encoding="utf-8")
if "## [3.3.4]" not in text:text=text.replace("## [3.3.3]","""## [3.3.4] — 2026-08-21

### Adicionado

- sistema profissional de animações white-label;
- intensidades desligada, suave e expressiva;
- atmosfera botânica, revelações e feedback de conversão;
- painel de prévia e exportação;
- suporte integral à redução de movimento.

## [3.3.3]""")
change.write_text(text,encoding="utf-8")
acc=docs/"ACCESSIBILITY.md";text=acc.read_text(encoding="utf-8")
if "assets/styles/animations.css" not in text:text+="\n## Movimento\n\nO sistema em assets/styles/animations.css e assets/scripts/animations.js deve funcionar com intensidade desligada e prefers-reduced-motion ativo.\n"
acc.write_text(text,encoding="utf-8")
print("Migração v3.3.4 aplicada.")
