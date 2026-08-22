(() => {
    "use strict";

    const normalizar = window.QualimaxMaxCore?.normalizar || (v => String(v || "").toLowerCase().trim());
    const OBJETIVOS = Object.freeze({
        energia: ["energia", "disposicao", "disposição", "cansaco", "cansaço"],
        imunidade: ["imunidade", "defesa", "antioxidante"],
        relaxamento: ["relaxar", "relaxamento", "calma", "tranquilidade", "sono", "dormir"],
        digestao: ["digestao", "digestão", "digestivo", "estomago", "estômago"],
        foco: ["foco", "concentracao", "concentração", "estudo", "trabalho"],
        nutricao: ["nutricao", "nutrição", "proteina", "proteína", "vitamina", "mineral"],
        lanche: ["lanche", "crocante", "beliscar", "cafe da manha", "café da manhã"]
    });
    const RESTRICOES = Object.freeze({
        semGluten: /\bsem\s+gluten\b/,
        vegana: /\bvegan[oa]s?\b/,
        semAcucar: /\bsem\s+acucar\b/,
        semCafeina: /\bsem\s+cafeina\b/,
        naoCapsula: /\b(?:sem|evitar|nao quero)\s+(?:em\s+)?capsulas?\b/,
        naoPo: /\b(?:sem|evitar|nao quero)\s+(?:em\s+)?po\b/
    });

    const tokens = value => [...new Set(normalizar(value).replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(x => x.length > 1))];
    const bigramas = value => {
        const s = ` ${normalizar(value)} `;
        return new Set(Array.from({length: Math.max(0, s.length - 1)}, (_, i) => s.slice(i, i + 2)));
    };
    const similaridade = (a, b) => {
        const aa = bigramas(a), bb = bigramas(b);
        if (!aa.size || !bb.size) return 0;
        let iguais = 0;
        aa.forEach(x => { if (bb.has(x)) iguais++; });
        return (2 * iguais) / (aa.size + bb.size);
    };
    const textoProduto = p => normalizar([p?.nome, p?.categoria, p?.tipo, p?.descricao, p?.copy, ...(p?.tags || []), ...(p?.beneficios || [])].join(" "));

    const analisar = texto => {
        const t = normalizar(texto).slice(0, 300);
        const objetivos = Object.entries(OBJETIVOS)
            .filter(([, termos]) => termos.some(termo => t.includes(normalizar(termo))))
            .map(([id]) => id);
        const restricoes = Object.fromEntries(Object.entries(RESTRICOES).map(([id, regex]) => [id, regex.test(t)]));
        const dinheiro = t.match(/\b(?:ate|no maximo|orcamento(?: de)?|posso gastar|tenho)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/);
        const quantidade = t.match(/\b(?:quero|mostre|separe)\s+(\d{1,2})\s+(?:opcoes|produtos|itens)\b/);
        return {
            texto: t,
            objetivos,
            restricoes,
            orcamento: dinheiro ? Number(dinheiro[1].replace(",", ".")) : null,
            limite: quantidade ? Math.min(8, Math.max(1, Number(quantidade[1]))) : 5,
            querExplicacao: /\b(?:por que|porque|criterio|critério|como escolheu|explique)\b/.test(t),
            querResumo: /\b(?:resumo inteligente|o que voce entendeu|o que você entendeu|minhas preferencias|meu perfil)\b/.test(t),
            querComparar: /\b(?:compare|comparar|comparacao|comparação|versus|\bvs\b|diferenca|diferença)\b/.test(t)
        };
    };

    const pontuar = (produto, analise, memoria = {}) => {
        const corpus = textoProduto(produto);
        let score = 0;
        const motivos = [];
        for (const objetivo of analise.objetivos) {
            const termos = OBJETIVOS[objetivo].map(normalizar);
            if (termos.some(x => corpus.includes(x))) { score += 6; motivos.push(`combina com ${objetivo}`); }
        }
        if (analise.restricoes.semGluten) produto.sem_gluten ? (score += 4, motivos.push("é sem glúten")) : score -= 30;
        if (analise.restricoes.vegana) produto.vegana ? (score += 4, motivos.push("é vegano")) : score -= 30;
        if (analise.restricoes.semAcucar) corpus.includes("sem acucar") ? (score += 3, motivos.push("indica ausência de açúcar")) : score -= 2;
        if (analise.restricoes.semCafeina && corpus.includes("cafeina")) score -= 30;
        if (analise.restricoes.naoCapsula && normalizar(produto.tipo).includes("capsula")) score -= 30;
        if (analise.restricoes.naoPo && normalizar(produto.tipo) === "po") score -= 30;
        if (Number.isFinite(analise.orcamento)) Number(produto.preco) <= analise.orcamento ? (score += 4, motivos.push("cabe no orçamento")) : score -= 30;
        if ((memoria.gostei || []).includes(String(produto.id))) { score += 5; motivos.push("segue suas escolhas anteriores"); }
        if ((memoria.naoGostei || []).includes(String(produto.id))) score -= 50;
        if (produto.destaque) score += .5;
        return {produto, score, motivos: [...new Set(motivos)].slice(0, 3)};
    };

    const recomendar = (produtos, analise, memoria = {}) => {
        const vistos = new Set(), categorias = new Set(), ordenados = (produtos || [])
            .map(p => pontuar(p, analise, memoria)).filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score || Number(a.produto.preco || Infinity) - Number(b.produto.preco || Infinity));
        const resultado = [];
        for (const item of ordenados) {
            if (resultado.length >= analise.limite) break;
            if (!categorias.has(item.produto.categoria) || resultado.length >= Math.ceil(analise.limite / 2)) {
                resultado.push(item); vistos.add(String(item.produto.id)); categorias.add(item.produto.categoria);
            }
        }
        for (const item of ordenados) if (resultado.length < analise.limite && !vistos.has(String(item.produto.id))) resultado.push(item);
        return resultado;
    };

    const encontrarAproximados = (texto, produtos, limite = 3) => (produtos || [])
        .map(produto => ({produto, similaridade: Math.max(similaridade(texto, produto.nome), ...tokens(texto).map(t => similaridade(t, produto.nome))) }))
        .filter(x => x.similaridade >= .48)
        .sort((a, b) => b.similaridade - a.similaridade)
        .slice(0, limite);

    const comparar = produtos => (produtos || []).slice(0, 3).map(p => ({
        id: p.id, nome: p.nome, preco: Number(p.preco || 0), tipo: p.tipo || "não informado",
        categoria: p.categoria || "não informada", vegana: Boolean(p.vegana), semGluten: Boolean(p.sem_gluten),
        beneficios: (p.beneficios || []).slice(0, 3)
    }));

    const perguntaSeguinte = analise => {
        if (!analise.objetivos.length) return "Qual resultado ou momento da rotina você quer priorizar?";
        if (!Number.isFinite(analise.orcamento)) return "Você quer definir um orçamento máximo ou prefere ver as melhores combinações primeiro?";
        if (!Object.values(analise.restricoes).some(Boolean)) return "Existe algum formato ou característica que você queira evitar?";
        return "Prefere que eu priorize menor preço, variedade ou maior afinidade com seus critérios?";
    };

    window.QualimaxMaxIntelligence = Object.freeze({ analisar, pontuar, recomendar, encontrarAproximados, comparar, perguntaSeguinte, similaridade });
})();
