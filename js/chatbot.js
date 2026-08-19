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

    const estado = {
        produtos: [],
        categorias: [],
        ultimoFoco: null,
        ultimoProdutoVisto: null,
        preferencias: {
            categoria: "",
            tipo: "",
            vegana: null,
            semGluten: null,
            termos: []
        },
        ultimosResultados: [],
        offsetResultados: 0,
        contextoResultados: ""
    };

    const mensagens = () => document.querySelector("[data-chat-mensagens]");
    const campoChat = () => document.querySelector("[data-chat-input]");

    const rolarFim = () => {
        const area = mensagens();
        if (!area) return;
        const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
            document.documentElement.classList.contains("movimento-reduzido");
        area.scrollTo({ top: area.scrollHeight, behavior: reduzir ? "auto" : "smooth" });
    };

    const adicionarMensagem = (texto, tipo = "bot") => {
        const area = mensagens();
        if (!area) return null;
        const elemento = document.createElement("div");
        elemento.className = `chat-mensagem chat-mensagem-${tipo}`;
        elemento.textContent = String(texto || "");
        area.append(elemento);
        rolarFim();
        return elemento;
    };

    const adicionarAcoes = (acoes) => {
        const area = mensagens();
        if (!area || !Array.isArray(acoes) || !acoes.length) return;
        const grupo = document.createElement("div");
        grupo.className = "chat-refinamentos";
        grupo.setAttribute("aria-label", "Sugestões de resposta");
        acoes.forEach(({ texto, valor, acao }) => {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "chat-refinamento";
            botao.textContent = texto;
            botao.addEventListener("click", () => {
                if (typeof acao === "function") {
                    acao();
                    return;
                }
                processarEntrada(valor || texto, false);
            });
            grupo.append(botao);
        });
        area.append(grupo);
        rolarFim();
    };

    const paginaAtual = () => location.pathname.split("/").pop() || "index.html";

    const fecharChat = () => document.querySelector("[data-chat-fechar]")?.click();

    const irCatalogo = ({ busca = "", categoria = "", tipo = "", caracteristica = "" } = {}) => {
        const params = new URLSearchParams();
        if (busca) params.set("busca", String(busca).slice(0, 120));
        if (categoria) params.set("categoria", categoria);
        if (tipo) params.set("tipo", tipo);
        if (caracteristica) params.set("caracteristica", caracteristica);
        const query = params.toString();

        if (paginaAtual() === "catalogo.html") {
            const url = `${location.pathname}${query ? `?${query}` : ""}#produtos`;
            history.replaceState(null, "", url);
            const buscaCampo = document.querySelector("[data-busca-produtos]");
            const catCampo = document.querySelector("[data-filtro-categoria]");
            const tipoCampo = document.querySelector("[data-filtro-tipo]");
            const carCampo = document.querySelector("[data-filtro-caracteristica]");
            if (buscaCampo) { buscaCampo.value = busca; buscaCampo.dispatchEvent(new Event("input", { bubbles: true })); }
            if (catCampo) { catCampo.value = categoria; catCampo.dispatchEvent(new Event("change", { bubbles: true })); }
            if (tipoCampo) { tipoCampo.value = tipo; tipoCampo.dispatchEvent(new Event("change", { bubbles: true })); }
            if (carCampo) { carCampo.value = caracteristica; carCampo.dispatchEvent(new Event("change", { bubbles: true })); }
            document.querySelector("#produtos")?.scrollIntoView({ block: "start" });
            buscaCampo?.focus();
            return;
        }

        location.href = `catalogo.html${query ? `?${query}` : ""}#produtos`;
    };

    const quizAtivo = () => window.QualimaxConfig?.recursos?.quiz !== false;

    const irQuiz = () => {
        if (!quizAtivo()) {
            adicionarMensagem("O quiz não está disponível nesta configuração da loja.");
            return;
        }
        location.href = paginaAtual() === "quiz.html" ? "#quiz" : "quiz.html#quiz";
    };

    const numeroWhatsApp = () => String(window.QualimaxConfig?.contato?.whatsapp || "").replace(/\D/g, "");

    const adicionarWhatsAppNoChat = (textoBotao = "Falar com a equipe no WhatsApp", contexto = "") => {
        const area = mensagens();
        const numero = numeroWhatsApp();
        if (!area || !numero) {
            adicionarMensagem("O WhatsApp não está disponível neste momento. Consulte a página de contato.");
            return;
        }
        const nome = window.QualimaxConfig?.empresa?.nome || "a loja";
        const link = document.createElement("a");
        link.className = "chat-whatsapp-cta";
        const complemento = contexto ? ` ${contexto}` : "";
        link.href = `https://wa.me/${numero}?text=${encodeURIComponent(`Olá! Vim pelo site da ${nome}.${complemento} Gostaria de falar com a equipe.`)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = textoBotao;
        link.setAttribute("aria-label", `${textoBotao}, abre em nova aba`);
        area.append(link);
        rolarFim();
    };

    const mostrarRedesNoChat = () => {
        const area = mensagens();
        const redes = Array.isArray(window.QualimaxRedesAtivas) ? window.QualimaxRedesAtivas : [];
        if (!area) return;
        if (!redes.length) {
            adicionarMensagem("Os perfis oficiais da loja ainda não estão disponíveis neste site.");
            return;
        }
        adicionarMensagem("Estes são os canais oficiais disponíveis:");
        const grupo = document.createElement("div");
        grupo.className = "chat-redes";
        redes.forEach((rede) => {
            const link = document.createElement("a");
            link.href = rede.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = rede.nome;
            link.setAttribute("aria-label", `${rede.nome} da loja, abre em nova aba`);
            grupo.append(link);
        });
        area.append(grupo);
        rolarFim();
    };

    const criarCardProduto = (produto) => {
        const card = document.createElement("article");
        card.className = "chat-produto-card";

        const imagem = document.createElement("img");
        imagem.src = `img/thumbs/${nomeArquivoSeguro(produto.imagem)}`;
        imagem.alt = "";
        imagem.loading = "lazy";
        imagem.width = 96;
        imagem.height = 120;
        imagem.addEventListener("error", () => imagem.remove());

        const conteudo = document.createElement("div");
        conteudo.className = "chat-produto-conteudo";

        const nome = document.createElement("strong");
        nome.textContent = produto.nome;

        const texto = document.createElement("span");
        texto.textContent = produto.copy || produto.descricao || "Confira os detalhes no catálogo.";

        const acoes = document.createElement("div");
        acoes.className = "chat-produto-acoes";

        const abrir = document.createElement("button");
        abrir.type = "button";
        abrir.textContent = "Abrir detalhes";
        abrir.addEventListener("click", () => {
            fecharChat();
            if (window.QualimaxProdutos?.abrirModal) {
                window.QualimaxProdutos.abrirModal(produto);
            } else {
                const slug = slugSeguro(produto.slug);
                if (slug) location.href = `produto/${slug}.html`;
            }
        });
        acoes.append(abrir);

        if (window.QualimaxColecoes?.toggleInteresse) {
            const lista = document.createElement("button");
            lista.type = "button";
            lista.textContent = "Adicionar à minha lista";
            lista.addEventListener("click", async () => {
                const ativo = await window.QualimaxColecoes.toggleInteresse(produto.id);
                lista.textContent = ativo ? "✓ Na minha lista" : "Adicionar à minha lista";
                lista.setAttribute("aria-pressed", String(Boolean(ativo)));
            });
            acoes.append(lista);
        }

        conteudo.append(nome, texto, acoes);
        card.append(imagem, conteudo);
        return card;
    };

    const mostrarPaginaResultados = (reiniciar = false) => {
        const area = mensagens();
        if (!area || !estado.ultimosResultados.length) return;
        if (reiniciar) estado.offsetResultados = 0;

        const inicio = estado.offsetResultados;
        const pagina = estado.ultimosResultados.slice(inicio, inicio + 3);
        if (!pagina.length) {
            adicionarMensagem("Não há mais opções nessa busca.");
            return;
        }

        if (inicio === 0) adicionarMensagem(`${estado.contextoResultados}:`);
        else adicionarMensagem("Aqui vão mais opções:");

        const grupo = document.createElement("div");
        grupo.className = "chat-produtos";
        pagina.forEach((produto) => grupo.append(criarCardProduto(produto)));
        area.append(grupo);
        estado.offsetResultados += pagina.length;

        const acoes = [];
        if (estado.offsetResultados < estado.ultimosResultados.length) {
            acoes.push({ texto: "Mostrar mais", acao: () => mostrarPaginaResultados(false) });
        }
        acoes.push({
            texto: "Ver no catálogo",
            acao: () => {
                fecharChat();
                irCatalogo({
                    categoria: estado.preferencias.categoria,
                    tipo: estado.preferencias.tipo,
                    caracteristica: estado.preferencias.vegana === true ? "vegano" :
                        estado.preferencias.semGluten === true ? "sem_gluten" : ""
                });
            }
        });
        adicionarAcoes(acoes);
        rolarFim();
    };

    const registrarResultados = (itens, contexto) => {
        estado.ultimosResultados = itens;
        estado.offsetResultados = 0;
        estado.contextoResultados = contexto;
        if (!itens.length) {
            adicionarMensagem("Não encontrei produtos que combinem com todos esses critérios no catálogo atual.");
            adicionarAcoes([
                { texto: "Limpar preferências", valor: "limpar preferencias" },
                { texto: "Fazer o quiz", acao: () => { fecharChat(); irQuiz(); } },
                { texto: "Falar com a equipe", acao: () => adicionarWhatsAppNoChat() }
            ]);
            return;
        }
        mostrarPaginaResultados(true);
    };

    const resumoPreferencias = () => {
        const partes = [];
        if (estado.preferencias.categoria) {
            const c = estado.categorias.find(x => x.id === estado.preferencias.categoria);
            if (c) partes.push(c.nome);
        }
        if (estado.preferencias.tipo) partes.push(`formato ${estado.preferencias.tipo}`);
        if (estado.preferencias.vegana === true) partes.push("vegano");
        if (estado.preferencias.semGluten === true) partes.push("sem glúten");
        if (estado.preferencias.termos.length) partes.push(estado.preferencias.termos.join(", "));
        return partes.join(" + ");
    };

    const detectarCategoria = (termo) => estado.categorias.find((item) => {
        const nome = normalizar(item.nome);
        const id = normalizar(item.id);
        const partes = nome.split(/\s+/).filter((parte) => parte.length > 2 && !["dos", "das", "com", "para"].includes(parte));
        return termo.includes(nome) || termo.includes(id) || partes.some((parte) => termo.includes(parte));
    });

    const atualizarPreferencias = (termo) => {
        const categoria = detectarCategoria(termo);
        if (categoria) estado.preferencias.categoria = categoria.id;

        if (/vegano|vegana|veganos|veganas/.test(termo)) estado.preferencias.vegana = true;
        if (/sem gluten|sem glúten/.test(termo)) estado.preferencias.semGluten = true;

        if (/capsula|cápsula|capsulas|cápsulas/.test(termo)) estado.preferencias.tipo = "capsula";
        else if (/(^|\s)po($|\s)|(^|\s)pó($|\s)|em po|em pó/.test(termo)) estado.preferencias.tipo = "po";
        else if (/liquido|líquido/.test(termo)) estado.preferencias.tipo = "liquido";
        else if (/(^|\s)cha($|\s)|(^|\s)chá($|\s)/.test(termo)) estado.preferencias.tipo = "cha";

        const stop = new Set([
            "quero","tem","voces","vocês","algum","alguma","coisa","produto","produtos","para","com","uma","uns","umas",
            "de","do","da","dos","das","e","o","a","me","mostra","mostrar","procuro","preciso","ver","opcao","opção","opcoes",
            "opções","vegano","vegana","veganos","veganas","sem","gluten","glúten","capsula","cápsula","capsulas","cápsulas",
            "po","pó","liquido","líquido","em"
        ]);
        const tokens = termo.split(/\s+/)
            .map((x) => x.replace(/[^a-z0-9-]/g, ""))
            .filter((x) => x.length > 1 && !stop.has(x));

        const nomesCategorias = new Set(
            estado.categorias.flatMap(c => normalizar(`${c.id} ${c.nome}`).split(/\s+/))
        );
        const termosLivres = tokens.filter(x => !nomesCategorias.has(x));
        if (termosLivres.length) {
            estado.preferencias.termos = [...new Set(termosLivres)].slice(0, 5);
        }
    };

    const filtrarComPreferencias = () => {
        return estado.produtos
            .map((produto) => {
                if (estado.preferencias.categoria && produto.categoria !== estado.preferencias.categoria) return null;
                if (estado.preferencias.tipo && normalizar(produto.tipo) !== normalizar(estado.preferencias.tipo)) return null;
                if (estado.preferencias.vegana === true && produto.vegana !== true) return null;
                if (estado.preferencias.semGluten === true && produto.sem_gluten !== true) return null;

                const texto = normalizar([
                    produto.nome, produto.copy, produto.descricao, produto.categoria, produto.tipo,
                    ...(produto.tags || []), ...(produto.beneficios || [])
                ].join(" "));

                let pontos = 0;
                estado.preferencias.termos.forEach((token) => {
                    if (texto.includes(token)) pontos += 2;
                });
                if (estado.preferencias.categoria) pontos += 2;
                if (estado.preferencias.tipo) pontos += 1;
                if (estado.preferencias.vegana === true) pontos += 1;
                if (estado.preferencias.semGluten === true) pontos += 1;
                return { produto, pontos };
            })
            .filter(Boolean)
            .filter(({ pontos }) => !estado.preferencias.termos.length || pontos > 0)
            .sort((a, b) => b.pontos - a.pontos || Number(b.produto.destaque) - Number(a.produto.destaque))
            .map(({ produto }) => produto);
    };

    const limparPreferencias = () => {
        estado.preferencias = { categoria: "", tipo: "", vegana: null, semGluten: null, termos: [] };
        estado.ultimosResultados = [];
        estado.offsetResultados = 0;
        estado.contextoResultados = "";
    };

    const aplicarContextoCatalogo = (contexto = {}) => {
        if (contexto.categoria && estado.categorias.some(c => c.id === contexto.categoria)) {
            estado.preferencias.categoria = contexto.categoria;
        } else if (!contexto.categoria) {
            estado.preferencias.categoria = "";
        }

        estado.preferencias.tipo = contexto.tipo || "";

        if (["vegano","vegana"].includes(contexto.caracteristica)) {
            estado.preferencias.vegana = true;
            estado.preferencias.semGluten = null;
        } else if (["sem_gluten","sem-gluten"].includes(contexto.caracteristica)) {
            estado.preferencias.semGluten = true;
            estado.preferencias.vegana = null;
        } else {
            estado.preferencias.vegana = null;
            estado.preferencias.semGluten = null;
        }

        const busca = normalizar(contexto.busca || "");
        if (busca) {
            estado.preferencias.termos = [...new Set(busca.split(/\s+/).filter(x => x.length > 1))].slice(0,5);
        } else {
            estado.preferencias.termos = [];
        }
    };

    const responderAjudaEscolha = () => {
        adicionarMensagem("Posso refinar com você. Vamos descobrir juntos. Qual desses caminhos desperta mais a sua curiosidade agora?");
        const acoes = [
            { texto: "Alimentos e lanches", valor: "alimentos" },
            { texto: "Chás", valor: "chás" },
            { texto: "Vitaminas", valor: "vitaminas" },
            { texto: "Suplementos", valor: "suplementos" }
        ];
        if (quizAtivo()) acoes.push({ texto: "Prefiro fazer o quiz", acao: () => { fecharChat(); irQuiz(); } });
        adicionarAcoes(acoes);
    };

    const ehPerguntaMedica = (termo) =>
        /curar|cura|tratar|tratamento|doenca|doença|diabetes|pressao alta|pressão alta|colesterol|ansiedade|depressao|depressão|remedio|remédio|medicamento|emagrecer|emagrecimento/.test(termo);

    const processarEntrada = (texto, mostrarUsuario = true) => {
        const original = String(texto || "").trim().slice(0, 300);
        const termo = normalizar(original);
        if (!termo) return;

        if (mostrarUsuario) adicionarMensagem(original, "usuario");

        if (/^(oi|ola|olá|bom dia|boa tarde|boa noite|hey)\b/.test(termo)) {
            adicionarMensagem("Olá! Posso transformar o que você procura em caminhos pelo catálogo. Diga um produto, uma categoria, um formato ou uma preferência — e vamos descobrir o que aparece.");
            adicionarAcoes([
                { texto: "Encontrar um produto", valor: "quero encontrar um produto" },
                { texto: "Não sei o que escolher", valor: "não sei o que escolher" },
                { texto: "Minhas escolhas", valor: "minhas escolhas" }
            ]);
            return;
        }

        if (/limpar preferencias|limpar preferências|recomecar|recomeçar|nova busca/.test(termo)) {
            limparPreferencias();
            adicionarMensagem("Preferências desta conversa limpas. Podemos começar uma nova busca.");
            responderAjudaEscolha();
            return;
        }

        if (/mostrar mais|mais opcoes|mais opções|outros/.test(termo) && estado.ultimosResultados.length) {
            mostrarPaginaResultados(false);
            return;
        }

        if (/meus favoritos|favoritos|minha lista|minhas escolhas|lista de interesse/.test(termo)) {
            if (window.QualimaxColecoes?.abrirDialogo) {
                adicionarMensagem("Vou abrir suas escolhas salvas neste navegador.");
                fecharChat();
                window.setTimeout(() => window.QualimaxColecoes.abrirDialogo(), 0);
            } else {
                adicionarMensagem("Suas escolhas ficam disponíveis na página do catálogo.");
                adicionarAcoes([{ texto: "Abrir catálogo", acao: () => { fecharChat(); irCatalogo(); } }]);
            }
            return;
        }

        if (/esse produto|este produto|ultimo produto|último produto|o que eu vi/.test(termo) && estado.ultimoProdutoVisto) {
            registrarResultados([estado.ultimoProdutoVisto], "Este foi o produto mais recente que você abriu");
            return;
        }

        if (ehPerguntaMedica(termo)) {
            adicionarMensagem("Posso ajudar a localizar produtos e características do catálogo, mas não faço diagnóstico nem indico produto para tratar condições de saúde. Para composição, contraindicações e uso, confirme o rótulo e converse com um profissional habilitado.");
            adicionarAcoes([
                { texto: "Explorar catálogo", acao: () => { fecharChat(); irCatalogo(); } },
                { texto: "Falar com a equipe", acao: () => adicionarWhatsAppNoChat() }
            ]);
            return;
        }

        if (/instagram|facebook|tiktok|tik tok|youtube|pinterest|rede social|redes sociais/.test(termo)) {
            mostrarRedesNoChat();
            return;
        }

        if (/whatsapp|pessoa|humano|atendimento|especialista/.test(termo)) {
            adicionarMensagem("Claro. Você pode continuar diretamente com a equipe.");
            adicionarWhatsAppNoChat();
            return;
        }

        if (/entrega|entregam|entregar|frete/.test(termo)) {
            adicionarMensagem("Área atendida, prazo e condições de entrega precisam ser confirmados com a equipe.");
            adicionarWhatsAppNoChat("Consultar entrega pelo WhatsApp");
            return;
        }

        if (/preco|preço|valor|custa|custo/.test(termo)) {
            adicionarMensagem("Preço e disponibilidade não são inventados pelo Max. A equipe confirma os dados comerciais atuais.");
            adicionarWhatsAppNoChat("Consultar valor e disponibilidade");
            return;
        }

        if (/quiz/.test(termo)) {
            if (!quizAtivo()) {
                adicionarMensagem("O quiz não está disponível nesta configuração da loja. Posso continuar a descoberta por aqui ou abrir o catálogo.");
                adicionarAcoes([{ texto: "Explorar catálogo", acao: () => { fecharChat(); irCatalogo(); } }]);
                return;
            }
            adicionarMensagem("Vou abrir o quiz de descoberta.");
            fecharChat();
            irQuiz();
            return;
        }

        if (/nao sei|não sei|me ajuda a escolher|ajuda escolher|indicação|indicacao/.test(termo)) {
            responderAjudaEscolha();
            return;
        }

        if (/cafe da manha|café da manhã/.test(termo)) {
            estado.preferencias.termos = ["granola", "aveia", "chia", "linhaca", "pasta", "amendoim"];
            const encontrados = estado.produtos.filter(p => {
                const textoProduto = normalizar([p.nome, ...(p.tags || [])].join(" "));
                return estado.preferencias.termos.some(t => textoProduto.includes(t));
            });
            registrarResultados(encontrados, "Separei opções do catálogo que combinam com o café da manhã");
            return;
        }

        if (/lanche/.test(termo)) {
            estado.preferencias.termos = ["lanche", "castanha", "granola", "amendoim", "mix"];
            const encontrados = estado.produtos.filter(p => {
                const textoProduto = normalizar([p.nome, ...(p.tags || [])].join(" "));
                return estado.preferencias.termos.some(t => textoProduto.includes(t));
            });
            registrarResultados(encontrados, "Separei opções práticas do catálogo para explorar como lanche");
            return;
        }

        atualizarPreferencias(termo);
        const resultados = filtrarComPreferencias();
        const resumo = resumoPreferencias();

        if (resultados.length) {
            registrarResultados(
                resultados,
                resumo ? `Encontrei ${resultados.length} opções para ${resumo}` :
                    `Encontrei ${resultados.length} opções relacionadas à sua busca`
            );

            if (!estado.preferencias.tipo && resultados.length > 4) {
                adicionarAcoes([
                    { texto: "Só cápsulas", valor: "em cápsulas" },
                    { texto: "Só em pó", valor: "em pó" },
                    { texto: "Veganos", valor: "vegano" },
                    { texto: "Sem glúten", valor: "sem glúten" }
                ]);
            }
            return;
        }

        adicionarMensagem("Não encontrei uma correspondência segura no catálogo com esses critérios.");
        adicionarAcoes([
            { texto: "Limpar preferências", valor: "limpar preferencias" },
            { texto: "Fazer o quiz", acao: () => { fecharChat(); irQuiz(); } },
            { texto: "Falar com a equipe", acao: () => adicionarWhatsAppNoChat() }
        ]);
    };

    document.addEventListener("qualimax:produto-visto", (evento) => {
        estado.ultimoProdutoVisto = evento.detail?.produto || estado.ultimoProdutoVisto;
    });

    document.addEventListener("qualimax:catalogo-contexto", (evento) => {
        aplicarContextoCatalogo(evento.detail || {});
    });

    document.addEventListener("DOMContentLoaded", async () => {
        const widget = document.querySelector("[data-chatbot]");
        if (!widget) return;

        if (!window.QualimaxConfig) {
            await new Promise((resolve) => document.addEventListener("qualimax:config-ready", resolve, { once: true }));
        }

        if (window.QualimaxConfig?.chatbot?.ativo === false) {
            widget.hidden = true;
            document.querySelectorAll("[data-chat-abrir]").forEach((botao) => botao.remove());
            return;
        }
        if (!quizAtivo()) {
            document.querySelectorAll('[data-chat-acao="quiz"]').forEach((botao) => { botao.hidden = true; });
        }

        try {
            const [p, c] = await Promise.all([
                fetch("./data/produtos.json"),
                fetch("./data/categorias.json")
            ]);
            if (!p.ok || !c.ok) throw new Error("Falha ao carregar dados do Max.");
            estado.produtos = (await p.json()).produtos || [];
            estado.categorias = (await c.json()).categorias || [];
            if (paginaAtual() === "catalogo.html") {
                const params = new URLSearchParams(location.search);
                aplicarContextoCatalogo({
                    busca: params.get("busca") || "",
                    categoria: params.get("categoria") || "",
                    tipo: params.get("tipo") || "",
                    caracteristica: params.get("caracteristica") || ""
                });
            }
        } catch (erro) {
            console.error(erro);
            adicionarMensagem("No momento não consegui carregar o catálogo. O atendimento pelo WhatsApp continua disponível.");
        }

        const abrir = () => {
            estado.ultimoFoco = document.activeElement;
            widget.hidden = false;
            widget.setAttribute("aria-hidden", "false");
            document.body.classList.add("chat-aberto");
            document.querySelector("[data-chat-fechar]")?.focus();
        };

        const fechar = () => {
            widget.hidden = true;
            widget.setAttribute("aria-hidden", "true");
            document.body.classList.remove("chat-aberto");
            const fallback = document.querySelector("[data-chat-abrir]");
            const alvo = estado.ultimoFoco instanceof HTMLElement && document.contains(estado.ultimoFoco)
                ? estado.ultimoFoco : fallback;
            alvo?.focus();
        };

        document.querySelectorAll("[data-chat-abrir]").forEach((botao) => botao.addEventListener("click", abrir));
        document.querySelector("[data-chat-fechar]")?.addEventListener("click", fechar);

        const enviar = () => {
            const campo = campoChat();
            if (!campo?.value.trim()) return;
            const texto = campo.value.trim();
            campo.value = "";
            processarEntrada(texto, true);
            campo.focus();
        };

        document.querySelector("[data-chat-enviar]")?.addEventListener("click", enviar);
        campoChat()?.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                enviar();
            }
        });

        document.querySelectorAll("[data-chat-acao]").forEach((botao) => botao.addEventListener("click", () => {
            const acao = botao.dataset.chatAcao;
            if (acao === "produto") { responderAjudaEscolha(); return; }
            if (acao === "categorias") {
                adicionarMensagem("Escolha uma dessas portas de entrada — depois eu ajudo a refinar:");
                adicionarAcoes(estado.categorias.slice(0, 6).map(c => ({ texto: c.nome, valor: c.nome })));
                return;
            }
            if (acao === "quiz") { fechar(); irQuiz(); return; }
            if (acao === "redes") { mostrarRedesNoChat(); return; }
            if (acao === "whatsapp") { adicionarWhatsAppNoChat(); }
        }));

        const limpar = document.createElement("button");
        limpar.type = "button";
        limpar.className = "chat-limpar";
        limpar.textContent = "Nova conversa";
        limpar.addEventListener("click", () => {
            limparPreferencias();
            const area = mensagens();
            area?.querySelectorAll(":scope > :not([data-chat-saudacao])").forEach(el => el.remove());
            adicionarMensagem("Pronto, página em branco. O que você está com vontade de descobrir agora?");
            campoChat()?.focus();
        });
        document.querySelector(".chatbot-header")?.append(limpar);

        document.addEventListener("keydown", (evento) => {
            if (widget.hidden) return;
            if (evento.key === "Escape") { fechar(); return; }
            if (evento.key !== "Tab") return;
            const focaveis = [...widget.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
                .filter((el) => !el.disabled && !el.hidden);
            if (!focaveis.length) return;
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (evento.shiftKey && document.activeElement === primeiro) {
                evento.preventDefault(); ultimo.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault(); primeiro.focus();
            }
        });
    });
})();
