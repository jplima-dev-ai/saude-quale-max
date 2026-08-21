(() => {
    "use strict";

    const core = window.QualimaxMaxCore;
    if (!core) {
        console.error("Max: max-core.js deve ser carregado antes de max-entidades.js.");
        return;
    }
    const { normalizar } = core;

    const produtoPorNome = (produtos, termo) => {
        const alvo = normalizar(termo);
        if (!alvo) return null;
        return (produtos || []).find((p) => {
            const nome = normalizar(p?.nome);
            const slug = normalizar(String(p?.slug || "").replace(/-/g, " "));
            return (nome && alvo.includes(nome)) || (slug && alvo.includes(slug));
        }) || null;
    };

    const produtosMencionados = (produtos, termo, limite = 4) => {
        const alvo = normalizar(termo);
        return (produtos || []).filter((p) => {
            const nome = normalizar(p?.nome);
            const palavras = nome.split(/\s+/).filter(x => x.length > 3);
            return (nome && alvo.includes(nome)) ||
                (palavras.length >= 2 && palavras.filter(x => alvo.includes(x)).length >= 2);
        }).slice(0, limite);
    };

    const resolverReferenciaProduto = (termo, produtoContextual) => {
        if (!produtoContextual?.nome) return String(termo || "");
        return String(termo || "").replace(
            /\b(?:esse produto|este produto|essa opcao|essa opção|ele|ela|esse|essa|este|esta)\b/g,
            produtoContextual.nome
        );
    };

    window.QualimaxMaxEntidades = Object.freeze({
        produtoPorNome,
        produtosMencionados,
        resolverReferenciaProduto
    });
})();