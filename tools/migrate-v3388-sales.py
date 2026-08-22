from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

for html in ROOT.rglob("*.html"):
    s=html.read_text(encoding="utf-8");prefix="../" if html.parent.name=="products" else ""
    if "max-sales.js" not in s and "max-intelligence.js" in s:
        needle=f'<script src="{prefix}assets/scripts/max-intelligence.js" defer></script>'
        s=s.replace(needle,needle+f'\n<script src="{prefix}assets/scripts/max-sales.js" defer></script>')
    html.write_text(s,encoding="utf-8")

chat=ROOT/"assets/scripts/chatbot.js";s=chat.read_text(encoding="utf-8")
if 'const MaxSales = window.QualimaxMaxSales' not in s:
    s=s.replace('const MaxIntelligence = window.QualimaxMaxIntelligence || null;', 'const MaxIntelligence = window.QualimaxMaxIntelligence || null;\n    const MaxSales = window.QualimaxMaxSales || null;')
marker='    const responderInteligenciaV337 = (termo) => {'
handler=r'''    const responderVendasV338 = (termo) => {
        if(!MaxSales||!estado.produtos.length)return false;
        const habilidades=MaxSales.detectar(termo),base=produtoContextual()||produtosMencionados(termo)[0]||null;
        if(!habilidades.length)return false;

        if(habilidades.includes("fechamento")){
            if(!base){adicionarMensagem("Posso ajudar a fechar a escolha. Você quer partir de um produto, de um orçamento ou de um objetivo?");adicionarAcoes([{texto:"Escolher por objetivo",valor:"quero uma recomendação"},{texto:"Escolher por orçamento",valor:"tenho até R$ "},{texto:"Abrir carrinho",acao:()=>{fecharChat();location.href="cart.html"}}]);return true;}
            adicionarMensagem(`Ótima escolha para avaliar: ${base.nome}, por ${precoTexto(base)}. ${MaxSales.argumentoValor(base)}. Você mantém o controle: posso adicionar ao carrinho demonstrativo ou preparar o atendimento.`);
            adicionarAcoes([{texto:`Adicionar ${base.nome} ao carrinho`,acao:()=>{const ok=window.QualimaxV333?.add?.(base);adicionarMensagem(ok?`${base.nome} foi adicionado. Quer complementar a seleção ou revisar o carrinho?`:"Não consegui adicionar agora. Posso abrir o catálogo para você.");}},{texto:"Revisar carrinho",acao:()=>{fecharChat();location.href="cart.html"}},{texto:"Preparar atendimento",acao:()=>adicionarWhatsAppNoChat("Preparar pedido",base.nome)}]);
            return true;
        }
        if(habilidades.includes("objecao-preco")&&base){
            const opcoes=MaxSales.alternativasEconomicas(base,estado.produtos);
            adicionarMensagem(opcoes.length?`Entendi: o preço de ${base.nome} pesa na decisão. Separei alternativas próximas e mais econômicas, sem fingir equivalência perfeita.`:`Não encontrei alternativa realmente semelhante e mais barata. Posso montar uma seleção dentro de um teto ou explicar o valor desta opção.`);
            if(opcoes.length)registrarResultados(opcoes,`Alternativas mais econômicas a ${base.nome}`);
            adicionarAcoes([{texto:"Explicar custo-benefício",valor:`${base.nome} vale a pena?`},{texto:"Definir orçamento",valor:"tenho até R$ "}]);return true;
        }
        if(habilidades.includes("valor")&&base){
            const urgencia=MaxSales.urgenciaVerdadeira(base);
            adicionarMensagem(`${base.nome}: ${MaxSales.argumentoValor(base)}. O valor depende principalmente de quanto o formato e os destaques combinam com o que você realmente procura.${urgencia?` ${urgencia}`:""}`);
            adicionarAcoes([{texto:"Comparar com outra opção",valor:`comparar ${base.nome} com `},{texto:"Quero comprar",valor:`quero comprar ${base.nome}`},{texto:"Ver opção mais barata",valor:`uma opção mais barata parecida com ${base.nome}`}]);return true;
        }
        if(habilidades.includes("complemento")&&base){
            const itens=MaxSales.complementos(base,estado.produtos);
            adicionarMensagem(itens.length?`Para acompanhar ${base.nome}, encontrei opções de categorias complementares. A sugestão é por coerência de uso e variedade, não para aumentar o carrinho sem necessidade.`:"Não encontrei um complemento forte o suficiente para recomendar.");
            if(itens.length)registrarResultados(itens,`Produtos que combinam com ${base.nome}`);return true;
        }
        if(habilidades.includes("faixas")){
            const candidatos=estado.ultimosResultados.length?estado.ultimosResultados:estado.produtos;
            const faixas=MaxSales.tresFaixas(candidatos);if(!faixas.length)return false;
            adicionarMensagem(faixas.map(x=>`${x.nivel}: ${x.produto.nome}, ${precoTexto(x.produto)}.`).join(" "));
            adicionarAcoes(faixas.map(x=>({texto:`Escolher ${x.nivel}`,acao:()=>explicarProduto(x.produto)})));return true;
        }
        if(habilidades.includes("kit")||habilidades.includes("rotina")||habilidades.includes("presente")){
            const orcamento=extrairOrcamento(termo)||estado.preferencias.orcamento;
            if(!orcamento){adicionarMensagem("Eu monto uma seleção sem ultrapassar o valor definido. Qual é o orçamento máximo?");adicionarAcoes([{texto:"Até R$ 60",valor:"monte um kit até R$ 60"},{texto:"Até R$ 100",valor:"monte um kit até R$ 100"},{texto:"Até R$ 200",valor:"monte um kit até R$ 200"}]);return true;}
            const kit=MaxSales.montarKit(estado.produtos,orcamento,{base,maxItens:4});
            if(!kit.itens.length){adicionarMensagem(`Não encontrei uma composição dentro de ${moeda(orcamento)}. Podemos aumentar o teto ou escolher apenas um produto.`);return true;}
            adicionarMensagem(`Montei uma seleção de ${kit.itens.length} item(ns) por aproximadamente ${moeda(kit.total)}, dentro do teto de ${moeda(orcamento)}. Restam ${moeda(kit.falta)} no orçamento.`);
            registrarResultados(kit.itens,"Seleção comercial personalizada");
            adicionarAcoes([{texto:"Adicionar seleção ao carrinho",acao:()=>{let adicionados=0;kit.itens.forEach(p=>{if(window.QualimaxV333?.add?.(p))adicionados++});adicionarMensagem(`${adicionados} item(ns) foram adicionados. Você pode revisar tudo antes de continuar.`);}},{texto:"Montar outra seleção",valor:`outra seleção até ${orcamento}`},{texto:"Preparar atendimento",acao:()=>adicionarWhatsAppNoChat("Preparar seleção",kit.itens.map(p=>p.nome).join(", "))}]);return true;
        }
        if(habilidades.includes("objecao-duvida")){
            adicionarMensagem("Sem problema. Para decidir com clareza, podemos comparar preço, formato e aderência à sua necessidade. Não vou criar urgência falsa nem pressionar você.");
            adicionarAcoes([{texto:"Comparar opções",valor:base?`comparar ${base.nome} com `:"comparar minhas opções"},{texto:"Ver três faixas",valor:"mostrar três opções: econômica, intermediária e premium"},{texto:"Salvar e decidir depois",acao:()=>adicionarMensagem("Você pode manter a conversa e suas escolhas neste navegador e voltar quando quiser.")}]);return true;
        }
        return false;
    };

'''
if 'const responderVendasV338' not in s:s=s.replace(marker,handler+marker)
s=s.replace('        if (responderHorarioLocal(termo)) return;\n        if (responderInteligenciaV337(termo)) return;', '        if (responderHorarioLocal(termo)) return;\n        if (responderVendasV338(termo)) return;\n        if (responderInteligenciaV337(termo)) return;')
chat.write_text(s,encoding="utf-8")

