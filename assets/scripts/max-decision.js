(() => {
    "use strict";

    const normalizar = window.QualimaxMaxCore?.normalizar || (t => String(t||"").toLowerCase().trim());

    const TOKENS_AMBIGUOS = Object.freeze({
        oleo: ["oleo de coco", "oleo essencial", "oleo de rosa mosqueta"],
        cha: ["cha"],
        sal: ["sal"],
        chocolate: ["chocolate"],
        castanha: ["castanha"],
        vitamina: ["vitamina"],
        suplemento: ["suplemento"]
    });

    const termosProduto = p => normalizar([p?.nome,p?.tipo,p?.categoria,...(p?.tags||[])].join(" "));

    const candidatosPorTermo = (produtos, termo) => {
        const t=normalizar(termo);
        if(!t) return [];
        return (produtos||[]).filter(p=>termosProduto(p).includes(t));
    };

    const detectarAmbiguidade = (texto, produtos) => {
        const t=normalizar(texto);
        for(const [chave] of Object.entries(TOKENS_AMBIGUOS)){
            if(new RegExp(`\\b${chave}s?\\b`).test(t)){
                const candidatos=candidatosPorTermo(produtos,chave);
                const especifico=candidatos.some(p=>t.includes(normalizar(p.nome)));
                if(candidatos.length>1 && !especifico){
                    return {ambigua:true,termo:chave,candidatos:candidatos.slice(0,6)};
                }
            }
        }
        return {ambigua:false,termo:"",candidatos:[]};
    };

    const calcularConfianca = ({texto,intencao,candidatos=[],preferencias={}}={}) => {
        let pontos=0.45;
        const t=normalizar(texto);
        if(intencao && intencao!=="busca") pontos+=0.22;
        if(candidatos.length===1) pontos+=0.25;
        if(candidatos.length>3) pontos-=0.18;
        if(preferencias.categoria) pontos+=0.08;
        if(preferencias.tipo) pontos+=0.06;
        if(preferencias.orcamento) pontos+=0.06;
        if(t.length<3) pontos-=0.2;
        const valor=Math.max(0,Math.min(1,pontos));
        return {valor,nivel:valor>=0.75?"alta":valor>=0.5?"media":"baixa"};
    };

    const conflitos = preferencias => {
        const avisos=[];
        if(preferencias?.tipo && preferencias?.excluirTipos?.includes(normalizar(preferencias.tipo))){
            avisos.push(`Você pediu o formato ${preferencias.tipo}, mas também pediu para evitá-lo.`);
        }
        if(preferencias?.categoria && preferencias?.excluirCategorias?.includes(preferencias.categoria)){
            avisos.push("A categoria escolhida também está na lista de categorias que você pediu para evitar.");
        }
        return avisos;
    };

    const contextoPagina = (produtos=[]) => {
        const id=String(document.body?.dataset?.produtoId||"").trim();
        if(id){
            const produto=produtos.find(p=>String(p.id)===id)||null;
            if(produto) return {tipo:"produto",produto};
        }

        const arquivo=(location.pathname.split("/").pop()||"index.html").toLowerCase();

        if(arquivo==="catalog.html"){
            const params=new URLSearchParams(location.search);
            const filtros={
                busca:normalizar(params.get("busca")||""),
                categoria:params.get("categoria")||"",
                tipo:params.get("tipo")||"",
                caracteristica:params.get("caracteristica")||"",
                preco:params.get("preco")||""
            };
            const ativos=Object.entries(filtros).filter(([,v])=>String(v).trim());
            return {tipo:"catalogo",filtros,temFiltros:ativos.length>0};
        }

        if(arquivo==="quiz.html") return {tipo:"quiz"};
        if(arquivo==="account.html") return {tipo:"conta"};
        if(arquivo==="support.html") return {tipo:"atendimento"};
        if(arquivo==="contact.html") return {tipo:"contato"};
        if(arquivo==="about.html") return {tipo:"sobre"};
        return {tipo:"home"};
    };


    const sugestaoConflito = preferencias => {
        const avisos=conflitos(preferencias);
        if(!avisos.length) return null;
        if(preferencias?.tipo && preferencias?.excluirTipos?.includes(normalizar(preferencias.tipo))){
            return {
                tipo:"formato",
                valor:preferencias.tipo,
                mensagem:`O formato ${preferencias.tipo} aparece ao mesmo tempo como desejado e como excluído.`
            };
        }
        if(preferencias?.categoria && preferencias?.excluirCategorias?.includes(preferencias.categoria)){
            return {
                tipo:"categoria",
                valor:preferencias.categoria,
                mensagem:"A categoria escolhida também está marcada para exclusão."
            };
        }
        return {tipo:"generico",valor:"",mensagem:avisos[0]};
    };

    const avaliarConfianca = ({texto,intencao,candidatos=[],preferencias={}}={}) => {
        const base=calcularConfianca({texto,intencao,candidatos,preferencias});
        const t=normalizar(texto);
        let motivo="interpretação suficiente";
        if(base.nivel==="baixa"){
            motivo=candidatos.length>3 ? "muitas opções possíveis" : t.length<3 ? "mensagem muito curta" : "faltam critérios para decidir com segurança";
        }else if(base.nivel==="media"){
            motivo=candidatos.length>1 ? "há mais de uma possibilidade plausível" : "a intenção está clara, mas ainda há pouco contexto";
        }
        return {...base,motivo};
    };


    const montarCestaPorOrcamento = (produtos, limite, {
        excluidos=[],
        preferidos=[],
        categoriasPreferidas=[]
    }={}) => {
        const teto=Number(limite);
        if(!Number.isFinite(teto)||teto<=0) return {itens:[],total:0};

        const bloqueados=new Set((excluidos||[]).map(String));
        const favoritos=new Set((preferidos||[]).map(String));
        const categorias=new Set((categoriasPreferidas||[]).filter(Boolean));

        const candidatos=(produtos||[])
            .filter(p=>Number(p.preco)>0 && Number(p.preco)<=teto && !bloqueados.has(String(p.id)))
            .map(p=>{
                let score=1;
                if(favoritos.has(String(p.id))) score+=4;
                if(categorias.has(p.categoria)) score+=2;
                if(p.destaque) score+=0.5;
                return {produto:p,score};
            })
            .sort((a,b)=>b.score-a.score || Number(a.produto.preco)-Number(b.produto.preco));

        const itens=[];
        const categoriasUsadas=new Set();
        let total=0;

        for(const {produto} of candidatos){
            if(itens.length>=5) break;
            if(categoriasUsadas.has(produto.categoria)) continue;
            const preco=Number(produto.preco);
            if(total+preco<=teto){
                itens.push(produto);
                categoriasUsadas.add(produto.categoria);
                total+=preco;
            }
        }

        for(const {produto} of candidatos){
            if(itens.length>=5) break;
            if(itens.some(x=>String(x.id)===String(produto.id))) continue;
            const preco=Number(produto.preco);
            if(total+preco<=teto){
                itens.push(produto);
                total+=preco;
            }
        }
        return {itens,total:Number(total.toFixed(2))};
    };

    const avaliarCesta = (itens=[]) => {
        const categorias=[...new Set((itens||[]).map(p=>p.categoria).filter(Boolean))];
        const total=(itens||[]).reduce((sum,p)=>sum+Number(p.preco||0),0);
        return {quantidade:itens.length,categorias,diversidade:categorias.length,total:Number(total.toFixed(2))};
    };

    window.QualimaxMaxDecision=Object.freeze({
        candidatosPorTermo,
        detectarAmbiguidade,
        calcularConfianca,
        conflitos,
        sugestaoConflito,
        avaliarConfianca,
        montarCestaPorOrcamento,
        avaliarCesta,
        contextoPagina
    });
})();
