(() => {
    "use strict";
    const normalizar=window.QualimaxMaxCore?.normalizar||(v=>String(v||"").toLowerCase().trim());
    const dinheiro=v=>Number.isFinite(Number(v))?Number(v):0;
    const habilidades=Object.freeze([
        {id:"auditar-carrinho",regex:/\b(?:analise|avaliar|revise|diagnostico|diagnóstico).*(?:carrinho|selecao|seleção)\b/},
        {id:"otimizar-carrinho",regex:/\b(?:otimize|economizar|reduzir|baratear|mais barato).*(?:carrinho|pedido|selecao|seleção)\b/},
        {id:"recompra",regex:/\b(?:comprar novamente|repetir pedido|ultima compra|última compra|recompra|pedir de novo)\b/},
        {id:"proximo-passo",regex:/\b(?:proximo passo|próximo passo|o que faco agora|o que faço agora|como continuo|me ajude a decidir)\b/},
        {id:"frete",regex:/\b(?:frete gratis|frete grátis|quanto falta.*frete)\b/},
        {id:"custo-real",regex:/\b(?:custo por unidade|preco por unidade|preço por unidade|rende mais|comparar rendimento)\b/},
        {id:"confianca",regex:/\b(?:nivel de confianca|nível de confiança|certeza da recomendacao|certeza da recomendação|pontuacao da escolha|pontuação da escolha)\b/},
        {id:"lacunas",regex:/\b(?:o que falta|falta alguma coisa|selecao completa|seleção completa|carrinho completo)\b/}
    ]);
    const detectar=t=>{const n=normalizar(t);return habilidades.filter(h=>h.regex.test(n)).map(h=>h.id)};
    const analisarCarrinho=(itens=[],produtos=[])=>{
        const validos=(Array.isArray(itens)?itens:[]).filter(x=>dinheiro(x.qtd)>0&&dinheiro(x.preco)>=0);
        const total=validos.reduce((s,x)=>s+dinheiro(x.preco)*dinheiro(x.qtd),0);
        const mapa=new Map((produtos||[]).map(p=>[String(p.id),p]));
        const categorias=[...new Set(validos.map(x=>mapa.get(String(x.id))?.categoria).filter(Boolean))];
        const quantidade=validos.reduce((s,x)=>s+dinheiro(x.qtd),0);
        const diversidade=Math.min(100,Math.round((categorias.length/Math.max(1,Math.min(4,validos.length)))*100));
        const alertas=[];if(validos.length===0)alertas.push("carrinho vazio");if(validos.length>1&&categorias.length===1)alertas.push("seleção concentrada em uma única categoria");if(quantidade>12)alertas.push("quantidade total elevada: vale revisar");
        return {itens:validos,total:Number(total.toFixed(2)),quantidade,categorias,diversidade,alertas};
    };
    const alternativasDoItem=(item,produtos=[])=>{
        const base=(produtos||[]).find(p=>String(p.id)===String(item?.id));if(!base)return[];
        return (window.QualimaxMaxSales?.alternativasEconomicas?.(base,produtos)||[]).slice(0,3);
    };
    const planoEconomia=(itens=[],produtos=[])=>{
        const trocas=[];for(const item of itens){const alternativa=alternativasDoItem(item,produtos)[0];if(alternativa){const economia=(dinheiro(item.preco)-dinheiro(alternativa.preco))*dinheiro(item.qtd);if(economia>0)trocas.push({item,alternativa,economia:Number(economia.toFixed(2))});}}
        trocas.sort((a,b)=>b.economia-a.economia);return {trocas,economiaPotencial:Number(trocas.reduce((s,x)=>s+x.economia,0).toFixed(2))};
    };
    const lacunas=(itens=[],produtos=[])=>{
        const analise=analisarCarrinho(itens,produtos);if(!itens.length)return {categoriasAusentes:[],sugestoes:[]};
        const mapa=new Map((produtos||[]).map(p=>[String(p.id),p])),bases=itens.map(x=>mapa.get(String(x.id))).filter(Boolean),sugestoes=[];
        for(const base of bases)for(const p of (window.QualimaxMaxSales?.complementos?.(base,produtos,3)||[]))if(!itens.some(x=>String(x.id)===String(p.id))&&!sugestoes.some(x=>String(x.id)===String(p.id)))sugestoes.push(p);
        return {categoriasAusentes:[...new Set(sugestoes.map(p=>p.categoria).filter(c=>!analise.categorias.includes(c)))],sugestoes:sugestoes.slice(0,4)};
    };
    const custoUnitario=p=>window.QualimaxMaxSales?.valorUnitario?.(p)??null;
    const compararCusto=produtos=>(produtos||[]).map(p=>({produto:p,custo:custoUnitario(p)})).filter(x=>Number.isFinite(x.custo)).sort((a,b)=>a.custo-b.custo);
    const confiancaEscolha=({criterios=0,candidatos=0,temOrcamento=false,temRestricao=false,temAfinidade=false}={})=>{
        let valor=35+Math.min(25,criterios*8)+(temOrcamento?12:0)+(temRestricao?12:0)+(temAfinidade?10:0)-(candidatos>6?12:0);
        valor=Math.max(10,Math.min(95,valor));return {valor,nivel:valor>=80?"alta":valor>=55?"média":"baixa",faltante:!temOrcamento?"orçamento":!temRestricao?"restrições ou preferências":"comparação final"};
    };
    const proximoPasso=({carrinho=[],resultados=[],produto=null}={})=>carrinho.length?{id:"revisar",texto:"Revisar o carrinho e confirmar quantidades"}:produto?{id:"decidir",texto:"Comparar esta opção com uma alternativa"}:resultados.length?{id:"reduzir",texto:"Reduzir as opções para três níveis de investimento"}:{id:"descobrir",texto:"Informar objetivo, orçamento e algo que queira evitar"};
    const pedidoRecente=pedidos=>(Array.isArray(pedidos)?pedidos:[]).filter(p=>Array.isArray(p?.itens)&&p.itens.length).sort((a,b)=>new Date(b.em||0)-new Date(a.em||0))[0]||null;
    window.QualimaxMaxSalesAdvanced=Object.freeze({habilidades,detectar,analisarCarrinho,alternativasDoItem,planoEconomia,lacunas,custoUnitario,compararCusto,confiancaEscolha,proximoPasso,pedidoRecente});
})();
