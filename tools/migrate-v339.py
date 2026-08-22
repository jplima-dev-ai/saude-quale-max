from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

# A entrega anterior corresponde à v3.3.8. A versão corrente é v3.3.9.
for p in ROOT.rglob("*"):
    if p.is_file() and p.suffix.lower() in {".html",".js",".css",".json",".md",".py",".cjs",".webmanifest",".xml"}:
        p.write_text(p.read_text(encoding="utf-8",errors="ignore").replace("3.3.8","3.3.8").replace("v338","v338").replace("V338","V338"),encoding="utf-8")

for html in ROOT.rglob("*.html"):
    s=html.read_text(encoding="utf-8");prefix="../" if html.parent.name=="products" else ""
    if "max-dialogue.js" not in s and "max-sales-advanced.js" in s:
        needle=f'<script src="{prefix}assets/scripts/max-sales-advanced.js" defer></script>'
        s=s.replace(needle,needle+f'\n<script src="{prefix}assets/scripts/max-dialogue.js" defer></script>')
    html.write_text(s,encoding="utf-8")

chat=ROOT/"assets/scripts/chatbot.js";s=chat.read_text(encoding="utf-8")
if 'const MaxDialogue = window.QualimaxMaxDialogue' not in s:s=s.replace('const MaxSalesAdvanced = window.QualimaxMaxSalesAdvanced || null;', 'const MaxSalesAdvanced = window.QualimaxMaxSalesAdvanced || null;\n    const MaxDialogue = window.QualimaxMaxDialogue || null;')
# Bug: uma menção explícita deve vencer o produto herdado do contexto anterior.
s=s.replace('const habilidades=MaxSales.detectar(termo),base=produtoContextual()||produtosMencionados(termo)[0]||null;', 'const habilidades=MaxSales.detectar(termo),base=produtosMencionados(termo)[0]||produtoContextual()||null;')
marker='    const responderVendasAvancadasV338 = (termo) => {'
handler=r'''    const responderDialogoV339 = (termo) => {
        if(!MaxDialogue)return false;const leitura=MaxDialogue.analisar(termo),carrinho=window.QualimaxV333?.cart?.()||[],produto=produtoContextual();
        const gl=MaxDialogue.glossario(termo);if(gl&&/\b(?:o que significa|o que e|o que é|explique|quer dizer)\b/.test(leitura.texto)){adicionarMensagem(gl.explicacao);return true;}
        if(leitura.querSimples&&produto){adicionarMensagem(MaxDialogue.simplificarProduto(produto));adicionarAcoes([{texto:"Comparar de forma simples",valor:`comparar ${produto.nome} com `},{texto:"Ver preço",valor:`qual o preço de ${produto.nome}?`}]);return true;}
        if(leitura.querContinuar){const r=MaxDialogue.resumo({preferencias:estado.preferencias,resultados:estado.ultimosResultados,produto,carrinho});adicionarMensagem(`${r.texto}${r.produto?` Produto em foco: ${r.produto}.`:""} ${r.resultados} resultado(s) recente(s) e ${r.carrinho} item(ns) no carrinho.`);const passo=MaxSalesAdvanced?.proximoPasso?.({carrinho,resultados:estado.ultimosResultados,produto});if(passo)adicionarMensagem(`Podemos continuar assim: ${passo.texto}.`);return true;}
        if(leitura.querGuiado||/\b(?:qual e melhor para mim|qual é melhor para mim|me recomende uma)\b/.test(leitura.texto)){const q=MaxDialogue.proximaPergunta({preferencias:estado.preferencias,resultados:estado.ultimosResultados});if(q){estado.perguntaPendente=q.id;adicionarMensagem(q.texto);return true;}adicionarMensagem("Já tenho critérios suficientes. Vou reduzir as opções para facilitar sua decisão.");processarEntrada("mostrar três opções: econômica, intermediária e premium",false);return true;}
        if(/\b(?:isso nao ajudou|isso não ajudou|nao era isso|não era isso)\b/.test(leitura.texto)){adicionarMensagem("Entendi. Vou abandonar essa direção sem apagar todo o seu contexto. O que ficou errado: objetivo, orçamento, formato ou produtos mostrados?");adicionarAcoes([{texto:"Objetivo",valor:"esqueça o objetivo anterior"},{texto:"Orçamento",valor:"esqueça o orçamento"},{texto:"Formato",valor:"esqueça o formato"},{texto:"Produtos",valor:"quero refazer a busca"}]);return true;}
        return false;
    };

'''
if 'const responderDialogoV339' not in s:s=s.replace(marker,handler+marker)
s=s.replace('        if (mostrarUsuario) adicionarMensagem(original, "usuario");\n        registrarConsulta(original);', '        if (mostrarUsuario) adicionarMensagem(original, "usuario");\n        MaxDialogue?.registrarTurno(original,"usuario");\n        registrarConsulta(original);')
s=s.replace('        if (responderHorarioLocal(termo)) return;\n        if (responderVendasAvancadasV338(termo)) return;', '        if (responderHorarioLocal(termo)) return;\n        if (responderDialogoV339(termo)) return;\n        if (responderVendasAvancadasV338(termo)) return;')
chat.write_text(s,encoding="utf-8")

