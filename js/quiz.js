class QuizInterativo {
    constructor(seletor = ".quiz-container") {
        this.container = document.querySelector(seletor);
        this.quizData = null;
        this.produtosData = null;
        this.categoriasData = [];
        this.respostas = {};
        this.perguntaAtual = 0;
        this.respondendo = false;
        this.config = null;
        this.init();
    }


    escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[caractere]));
    }

    nomeArquivoSeguro(valor) {
        const nome = String(valor ?? "").trim();
        return /^[A-Za-z0-9._-]+$/.test(nome) ? nome : "";
    }

    async init() {
        if (!this.container) {
            return;
        }

        try {
            await this.carregarConfig();
            if (this.config?.recursos?.quiz === false) {
                this.renderizarIndisponivel();
                return;
            }
            await this.carregarDados();
            this.renderizarPergunta();
        } catch (erro) {
            console.error(
                "Erro ao inicializar quiz:",
                erro
            );
            this.mostrarErro();
        }
    }

    async carregarConfig() {
        if (window.QualimaxConfig) {
            this.config = window.QualimaxConfig;
            return;
        }
        await new Promise((resolve) => document.addEventListener("qualimax:config-ready", (evento) => {
            this.config = evento.detail || {};
            resolve();
        }, { once: true }));
    }

    async carregarDados() {
        const [respostaQuiz, respostaProdutos, respostaCategorias] =
            await Promise.all([
                fetch("./data/quiz.json"),
                fetch("./data/produtos.json"),
                fetch("./data/categorias.json")
            ]);

        if (!respostaQuiz.ok || !respostaProdutos.ok || !respostaCategorias.ok) {
            throw new Error(
                "Não foi possível carregar os dados do quiz."
            );
        }

        this.quizData = await respostaQuiz.json();
        this.produtosData = await respostaProdutos.json();
        const categoriasJson = await respostaCategorias.json();
        this.categoriasData = Array.isArray(categoriasJson.categorias) ? categoriasJson.categorias : [];

        if (
            !Array.isArray(this.quizData.perguntas) ||
            this.quizData.perguntas.length === 0 ||
            !this.quizData.perguntas.every(
                (pergunta) =>
                    pergunta &&
                    Number.isFinite(Number(pergunta.id)) &&
                    typeof pergunta.pergunta === "string" &&
                    Array.isArray(pergunta.opcoes) &&
                    pergunta.opcoes.length > 0
            ) ||
            !Array.isArray(this.produtosData.produtos) ||
            !this.quizData.cta_final
        ) {
            throw new Error(
                "Estrutura de dados do quiz inválida."
            );
        }
    }

    renderizarIndisponivel() {
        this.container.innerHTML = `
            <section class="quiz-card" role="status" aria-labelledby="quiz-indisponivel-titulo">
                <p class="secao-subtitulo">Descoberta guiada</p>
                <h2 id="quiz-indisponivel-titulo">Este recurso não está disponível nesta loja.</h2>
                <p>Você ainda pode explorar o catálogo ou conversar com o assistente da loja.</p>
                <p><a class="botao botao-principal" href="catalogo.html#produtos">Explorar catálogo</a></p>
            </section>
        `;
    }

    mostrarErro() {
        if (!this.container) {
            return;
        }

        const aviso = document.createElement("p");
        aviso.className = "quiz-erro";
        aviso.setAttribute("role", "alert");
        aviso.textContent = "Não foi possível carregar o quiz agora. Tente novamente mais tarde.";
        this.container.replaceChildren(aviso);
    }

    renderizarPergunta() {
        if (
            !this.container ||
            !this.quizData?.perguntas?.length
        ) {
            return;
        }

        const pergunta =
            this.quizData.perguntas[this.perguntaAtual];

        if (!pergunta) {
            this.mostrarResultado();
            return;
        }

        this.respondendo = false;

        const progresso = this.perguntaAtual + 1;
        const total = this.quizData.perguntas.length;

        const opcoesHtml = pergunta.opcoes
            .map((opcao, index) => {
                const categoria =
                    opcao.categoria || "";
                const experiencia =
                    opcao.experiencia || "";

                return `
                    <button
                        class="quiz-opcao"
                        data-id="${this.escaparHTML(opcao.id)}"
                        data-categoria="${this.escaparHTML(categoria)}"
                        data-experiencia="${this.escaparHTML(experiencia)}"
                        type="button"
                        aria-pressed="false"
                        aria-label="Opção ${index + 1}: ${this.escaparHTML(opcao.texto)}"
                    >
                        <span class="quiz-icone" aria-hidden="true">${this.escaparHTML(opcao.icone)}</span>
                        <span class="quiz-texto">${this.escaparHTML(opcao.texto)}</span>
                    </button>
                `;
            })
            .join("");

        this.container.innerHTML = `
            <div
                class="quiz-card"
                role="group"
                aria-labelledby="quiz-pergunta-${this.escaparHTML(pergunta.id)}"
            >
                <div
                    class="quiz-progresso"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <div
                        class="quiz-barra"
                        role="progressbar"
                        aria-valuemin="0"
                        aria-valuemax="${total}"
                        aria-valuenow="${progresso}"
                        aria-label="Progresso do quiz"
                    >
                        <div
                            class="quiz-barra-preenchida"
                            style="width: ${(progresso / total) * 100}%"
                        ></div>
                    </div>
                    <span class="quiz-progresso-texto">
                        Pergunta ${progresso} de ${total}
                    </span>
                </div>

                <h2
                    class="quiz-pergunta"
                    id="quiz-pergunta-${this.escaparHTML(pergunta.id)}"
                >
                    ${this.escaparHTML(pergunta.pergunta)}
                </h2>

                <div
                    class="quiz-opcoes"
                    role="group"
                    aria-label="Opções de resposta"
                >
                    ${opcoesHtml}
                </div>

                <div
                    class="quiz-anuncio-sr sr-only"
                    aria-live="assertive"
                    aria-atomic="true"
                ></div>
            </div>
        `;

        this.adicionarEventListeners();

        this.container
            .querySelector(".quiz-opcao")
            ?.focus();
    }

    adicionarEventListeners() {
        this.container
            .querySelectorAll(".quiz-opcao")
            .forEach((opcao, indice, lista) => {
                opcao.addEventListener("click", () => {
                    this.selecionarResposta(opcao);
                });

                opcao.addEventListener("keydown", (evento) => {
                    if (
                        evento.key === "Enter" ||
                        evento.key === " "
                    ) {
                        evento.preventDefault();
                        opcao.click();
                        return;
                    }

                    const teclasAnteriores = [
                        "ArrowLeft",
                        "ArrowUp"
                    ];
                    const teclasPosteriores = [
                        "ArrowRight",
                        "ArrowDown"
                    ];

                    if (
                        !teclasAnteriores.includes(evento.key) &&
                        !teclasPosteriores.includes(evento.key)
                    ) {
                        return;
                    }

                    evento.preventDefault();

                    const deslocamento =
                        teclasPosteriores.includes(evento.key)
                            ? 1
                            : -1;

                    const proximo =
                        lista[
                            (indice + deslocamento + lista.length) %
                                lista.length
                        ];

                    proximo?.focus();
                });
            });
    }

    selecionarResposta(botao) {
        if (
            this.respondendo ||
            !this.quizData?.perguntas?.[this.perguntaAtual]
        ) {
            return;
        }

        this.respondendo = true;

        const pergunta =
            this.quizData.perguntas[this.perguntaAtual];

        this.respostas[`pergunta_${pergunta.id}`] =
            botao.dataset.id;

        this.container
            .querySelectorAll(".quiz-opcao")
            .forEach((opcao) => {
                opcao.disabled = true;
                opcao.setAttribute(
                    "aria-pressed",
                    String(opcao === botao)
                );
                opcao.classList.toggle(
                    "selecionada",
                    opcao === botao
                );
            });

        const anuncio = this.container.querySelector(
            ".quiz-anuncio-sr"
        );

        if (anuncio) {
            anuncio.textContent =
                `Resposta selecionada: ${botao.getAttribute("aria-label")}`;
        }

        window.setTimeout(() => {
            if (
                this.perguntaAtual <
                this.quizData.perguntas.length - 1
            ) {
                this.perguntaAtual++;
                this.renderizarPergunta();
            } else {
                this.mostrarResultado();
            }
        }, 450);
    }

    obterResposta(perguntaId) {
        return this.respostas[`pergunta_${perguntaId}`] || "";
    }

    produtoAtendeRestricao(produto, restricao) {
        if (restricao === "vegana") {
            return produto.vegana === true;
        }

        if (restricao === "sem-gluten") {
            return produto.sem_gluten === true;
        }

        if (restricao === "alergias") {
            return false;
        }

        return true;
    }

    pontuarProduto(produto, objetivo, formato, experiencia) {
        let pontuacao = 0;

        const recomendacao =
            this.quizData.recomendacoes?.[objetivo];

        const idsBase =
            recomendacao?.produtos_ids || [];

        if (idsBase.includes(produto.id)) {
            pontuacao += 6;
        }

        const tags = Array.isArray(produto.tags)
            ? produto.tags
            : [];

        const objetivosPorId = {
            energia: ["energia", "foco"],
            relaxamento: ["relaxamento", "sono", "calma"],
            saude: ["imunidade", "saude", "antioxidante"],
            beleza: ["beleza", "hidratacao"]
        };

        const tagsObjetivo =
            objetivosPorId[objetivo] || [];

        if (
            tags.some((tag) =>
                tagsObjetivo.includes(tag)
            )
        ) {
            pontuacao += 5;
        }

        const tipoPorFormato = {
            natural: "natural",
            liquido: "liquido",
            capsula: "capsula",
            cha: "cha"
        };

        if (
            formato &&
            tipoPorFormato[formato] === produto.tipo
        ) {
            pontuacao += 4;
        }

        const nivel = {
            iniciante: 1,
            regular: 2,
            frequente: 3,
            expert: 4
        };

        const experienciaProduto =
            nivel[produto.experiencia_minima] || 1;
        const experienciaUsuario =
            nivel[experiencia] || 1;

        if (
            experienciaProduto <=
            experienciaUsuario
        ) {
            pontuacao += 2;
        }

        return pontuacao;
    }

    obterProdutosRecomendados() {
        const objetivo = this.obterResposta(1);
        const formato = this.obterResposta(2);
        const restricao = this.obterResposta(3);
        const experiencia = this.obterResposta(4);

        if (restricao === "alergias") {
            return {
                objetivo,
                restricao,
                produtos: []
            };
        }

        const produtos =
            this.produtosData.produtos
                .filter((produto) =>
                    this.produtoAtendeRestricao(
                        produto,
                        restricao
                    )
                )
                .map((produto) => ({
                    produto,
                    pontuacao: this.pontuarProduto(
                        produto,
                        objetivo,
                        formato,
                        experiencia
                    )
                }))
                .sort(
                    (a, b) =>
                        b.pontuacao - a.pontuacao ||
                        a.produto.id - b.produto.id
                )
                .slice(0, 3)
                .map((item) => item.produto);

        return {
            objetivo,
            restricao,
            produtos
        };
    }

    obterNomeCategoria(id) {
        return this.categoriasData.find((categoria) => categoria.id === id)?.nome || id || "Sem categoria";
    }

    mostrarResultado() {
        if (!this.container) {
            return;
        }

        const {
            objetivo,
            restricao,
            produtos
        } = this.obterProdutosRecomendados();

        const recomendacao =
            this.quizData.recomendacoes?.[objetivo];

        if (!recomendacao) {
            const aviso = document.createElement("p");
            aviso.setAttribute("role", "alert");
            aviso.textContent = "Não foi possível processar suas respostas. Tente novamente.";
            this.container.replaceChildren(aviso);
            return;
        }

        const temRestricaoAlergia =
            restricao === "alergias";

        const tituloResultado =
            temRestricaoAlergia
                ? "Vamos ajudar você a escolher com cuidado"
                : recomendacao.titulo;

        const descricaoResultado =
            temRestricaoAlergia
                ? "Como você informou que possui várias alergias, não vamos indicar produtos automaticamente. Nossa equipe pode verificar a composição e as informações de cada opção com você."
                : recomendacao.descricao;

        const produtosHtml = produtos.length
            ? produtos
                .map((produto) =>
                    this.renderizarCardProduto(produto)
                )
                .join("")
            : `<p class="quiz-sem-produtos">Não encontramos uma combinação exata. Nossa equipe pode ajudar você a encontrar uma opção adequada.</p>`;

        const tituloProdutos =
            temRestricaoAlergia
                ? ""
                : `<h3 class="quiz-produtos-titulo">Produtos que mais combinam com suas respostas</h3>`;

        const html = `
            <div
                class="quiz-resultado"
                role="region"
                aria-labelledby="quiz-resultado-titulo"
                aria-live="polite"
            >
                <div class="quiz-resultado-header">
                    <span
                        class="quiz-resultado-icone"
                        aria-hidden="true"
                    >
                        ${temRestricaoAlergia ? "🤝" : "🎉"}
                    </span>

                    <h2
                        class="quiz-resultado-titulo"
                        id="quiz-resultado-titulo"
                        tabindex="-1"
                    >
                        ${this.escaparHTML(tituloResultado)}
                    </h2>

                    <p class="quiz-resultado-mensagem">
                        ${temRestricaoAlergia
                            ? "Sua segurança vem antes de uma recomendação automática."
                            : this.escaparHTML(recomendacao.mensagem)}
                    </p>
                </div>

                <p class="quiz-resultado-descricao">
                    ${this.escaparHTML(descricaoResultado)}
                </p>

                ${tituloProdutos}

                ${
                    produtosHtml
                        ? `<div class="quiz-produtos-grid" role="list">${produtosHtml}</div>`
                        : ""
                }

                <div class="quiz-cta">
                    <h3>${this.escaparHTML(this.quizData.cta_final.titulo)}</h3>
                    <p>${this.escaparHTML(this.quizData.cta_final.texto)}</p>
                    <a
                        href="#"
                        class="botao botao-principal quiz-whatsapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Falar com especialista pelo WhatsApp - abre em nova aba"
                    >
                        💬 ${this.escaparHTML(this.quizData.cta_final.botao)}
                    </a>
                </div>

                <button
                    class="quiz-reiniciar"
                    type="button"
                    aria-label="Fazer o quiz novamente do início"
                >
                    ↻ Fazer quiz novamente
                </button>
            </div>
        `;

        this.container.innerHTML = html;

        const titulo = this.container.querySelector(
            "#quiz-resultado-titulo"
        );

        this.container
            .querySelector(".quiz-reiniciar")
            ?.addEventListener("click", () => {
                this.reiniciar();
            });

        this.container.querySelectorAll("[data-quiz-produto-id]").forEach((botao) => {
            botao.addEventListener("click", () => {
                const id = Number(botao.dataset.quizProdutoId);
                const produto = this.produtosData.produtos.find((item) => Number(item.id) === id);
                if (produto && window.QualimaxProdutos?.abrirModal) window.QualimaxProdutos.abrirModal(produto);
            });
        });

        const numeroWhatsAppProduto = String(this.config?.contato?.whatsapp || "").replace(/\D/g, "");
        this.container.querySelectorAll("[data-quiz-whatsapp-id]").forEach((link) => {
            const id = Number(link.dataset.quizWhatsappId);
            const produto = this.produtosData.produtos.find((item) => Number(item.id) === id);
            if (!produto || !numeroWhatsAppProduto) { link.hidden = true; return; }
            const params = new URLSearchParams({
                origem: "quiz",
                produto: produto.slug,
                assunto: "Consultar disponibilidade"
            });
            link.href = `atendimento.html?${params.toString()}`;
            link.removeAttribute("target");
            link.removeAttribute("rel");
            link.setAttribute("aria-label", `Preparar atendimento sobre ${produto.nome}`);
        });

        const whatsapp = this.container.querySelector(".quiz-whatsapp");
        const numero = String(this.config?.contato?.whatsapp || "").replace(/\D/g, "");
        if (whatsapp && numero) {
            try {
                sessionStorage.setItem("qualimax-atendimento-quiz-v1", JSON.stringify({
                    produtoIds: produtos.map(p => Number(p.id)).filter(Number.isFinite).slice(0,8),
                    em: Date.now()
                }));
            } catch {}
            whatsapp.href = "atendimento.html?origem=quiz&assunto=Tirar%20d%C3%BAvida%20sobre%20produtos";
            whatsapp.removeAttribute("target");
            whatsapp.removeAttribute("rel");
            whatsapp.textContent = "Preparar atendimento com meus resultados";
        } else if (whatsapp) {
            whatsapp.hidden = true;
        }

        if (titulo) {
            window.setTimeout(() => titulo.focus(), 50);
        }
    }

    renderizarCardProduto(produto) {
        const categoria = this.obterNomeCategoria(produto.categoria);
        const descricao = produto.copy || produto.descricao || "Confira os detalhes deste produto.";
        return `
            <article class="quiz-produto-card" role="listitem">
                <div class="quiz-produto-imagem">
                    <img
                        src="img/thumbs/${this.nomeArquivoSeguro(produto.imagem)}"
                        alt="${this.escaparHTML(produto.nome)} — ${this.escaparHTML(categoria)}"
                        loading="lazy"
                        decoding="async"
                        width="464"
                        height="576"
                    >
                </div>

                <div class="quiz-produto-conteudo">
                    <span class="quiz-produto-categoria">${this.escaparHTML(categoria)}</span>
                    <h4>${this.escaparHTML(produto.nome)}</h4>
                    <p class="quiz-produto-descricao">${this.escaparHTML(descricao)}</p>

                    <div class="quiz-produto-badges" aria-label="Características do produto">
                        ${produto.vegana ? '<span class="badge badge-vegana">Vegano</span>' : ""}
                        ${produto.sem_gluten ? '<span class="badge badge-gluten">Sem glúten</span>' : ""}
                    </div>

                    <div class="quiz-produto-acoes">
                        <button type="button" class="botao botao-secundario quiz-produto-detalhes" data-quiz-produto-id="${this.escaparHTML(produto.id)}">
                            Ver detalhes
                        </button>
                        <a href="#" class="quiz-produto-whatsapp" data-quiz-whatsapp-id="${this.escaparHTML(produto.id)}" target="_blank" rel="noopener noreferrer">Consultar no WhatsApp →</a>
                    </div>
                </div>
            </article>
        `;
    }

    reiniciar() {
        this.respostas = {};
        this.perguntaAtual = 0;
        this.respondendo = false;
        this.renderizarPergunta();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".quiz-container")) {
        new QuizInterativo(".quiz-container");
    }
});

if (
    typeof module !== "undefined" &&
    module.exports
) {
    module.exports = QuizInterativo;
}
