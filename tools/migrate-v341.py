from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
for p in list(ROOT.glob("*.html"))+list((ROOT/"products").glob("*.html")):
 s=p.read_text(encoding="utf-8");prefix="../" if p.parent.name=="products" else ""
 if "experience-v341.css" not in s:s=s.replace("</head>",f'<link rel="stylesheet" href="{prefix}assets/styles/experience-v341.css"></head>')
 if "experience-v341.js" not in s:s=s.replace("</body>",f'<script src="{prefix}assets/scripts/experience-v341.js" defer></script></body>')
 p.write_text(s,encoding="utf-8")

# Corrige a semântica da primeira coluna do comparador: cabeçalho de linha, não célula comum.
p=ROOT/"assets/scripts/platform-v340.js";s=p.read_text(encoding="utf-8")
s=s.replace('[n,...ps.map(f)].forEach(x=>{const td=document.createElement("td");td.textContent=x;tr.append(td)})','[n,...ps.map(f)].forEach((x,i)=>{const cell=document.createElement(i===0?"th":"td");if(i===0)cell.scope="row";cell.textContent=x;tr.append(cell)})')
p.write_text(s,encoding="utf-8")

for rel in ["README.md","SECURITY.md","data/config.json","data/products.json","data/routes.json","tools/test-fixes-v331.py","tools/test-v334.py","tools/test-v335.py","tools/audit-client.py","tools/test-security-v336.py","tools/test-v337.py","tools/test-sales-v3388.py","tools/test-v3388.py","tools/test-v339.py","tools/test-v340.py"]:
 p=ROOT/rel
 if p.exists():p.write_text(p.read_text(encoding="utf-8").replace("3.4.0","3.4.1").replace("qualimax-v3.4.0","qualimax-v3.4.1"),encoding="utf-8")
admin=ROOT/"assets/scripts/admin.js";admin.write_text(admin.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.4.0"','ADMIN_BACKUP_VERSION="3.4.1"'),encoding="utf-8")
sw=ROOT/"service-worker.js";s=sw.read_text(encoding="utf-8").replace("qualimax-v3.4.0","qualimax-v3.4.1")
if "experience-v341.js" not in s:s=s.replace('"./assets/scripts/platform-v340.js"','"./assets/scripts/platform-v340.js", "./assets/scripts/experience-v341.js", "./assets/styles/experience-v341.css"')
sw.write_text(s,encoding="utf-8")
ch=ROOT/"docs/CHANGELOG.md";c=ch.read_text(encoding="utf-8")
entry='''## [3.4.1] — 2026-08-21\n\n### Evolução transversal\n\n- início personalizado com atalhos de jornada;\n- catálogo conectado às ferramentas de decisão;\n- painel de decisão em todas as páginas de produto;\n- índice de prontidão e análise do carrinho pelo MAX;\n- resumo local da jornada em Minha Conta;\n- rascunho privado no pré-atendimento;\n- planejamento de visita e cópia de endereço;\n- compromissos verificáveis na página Sobre;\n- recuperação inteligente em páginas de erro e offline;\n- correção semântica da tabela de comparação.\n\n'''
if "## [3.4.1]" not in c:c=c.replace("## [3.4.0]",entry+"## [3.4.0]",1)
ch.write_text(c,encoding="utf-8")