# Bug: o produto-base precisa entrar primeiro no kit quando cabe no teto.
sales=ROOT/"assets/scripts/max-sales.js";s=sales.read_text(encoding="utf-8")
s=s.replace('const ordenados=[...(base?[base]:[]),...(base?complementos(base,produtos,20):produtos||[])].filter((p,i,a)=>p&&a.findIndex(x=>String(x.id)===String(p.id))===i&&preco(p)>0).sort((a,b)=>preco(a)-preco(b));\n        const itens=[];let total=0;for(const p of ordenados)', 'const unicos=[...(base?[base]:[]),...(base?complementos(base,produtos,20):produtos||[])].filter((p,i,a)=>p&&a.findIndex(x=>String(x.id)===String(p.id))===i&&preco(p)>0);\n        const ordenados=base?[base,...unicos.filter(p=>String(p.id)!==String(base.id)).sort((a,b)=>preco(a)-preco(b))]:unicos.sort((a,b)=>preco(a)-preco(b));\n        const itens=[];let total=0;for(const p of ordenados)')
sales.write_text(s,encoding="utf-8")

sw=ROOT/"service-worker.js";s=sw.read_text(encoding="utf-8").replace("qualimax-v3.3.8","qualimax-v3.3.9")
if "max-dialogue.js" not in s:s=s.replace('"./assets/scripts/max-sales-advanced.js",','"./assets/scripts/max-sales-advanced.js", "./assets/scripts/max-dialogue.js",')
sw.write_text(s,encoding="utf-8")

for rel in ["README.md","SECURITY.md","data/config.json","data/products.json","data/routes.json","tools/test-fixes-v331.py","tools/test-v334.py","tools/test-v335.py","tools/audit-client.py","tools/test-security-v336.py","tools/test-v337.py","tools/test-sales-v338.py","tools/test-v338.py"]:
    p=ROOT/rel
    if p.exists():p.write_text(p.read_text(encoding="utf-8").replace("3.3.8","3.3.9").replace("qualimax-v3.3.8","qualimax-v3.3.9"),encoding="utf-8")
admin=ROOT/"assets/scripts/admin.js";admin.write_text(admin.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.3.8"','ADMIN_BACKUP_VERSION="3.3.9"'),encoding="utf-8")
ch=ROOT/"docs/CHANGELOG.md";c=ch.read_text(encoding="utf-8")
entry='''## [3.3.9] — 2026-08-21\n\n### MAX Dialogue Intelligence\n\n- gestão do estágio da jornada e retomada contextual;\n- perguntas progressivas sem repetição;\n- explicações simplificadas e glossário comercial;\n- reação construtiva a recomendações que não ajudaram;\n- orientação passo a passo e resumo da conversa;\n- correção da prioridade de produto mencionado;\n- correção da preservação do item-base em kits.\n\n'''
if "## [3.3.9]" not in c:c=c.replace("## [3.3.8]",entry+"## [3.3.8]",1)
ch.write_text(c,encoding="utf-8")
