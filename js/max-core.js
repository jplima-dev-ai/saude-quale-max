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
            excluirCategorias: [],
            orcamento: null,
            prioridade: ""
        },
        ultimosResultados: [],
        offsetResultados: 0,
        contextoResultados: "",
        historicoConsultas: [],
        ultimaIntencao: "",
        ultimoTermo: "",
        produtoEmContexto: null,
        etapaDescoberta: "inicio",
        ultimaComparacao: [],
        perguntaPendente: "",
        ultimoLoteExibido: [],
        historicoProdutosExibidos: [],
        produtosRejeitados: [],
        produtosGostei: [],
        produtosTalvez: [],
        produtosNaoGostei: [],
        carrinho: [],
        presente: { ativo:false, destinatario:"", orcamento:null, produtoIds:[] },
        confiancaAtual: { valor: 0, nivel: "baixa" },
        contextoPagina: null
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
        estado.ultimaComparacao = [];
        estado.perguntaPendente = "";
        estado.ultimoLoteExibido = [];
        estado.historicoProdutosExibidos = [];
        estado.produtosRejeitados = [];
        estado.produtosGostei = [];
        estado.produtosTalvez = [];
        estado.produtosNaoGostei = [];
        estado.carrinho = [];
        estado.presente = { ativo:false, destinatario:"", orcamento:null, produtoIds:[] };
        estado.confiancaAtual = { valor: 0, nivel: "baixa" };
        estado.contextoPagina = null;
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