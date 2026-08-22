(() => {
    "use strict";
    const normalizar=window.QualimaxMaxCore?.normalizar||(v=>String(v||"").toLowerCase().trim());
    const corpus=p=>normalizar([p?.nome,p?.categoria,p?.tipo,p?.descricao,p?.copy,...(p?.tags||[]),...(p?.beneficios||[])].join(" "));
    const habilidades=Object.freeze([
        {id:"kit",nome:"Montador de kits",regex:/\b(?:kit|combo|cesta|monte.*selecao|monte.*seleção)\b/},
        {id:"objecao-preco",nome:"Consultor de orçamento",regex:/\b(?:caro|cara|muito dinheiro|nao cabe|não cabe|mais barato|economizar)\b/},
        {id:"objecao-duvida",nome:"Redutor de indecisão",regex:/\b(?:nao sei se vale|não sei se vale|estou em duvida|estou em dúvida|vou pensar|nao tenho certeza|não tenho certeza)\b/},
        {id:"complemento",nome:"Combinação inteligente",regex:/\b(?:combina com|complementa|complete|junto com|acompanha|adicionar mais)\b/},
        {id:"faixas",nome:"Escolha em três níveis",regex:/\b(?:bom melhor excelente|tres opcoes|três opções|economica intermediaria premium|econômica intermediária premium|melhor opcao|melhor opção)\b/},
        {id:"valor",nome:"Demonstrador de valor",regex:/\b(?:vale a pena|custo beneficio|custo-beneficio|custo-benefício|vantagem|beneficio pelo preco|benefício pelo preço)\b/},
        {id:"fechamento",nome:"Condutor de compra",regex:/\b(?:quero comprar|vou levar|fechar pedido|finalizar|adicionar ao carrinho|como compro)\b/},
        {id:"rotina",nome:"Planejador de rotina",regex:/\b(?:monte.*rotina|rotina de|para a semana|planejamento semanal|usar no dia a dia)\b/},
        {id:"presente",nome:"Curador de presentes",regex:/\b(?:presente|presentear|aniversario|aniversário|lembranca|lembrança)\b/}
    ]);
    const detectar=texto=>{const t=normalizar(texto);return habilidades.filter(h=>h.regex.test(t)).map(h=>h.id)};
    const preco=p=>Number(p?.preco||0);
    const semelhantes=(base,produtos)=>!base?[]:(produtos||[]).filter(p=>String(p.id)!==String(base.id)).map(p=>{
        let pontos=0;if(p.categoria===base.categoria)pontos+=5;if(normalizar(p.tipo)===normalizar(base.tipo))pontos+=2;
        const bt=new Set((base.tags||[]).map(normalizar));(p.tags||[]).forEach(t=>{if(bt.has(normalizar(t)))pontos+=2});
        return {produto:p,pontos};
    }).filter(x=>x.pontos>0).sort((a,b)=>b.pontos-a.pontos||preco(a.produto)-preco(b.produto)).map(x=>x.produto);
    const alternativasEconomicas=(base,produtos,limite=5)=>semelhantes(base,produtos).filter(p=>preco(p)>0&&preco(p)<preco(base)).slice(0,limite);
    const complementos=(base,produtos,limite=5)=>{
        if(!base)return[];const regras={
            chas:["alimentos","oleaginosas"],suplementos:["alimentos","cereais"],
            alimentos:["chas","oleaginosas","cereais"],cereais:["alimentos","oleaginosas"],
            oleaginosas:["chas","alimentos"],vitaminas:["alimentos","cereais"],"cuidados-pessoais":["cuidados-pessoais","personal-care"]
        };
        const cats=new Set(regras[base.categoria]||[]),baseCorpus=corpus(base);
        return (produtos||[]).filter(p=>String(p.id)!==String(base.id)).map(p=>{
            let pontos=cats.has(p.categoria)?5:0;(p.tags||[]).forEach(t=>{if(baseCorpus.includes(normalizar(t)))pontos+=1});
            return {produto:p,pontos};
        }).filter(x=>x.pontos>0).sort((a,b)=>b.pontos-a.pontos||preco(a.produto)-preco(b.produto)).slice(0,limite).map(x=>x.produto);
    };
    const tresFaixas=(candidatos=[])=>{
        const lista=[...candidatos].filter(p=>preco(p)>0).sort((a,b)=>preco(a)-preco(b));if(!lista.length)return[];
        const indices=[0,Math.floor((lista.length-1)/2),lista.length-1];
        return [...new Set(indices)].map((i,n)=>({nivel:["Essencial","Equilibrada","Completa"][n]||"Completa",produto:lista[i]}));
    };
    const montarKit=(produtos,teto,{base=null,maxItens=4}={})=>{
        const limite=Number(teto);if(!Number.isFinite(limite)||limite<=0)return {itens:[],total:0,falta:0};
        const unicos=[...(base?[base]:[]),...(base?complementos(base,produtos,20):produtos||[])].filter((p,i,a)=>p&&a.findIndex(x=>String(x.id)===String(p.id))===i&&preco(p)>0);
        const ordenados=base?[base,...unicos.filter(p=>String(p.id)!==String(base.id)).sort((a,b)=>preco(a)-preco(b))]:unicos.sort((a,b)=>preco(a)-preco(b));
        const itens=[];let total=0;for(const p of ordenados){if(itens.length>=maxItens)break;if(total+preco(p)<=limite){itens.push(p);total+=preco(p)}}
        return {itens,total:Number(total.toFixed(2)),falta:Number(Math.max(0,limite-total).toFixed(2))};
    };
    const valorUnitario=p=>{const m=String(p?.apresentacao||"").match(/(\d+(?:[.,]\d+)?)\s*(capsulas?|unidades?|saches?|sachês?)/i);if(!m||!preco(p))return null;const q=Number(m[1].replace(",","."));return q>0?preco(p)/q:null};
    const argumentoValor=p=>{if(!p)return"";const partes=[];const u=valorUnitario(p);if(u)partes.push(`aproximadamente R$ ${u.toFixed(2).replace(".",",")} por unidade`);if(p.apresentacao)partes.push(`apresentação ${p.apresentacao}`);if((p.beneficios||[]).length)partes.push(`destaques ${p.beneficios.slice(0,3).join(", ")}`);return partes.join("; ")||"compare formato, quantidade e adequação à sua rotina"};
    const urgenciaVerdadeira=p=>Number.isFinite(Number(p?.estoque))&&Number(p.estoque)>0&&Number(p.estoque)<=3?`O catálogo informa somente ${Number(p.estoque)} unidade(s) disponível(is).`:"";
    window.QualimaxMaxSales=Object.freeze({habilidades,detectar,semelhantes,alternativasEconomicas,complementos,tresFaixas,montarKit,valorUnitario,argumentoValor,urgenciaVerdadeira});
})();
