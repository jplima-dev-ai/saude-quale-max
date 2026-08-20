(() => {
    "use strict";

    const normalizar = (texto) => String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const nomeArquivoSeguro = (valor) => {
        const nome = String(valor || "").trim();
        return /^[A-Za-z0-9._-]+$/.test(nome) ? nome : "";
    };

    const slugSeguro = (valor) => {
        const slug = String(valor || "").trim();
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : "";
    };

    const criarEstado = () => ({
        produtos: [],
        categorias: [],
        ultimoFoco: null,
        ultimoProdutoVisto: null,
        preferencias: {
            categoria: "",
            tipo: "",
            vegana: null,
            semGluten: null,
            termos: [],
            excluirTipos: [],
            excluirCategorias: []
        },
        ultimosResultados: [],
        offsetResultados: 0,
        contextoResultados: "",
        historicoConsultas: [],
        ultimaIntencao: "",
        ultimoTermo: "",
        produtoEmContexto: null,
        etapaDescoberta: "inicio"
    });

    const registrarConsulta = (estado, original, intencao = "busca") => {
        const texto = String(original || "").trim();
        if (!estado || !texto) return;
        estado.ultimoTermo = texto;
        estado.ultimaIntencao = intencao;
        estado.historicoConsultas.push({ texto, intencao, em: Date.now() });
        if (estado.historicoConsultas.length > 8) estado.historicoConsultas.shift();
    };

    const limparMemoriaConversa = (estado) => {
        if (!estado) return;
        estado.historicoConsultas = [];
        estado.ultimaIntencao = "";
        estado.ultimoTermo = "";
        estado.produtoEmContexto = null;
        estado.etapaDescoberta = "inicio";
    };

    window.QualimaxMaxCore = Object.freeze({
        normalizar,
        nomeArquivoSeguro,
        slugSeguro,
        criarEstado,
        registrarConsulta,
        limparMemoriaConversa
    });
})();