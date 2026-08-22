from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

# Corrige integralmente a numeração digitada anteriormente.
for p in ROOT.rglob("*"):
    if p.is_file() and p.suffix.lower() in {".html",".js",".css",".json",".md",".py",".cjs",".webmanifest",".xml"}:
        s=p.read_text(encoding="utf-8",errors="ignore").replace("3.3.8","3.3.8").replace("qualimax-v3.3.8","qualimax-v3.3.8")
        p.write_text(s,encoding="utf-8")

for html in ROOT.rglob("*.html"):
    s=html.read_text(encoding="utf-8");prefix="../" if html.parent.name=="products" else ""
    if "max-sales-advanced.js" not in s and "max-sales.js" in s:
        needle=f'<script src="{prefix}assets/scripts/max-sales.js" defer></script>'
        s=s.replace(needle,needle+f'\n<script src="{prefix}assets/scripts/max-sales-advanced.js" defer></script>')
    html.write_text(s,encoding="utf-8")

chat=ROOT/"assets/scripts/chatbot.js";s=chat.read_text(encoding="utf-8")
if 'const MaxSalesAdvanced = window.QualimaxMaxSalesAdvanced' not in s:
    s=s.replace('const MaxSales = window.QualimaxMaxSales || null;', 'const MaxSales = window.QualimaxMaxSales || null;\n    const MaxSalesAdvanced = window.QualimaxMaxSalesAdvanced || null;')
marker='    const responderVendasV338 = (termo) => {'
handler=r'''    const responderVendasAvancadasV338 = (termo) => {
        if(!MaxSalesAdvanced||!estado.produtos.length)return false;
        const habilidades=MaxSalesAdvanced.detectar(termo);if(!habilidades.length)return false;
        const carrinho=window.QualimaxV333?.cart?.()||[];

        if(habilidades.includes("auditar-carrinho")){
            const a=MaxSalesAdvanced.analisarCarrinho(carrinho,estado.produtos);
            if(!a.itens.length){adicionarMensagem("Seu carrinho está vazio. Posso começar por objetivo, orçamento ou montar uma seleção pronta.");adicionarAcoes([{texto:"Montar seleção",valor:"monte um kit até R$ 100"},{texto:"Escolher por objetivo",valor:"quero uma recomendação"}]);return true;}
            adicionarMensagem(`Seu carrinho tem ${a.quantidade} unidade(s), ${a.categorias.length} categoria(s) e total aproximado de ${moeda(a.total)}. Índice de variedade: ${a.diversidade} de 100.${a.alertas.length?` Ponto para revisar: ${a.alertas.join("; ")}.`:" A composição está coerente para revisão final."}`);
            adicionarAcoes([{texto:"Procurar economia",valor:"otimize meu carrinho"},{texto:"Ver o que falta",valor:"falta alguma coisa no carrinho?"},{texto:"Revisar carrinho",acao:()=>{fecharChat();location.href="cart.html"}}]);return true;
        }
        if(habilidades.includes("otimizar-carrinho")){
            if(!carrinho.length){adicionarMensagem("Não há itens para otimizar ainda. Posso montar uma seleção diretamente dentro do seu orçamento.");return true;}
            const plano=MaxSalesAdvanced.planoEconomia(carrinho,estado.produtos);
            if(!plano.trocas.length){adicionarMensagem("Não encontrei substituições claramente semelhantes e mais baratas. Prefiro não sugerir uma troca fraca apenas para reduzir o valor.");return true;}
            adicionarMensagem(`Encontrei ${plano.trocas.length} troca(s) possíveis, com economia potencial de até ${moeda(plano.economiaPotencial)}: ${plano.trocas.slice(0,3).map(x=>`${x.item.nome} por ${x.alternativa.nome}, economizando ${moeda(x.economia)}`).join("; ")}. Nada será alterado sem sua confirmação.`);
            registrarResultados(plano.trocas.map(x=>x.alternativa),"Alternativas para economizar no carrinho");return true;
        }
        if(habilidades.includes("lacunas")){
            if(!carrinho.length){adicionarMensagem("O carrinho ainda está vazio. Primeiro posso montar uma base e depois verificar complementos.");return true;}
            const r=MaxSalesAdvanced.lacunas(carrinho,estado.produtos);
            adicionarMensagem(r.sugestoes.length?`A seleção já pode ser finalizada como está. Se você quiser mais variedade, encontrei complementos em ${r.categoriasAusentes.join(", ")||"categorias relacionadas"}.`:`Não identifiquei uma lacuna relevante. Seu carrinho pode seguir para revisão sem adicionar itens desnecessários.`);
            if(r.sugestoes.length)registrarResultados(r.sugestoes,"Complementos opcionais para o carrinho");return true;
        }
        if(habilidades.includes("recompra")){
            const pedidos=window.QualimaxSecurity?.readStorage?.("qualimax-pedidos-v333",[])||[],ultimo=MaxSalesAdvanced.pedidoRecente(pedidos);
            if(!ultimo){adicionarMensagem("Não encontrei pedido preparado anteriormente neste navegador. Posso montar uma nova seleção.");return true;}
            adicionarMensagem(`Encontrei um pedido preparado em ${new Date(ultimo.em).toLocaleDateString("pt-BR")}, com ${ultimo.itens.length} item(ns) e total aproximado de ${moeda(ultimo.total)}. Quer recuperar essa seleção?`);
            adicionarAcoes([{texto:"Recuperar pedido",acao:()=>{let n=0;ultimo.itens.forEach(i=>{const p=estado.produtos.find(x=>String(x.id)===String(i.id));if(p&&window.QualimaxV333?.add?.(p,null,Math.min(99,Number(i.qtd)||1)))n++});adicionarMensagem(`${n} produto(s) foram recuperados. Revise disponibilidade, preço e quantidade antes de continuar.`);}},{texto:"Ver carrinho",acao:()=>{fecharChat();location.href="cart.html"}},{texto:"Montar uma seleção nova",valor:"monte uma nova seleção até R$ 100"}]);return true;
        }
        if(habilidades.includes("frete")){
            const cfg=window.QualimaxConfig,calc=window.QualimaxPromocoes?.calcular?.(cfg,carrinho.map(i=>({...i,quantidade:i.qtd,quantidade_base:1})));
            if(!calc){adicionarMensagem("A regra de frete não está disponível para cálculo neste momento. A equipe confirma antes do pedido.");return true;}
            adicionarMensagem(calc.freteGratis?"Pelas regras publicadas, esta seleção já atingiu a condição de frete grátis. A equipe confirma a disponibilidade final.":calc.faltaFrete>0?`Faltam aproximadamente ${moeda(calc.faltaFrete)} para atingir a condição configurada de frete grátis. Só vale adicionar algo se for realmente útil para você.`:"Não há uma meta ativa de frete grátis informada.");return true;
        }
        if(habilidades.includes("custo-real")){
            const candidatos=produtosMencionados(termo);const lista=MaxSalesAdvanced.compararCusto(candidatos.length?candidatos:estado.ultimosResultados.slice(0,5));
            if(!lista.length){adicionarMensagem("As apresentações disponíveis não informam uma quantidade comparável. Posso comparar preço total, formato e benefícios cadastrados.");return true;}
            adicionarMensagem(lista.map((x,i)=>`${i+1}. ${x.produto.nome}: cerca de ${moeda(x.custo)} por unidade informada.`).join(" "));return true;
        }
        if(habilidades.includes("confianca")){
            const p=estado.preferencias,c=MaxSalesAdvanced.confiancaEscolha({criterios:(p.termos||[]).length+(p.categoria?1:0)+(p.tipo?1:0),candidatos:estado.ultimosResultados.length,temOrcamento:Number.isFinite(p.orcamento),temRestricao:p.vegana!==null||p.semGluten!==null||(p.excluirTipos||[]).length>0,temAfinidade:estado.produtosGostei.length>0});
            adicionarMensagem(`Minha confiança nesta direção é ${c.valor} de 100, nível ${c.nivel}. Isso mede a quantidade de critérios disponíveis, não a qualidade médica do produto. Para aumentar a precisão, falta definir ${c.faltante}.`);return true;
        }
        if(habilidades.includes("proximo-passo")){
            const p=MaxSalesAdvanced.proximoPasso({carrinho,resultados:estado.ultimosResultados,produto:produtoContextual()});adicionarMensagem(`O próximo passo mais útil é: ${p.texto}.`);
            const acoes={revisar:{texto:"Revisar carrinho",acao:()=>{fecharChat();location.href="cart.html"}},decidir:{texto:"Comparar agora",valor:`comparar ${produtoContextual()?.nome||"esta opção"} com `},reduzir:{texto:"Ver três níveis",valor:"mostrar três opções: econômica, intermediária e premium"},descobrir:{texto:"Começar diagnóstico",valor:"quero uma recomendação"}};adicionarAcoes([acoes[p.id]]);return true;
        }
        return false;
    };

'''
if 'const responderVendasAvancadasV338' not in s:s=s.replace(marker,handler+marker)
s=s.replace('        if (responderHorarioLocal(termo)) return;\n        if (responderVendasV338(termo)) return;', '        if (responderHorarioLocal(termo)) return;\n        if (responderVendasAvancadasV338(termo)) return;\n        if (responderVendasV338(termo)) return;')
chat.write_text(s,encoding="utf-8")

