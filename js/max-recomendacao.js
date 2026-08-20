(() => {
    "use strict";

    const core = window.QualimaxMaxCore;
    if (!core) {
        console.error("Max: max-core.js deve ser carregado antes de max-recomendacao.js.");
        return;
    }
    const { normalizar } = core;

    const pontuarSimilaridade = (base, candidato) => {
        if (!base || !candidato || base.id === candidato.id) return -1;
        let pontos = 0;

        if (base.categoria === candidato.categoria) pontos += 5;
        if (normalizar(base.tipo) && normalizar(base.tipo) === normalizar(candidato.tipo)) pontos += 3;
        if (Boolean(base.vegana) === Boolean(candidato.vegana)) pontos += 1;
        if (Boolean(base.sem_gluten) === Boolean(candidato.sem_gluten)) pontos += 1;

        const tagsBase = new Set((base.tags || []).map(normalizar).filter(Boolean));
        (candidato.tags || []).map(normalizar).forEach(tag => {
            if (tagsBase.has(tag)) pontos += 2;
        });

        const beneficiosBase = new Set((base.beneficios || []).map(normalizar).filter(Boolean));
        (candidato.beneficios || []).map(normalizar).forEach(item => {
            if (beneficiosBase.has(item)) pontos += 1;
        });

        return pontos;
    };

    const similaresAoProduto = (produtos, produto, limite = 8) =>
        (produtos || [])
            .map(candidato => ({ produto: candidato, pontos: pontuarSimilaridade(produto, candidato) }))
            .filter(x => x.pontos > 0)
            .sort((a,b) =>
                b.pontos - a.pontos ||
                String(a.produto?.nome || "").localeCompare(String(b.produto?.nome || ""), "pt-BR")
            )
            .slice(0, limite)
            .map(x => x.produto);

    window.QualimaxMaxRecomendacao = Object.freeze({
        pontuarSimilaridade,
        similaresAoProduto
    });
})();