sw=ROOT/"service-worker.js";s=sw.read_text(encoding="utf-8").replace("qualimax-v3.3.7","qualimax-v3.3.8")
if "max-sales.js" not in s:s=s.replace('"./assets/scripts/max-intelligence.js",','"./assets/scripts/max-intelligence.js", "./assets/scripts/max-sales.js",')
sw.write_text(s,encoding="utf-8")

for rel in ["README.md","SECURITY.md","data/config.json","data/products.json","data/routes.json","tools/test-fixes-v331.py","tools/test-v334.py","tools/test-v335.py","tools/audit-client.py","tools/test-security-v336.py","tools/test-v337.py"]:
    p=ROOT/rel
    if p.exists():p.write_text(p.read_text(encoding="utf-8").replace("3.3.7","3.3.8").replace("qualimax-v3.3.7","qualimax-v3.3.8"),encoding="utf-8")
admin=ROOT/"assets/scripts/admin.js";admin.write_text(admin.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.3.7"','ADMIN_BACKUP_VERSION="3.3.8"'),encoding="utf-8")

ch=ROOT/"docs/CHANGELOG.md";c=ch.read_text(encoding="utf-8")
entry='''## [3.3.8] — 2026-08-21\n\n### MAX Sales Skills\n\n- montador de kits e rotinas dentro do orçamento;\n- consultor de custo-benefício e alternativas econômicas;\n- tratamento respeitoso de objeções e indecisão;\n- combinação inteligente e venda complementar coerente;\n- escolha em níveis Essencial, Equilibrada e Completa;\n- condução explícita para carrinho ou atendimento;\n- curadoria de presentes e seleções personalizadas;\n- urgência somente quando houver estoque real informado;\n- bloqueio conceitual de pressão, escassez falsa e recomendação sem fundamento.\n\n'''
if "## [3.3.8]" not in c:c=c.replace("## [3.3.7]",entry+"## [3.3.7]")
ch.write_text(c,encoding="utf-8")