sw=ROOT/"service-worker.js";s=sw.read_text(encoding="utf-8")
if "max-sales-advanced.js" not in s:s=s.replace('"./assets/scripts/max-sales.js",','"./assets/scripts/max-sales.js", "./assets/scripts/max-sales-advanced.js",')
sw.write_text(s,encoding="utf-8")

ch=ROOT/"docs/CHANGELOG.md";c=ch.read_text(encoding="utf-8")
entry='''## [3.3.8] — 2026-08-21\n\n### MAX Sales Intelligence II\n\n- numeração corrigida integralmente de 3.3.8 para 3.3.8;\n- diagnóstico de carrinho, total, variedade e pontos de revisão;\n- plano de economia com substituições semelhantes;\n- análise de lacunas sem induzir itens desnecessários;\n- recuperação de pedido preparado anteriormente;\n- cálculo responsável da meta de frete grátis;\n- comparação de custo por unidade;\n- indicador explicável de confiança da recomendação;\n- próximo melhor passo conforme o estágio da jornada.\n\n'''
# A entrada equivocada já foi renomeada pela substituição global; consolida em uma única seção.
primeiro=c.find("## [3.3.8]")
if primeiro>=0:
    segundo=c.find("## [3.3.8]",primeiro+1)
    if segundo>=0:
        fim=c.find("## [",segundo+4)
        c=c[:segundo]+(c[fim:] if fim>=0 else "")
if not c.startswith("# Changelog\n\n"): pass
if "### MAX Sales Intelligence II" not in c:c=c.replace("## [3.3.8]",entry+"## [3.3.8]",1)
ch.write_text(c,encoding="utf-8")
