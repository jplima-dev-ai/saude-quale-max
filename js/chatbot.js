(() => {
    "use strict";

    const MaxCore = window.QualimaxMaxCore;
    const MaxEntidades = window.QualimaxMaxEntidades;
    const MaxRecomendacao = window.QualimaxMaxRecomendacao;
    const MaxIntencoes = window.QualimaxMaxIntencoes;

    if (!MaxCore || !MaxEntidades || !MaxRecomendacao || !MaxIntencoes) {
        console.error("Max: módulos internos não foram carregados na ordem esperada.");
        return;
    }

    const { normalizar, nomeArquivoSeguro, slugSeguro } = MaxCore;
    const estado = MaxCore.criarEstado();

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
    const colecoesAtivas = () =>
        window.QualimaxConfig?.recursos?.colecoes !== false &&
        window.QualimaxColecoes?.ativa?.() !== false;


    const irQuiz = () => {
        if (!quizAtivo()) {
            adicionarMensagem("Poxa, o quiz não está ativo por aqui. Mas relaxa: eu consigo continuar a busca com você pelo catálogo.");
            return;
        }
        location.href = paginaAtual() === "quiz.html" ? "#quiz" : "quiz.html#quiz";
    };

    const numeroWhatsApp = () => String(window.QualimaxConfig?.contato?.whatsapp || "").replace(/\D/g, "");

    const adicionarWhatsAppNoChat = (textoBotao = "Preparar atendimento", contexto = "") => {
        const area = mensagens();
        const numero = numeroWhatsApp();
        if (!area || !numero) {
            adicionarMensagem("Opa, o WhatsApp não está disponível por aqui agora. Dá uma olhada na página de contato que eu te mostro o caminho.");
            return;
        }

        try {
            const produto = produtoContextual();
            sessionStorage.setItem("qualimax-atendimento-max-v1", JSON.stringify({
                produtoId: produto?.id || null,
                preferencias: {
                    categoria: estado.preferencias.categoria || "",
                    tipo: estado.preferencias.tipo || "",
                    vegana: estado.preferencias.vegana,
                    semGluten: estado.preferencias.semGluten,
                    termos: [...(estado.preferencias.termos || [])].slice(0,6)
                },
                contexto: String(contexto || "").slice(0,300),
                em: Date.now()
            }));
        } catch {}

        const link = document.createElement("a");
        link.className = "chat-whatsapp-cta";
        const produto = produtoContextual();
        const params = new URLSearchParams({ origem:"max", assunto:"Tirar dúvida sobre produtos" });
        if (produto?.slug && slugSeguro(produto.slug)) params.set("produto",produto.slug);
        link.href = `atendimento.html?${params.toString()}`;
        link.textContent = textoBotao;
        link.setAttribute("aria-label", `${textoBotao}. Você revisa os dados antes de abrir o WhatsApp.`);
        area.append(link);
        rolarFim();
    };

    const mostrarRedesNoChat = () => {
        const area = mensagens();
        const redes = Array.isArray(window.QualimaxRedesAtivas) ? window.QualimaxRedesAtivas : [];
        if (!area) return;
        if (!redes.length) {
            adicionarMensagem("Ainda não tenho redes sociais disponíveis por aqui.");
            return;
        }
        adicionarMensagem("Achei! Estes são os canais oficiais da loja:");
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
        const arquivoImagem = nomeArquivoSeguro(produto.imagem);
        if (arquivoImagem) imagem.src = `img/thumbs/${arquivoImagem}`;
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
        abrir.textContent = "Quero ver este";
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

        if (colecoesAtivas() && window.QualimaxColecoes?.toggleInteresse) {
            const lista = document.createElement("button");
            lista.type = "button";
            lista.textContent = "Guardar na minha lista";
            lista.addEventListener("click", async () => {
                const ativo = await window.QualimaxColecoes.toggleInteresse(produto.id);
                lista.textContent = ativo ? "✓ Guardado na lista" : "Guardar na minha lista";
                lista.setAttribute("aria-pressed", String(Boolean(ativo)));
            });
            acoes.append(lista);
        }

        conteudo.append(nome, texto, acoes);
        if (arquivoImagem) card.append(imagem);
        card.append(conteudo);
        return card;
    };

    const mostrarPaginaResultados = (reiniciar = false) => {
        const area = mensagens();
        if (!area || !estado.ultimosResultados.length) return;
        if (reiniciar) estado.offsetResultados = 0;

        const inicio = estado.offsetResultados;
        const pagina = estado.ultimosResultados.slice(inicio, inicio + 3);
        if (!pagina.length) {
            adicionarMensagem("Chegamos ao fim dessa seleção. Quer tentar outro caminho?");
            return;
        }

        if (inicio === 0) adicionarMensagem(`${estado.contextoResultados}:`);
        else adicionarMensagem("Bora ver mais algumas:");

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
            adicionarMensagem("Hmm, apertei bastante os filtros e não achei uma combinação certinha. Posso abrir um pouco a busca com você.");
            const acoes = [
                { texto: "Limpar preferências", valor: "limpar preferencias" }
            ];
            if (quizAtivo()) acoes.push({ texto: "Fazer o quiz", acao: () => { fecharChat(); irQuiz(); } });
            acoes.push({ texto: "Falar com a equipe", acao: () => adicionarWhatsAppNoChat() });
            adicionarAcoes(acoes);
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
            "po","pó","liquido","líquido","em",
            "nao","não","sei","que","qual","quais","escolher","escolho","escolha","encontrar","ache","achar",
            "ajuda","ajudar","pode","poderia","favor","por","onde","comeco","começo","começar","comecar",
            "gostaria","queria","quer","quero","saber","indica","indicar","sugere","sugerir"
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
        MaxCore.limparMemoriaConversa(estado);
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
        adicionarMensagem("Bora descobrir juntos. Escolha uma categoria ou, se preferir, faça o quiz.");
        const contagem = new Map(
            estado.categorias.map(c => [c.id, estado.produtos.filter(p => p.categoria === c.id).length])
        );
        const acoes = estado.categorias
            .filter(c => (contagem.get(c.id) || 0) > 0)
            .sort((a,b) => (contagem.get(b.id)||0) - (contagem.get(a.id)||0) || a.nome.localeCompare(b.nome,"pt-BR"))
            .slice(0, 8)
            .map(c => ({ texto: `${c.nome} (${contagem.get(c.id)})`, valor: c.nome }));
        acoes.push({ texto:"Ver catálogo completo", acao:()=>{ fecharChat(); irCatalogo(); } });
        if (quizAtivo()) acoes.push({ texto: "Prefiro fazer o quiz", acao: () => { fecharChat(); irQuiz(); } });
        adicionarAcoes(acoes);
    };

    const registrarConsulta = (original, intencao = "busca") =>
        MaxCore.registrarConsulta(estado, original, intencao);

    const produtoPorNome = (termo) =>
        MaxEntidades.produtoPorNome(estado.produtos, termo);

    const produtoContextual = () => estado.produtoEmContexto || estado.ultimoProdutoVisto || estado.ultimosResultados[0] || null;

    const definirProdutoContexto = (produto) => {
        if (produto) estado.produtoEmContexto = produto;
        return produto;
    };

    const produtosMencionados = (termo) =>
        MaxEntidades.produtosMencionados(estado.produtos, termo);


    const explicarProduto = (produto) => {
        if (!produto) return;
        definirProdutoContexto(produto);
        estado.ultimaIntencao = "produto";
        registrarResultados([produto], `Olha o que achei sobre ${produto.nome}`);
        const beneficios = Array.isArray(produto.beneficios) ? produto.beneficios.filter(Boolean).slice(0, 3) : [];
        if (beneficios.length) {
            adicionarMensagem(`No catálogo ele aparece ligado a: ${beneficios.join(", ")}. Se quiser, eu também comparo com outra opção da loja.`);
        }
        adicionarAcoes([
            { texto: "Comparar com outro", valor: `comparar ${produto.nome} com ` },
            { texto: "Ver semelhantes", acao: () => {
                const similares = similaresAoProduto(produto, 6);
                registrarResultados(similares, `Separei alternativas parecidas com ${produto.nome}`);
            }}
        ]);
    };

    const compararProdutos = (itens) => {
        if (!Array.isArray(itens) || itens.length < 2) return false;
        const [a,b] = itens;
        definirProdutoContexto(b);
        estado.ultimaIntencao = "comparar";
        const catA = estado.categorias.find(c => c.id === a.categoria)?.nome || a.categoria || "categoria não informada";
        const catB = estado.categorias.find(c => c.id === b.categoria)?.nome || b.categoria || "categoria não informada";
        const benA = (a.beneficios || []).slice(0,3).join(", ") || "consulte os detalhes";
        const benB = (b.beneficios || []).slice(0,3).join(", ") || "consulte os detalhes";
        adicionarMensagem(`Boa comparação. ${a.nome} é ${catA} e no catálogo destaca ${benA}. Já ${b.nome} é ${catB} e destaca ${benB}.`);
        adicionarMensagem("Não vou escolher por você no chute. Posso abrir os dois para você comparar composição, formato e proposta com calma.");
        const area = mensagens();
        if (area) {
            const grupo=document.createElement("div");
            grupo.className="chat-produtos";
            grupo.append(criarCardProduto(a), criarCardProduto(b));
            area.append(grupo);
            rolarFim();
        }
        return true;
    };

    const responderSobreLoja = (termo) => {
        const cfg = window.QualimaxConfig || {};
        const empresa = cfg.empresa || {};
        const contato = cfg.contato || {};
        if (/endereco|endereço|onde fica|localizacao|localização|como chegar/.test(termo)) {
            adicionarMensagem(contato.endereco ? `Claro! A loja fica em ${contato.endereco}.` : "O endereço ainda não está disponível por aqui.");
            adicionarAcoes([{ texto: "Abrir contato", acao: () => { fecharChat(); location.href="contato.html"; } }]);
            return true;
        }
        if (/telefone|email|e-mail|contato/.test(termo)) {
            const partes=[];
            if (contato.telefone) partes.push(`telefone ${contato.telefone}`);
            if (contato.email) partes.push(`e-mail ${contato.email}`);
            adicionarMensagem(partes.length ? `Você consegue falar com a ${empresa.nome || "loja"} por ${partes.join(" ou ")}.` : "Os contatos não estão disponíveis por aqui agora.");
            adicionarAcoes([{ texto:"Ver página de contato", acao:()=>{fecharChat();location.href="contato.html";} }]);
            return true;
        }
        if (/horario|horário|abre|fecha|funcionamento/.test(termo)) {
            adicionarMensagem("Eu não tenho um horário de funcionamento confirmado nos dados atuais da loja. Melhor conferir com a equipe para não te passar informação errada.");
            adicionarWhatsAppNoChat("Confirmar horário no WhatsApp");
            return true;
        }
        return false;
    };

    const responderContextoProduto = (termo) => {
        const produto = produtoContextual();
        if (!produto) return false;
        if (/^(ele|ela|esse|essa|este|esta|isso)\b|esse produto|essa opcao|essa opção/.test(termo)) {
            if (/detalhe|explica|fala|serve|beneficio|benefício|sobre/.test(termo)) {
                explicarProduto(produto);
                return true;
            }
            if (/parecido|semelhante|alternativa|outro|outra/.test(termo)) {
                const similares=similaresAoProduto(produto,8);
                registrarResultados(similares, `Separei alternativas parecidas com ${produto.nome}`);
                return true;
            }
        }
        return false;
    };

    const similaresAoProduto = (produto, limite = 8) =>
        MaxRecomendacao.similaresAoProduto(estado.produtos, produto, limite);

    const resolverReferenciaContextual = (termo) =>
        MaxEntidades.resolverReferenciaProduto(termo, produtoContextual());

    const iniciarDescobertaGuiada = () => {
        estado.etapaDescoberta = "objetivo";
        estado.preferencias = { categoria:"", tipo:"", vegana:null, semGluten:null, termos:[] };
        estado.ultimosResultados = [];
        estado.offsetResultados = 0;
        estado.contextoResultados = "";
        estado.etapaDescoberta = "objetivo";
        adicionarMensagem("Fechado. Vamos por partes e sem complicar: qual tipo de produto chama mais sua atenção agora?");
        const contagem = new Map(
            estado.categorias.map(c => [c.id, estado.produtos.filter(p => p.categoria === c.id).length])
        );
        const categoriasDisponiveis = estado.categorias
            .filter(c => (contagem.get(c.id) || 0) > 0)
            .sort((a,b) => (contagem.get(b.id)||0) - (contagem.get(a.id)||0) || a.nome.localeCompare(b.nome,"pt-BR"))
            .slice(0, 8)
            .map(c => ({ texto: `${c.nome} (${contagem.get(c.id)})`, valor: c.nome }));
        if (categoriasDisponiveis.length) {
            categoriasDisponiveis.push({ texto:"Ver catálogo completo", acao:()=>{ fecharChat(); irCatalogo(); } });
            adicionarAcoes(categoriasDisponiveis);
        } else {
            adicionarAcoes([{ texto:"Abrir catálogo", acao:()=>{ fecharChat(); irCatalogo(); } }]);
        }
    };

    const executarIntencao = (termo) => {
        const intencao = MaxIntencoes.detectar(termo);

        if (intencao === "medica") {
            adicionarMensagem("Posso te ajudar a encontrar e comparar o que existe no catálogo. Só não vou inventar diagnóstico nem dizer que um produto trata uma condição de saúde. Para uso, composição e contraindicações, vale conferir o rótulo e conversar com um profissional habilitado.");
            adicionarAcoes([
                { texto: "Explorar catálogo", acao: () => { fecharChat(); irCatalogo(); } },
                { texto: "Falar com a equipe", acao: () => adicionarWhatsAppNoChat() }
            ]);
            estado.ultimaIntencao = "medica";
            return true;
        }

        if (intencao === "loja") {
            const tratada = responderSobreLoja(termo);
            if (tratada) estado.ultimaIntencao = "loja";
            return tratada;
        }

        if (intencao === "categorias") {
            adicionarMensagem("Claro. Escolhe uma categoria e eu continuo a busca com você:");
            adicionarAcoes(estado.categorias.slice(0,8).map(c => ({ texto:c.nome, valor:c.nome })));
            estado.ultimaIntencao = "categorias";
            return true;
        }

        if (intencao === "comparar") {
            const resolvido = resolverReferenciaContextual(termo);
            const citados = produtosMencionados(resolvido);
            const contexto = produtoContextual();
            if (citados.length === 1 && contexto && citados[0].id !== contexto.id) citados.unshift(contexto);
            if (compararProdutos(citados)) {
                estado.ultimaIntencao = "comparar";
                return true;
            }
            adicionarMensagem(contexto
                ? `Já estou com ${contexto.nome} em mente. Me diga o nome do outro produto que você quer colocar lado a lado.`
                : "Bora comparar. Me diga o nome de dois produtos do catálogo.");
            estado.ultimaIntencao = "comparar";
            return true;
        }

        if (intencao === "contexto-produto") {
            const tratada = responderContextoProduto(termo);
            if (tratada) estado.ultimaIntencao = "contexto-produto";
            return tratada;
        }

        if (intencao === "produto") {
            const resolvido = resolverReferenciaContextual(termo);
            const produto = produtoPorNome(resolvido) || produtosMencionados(resolvido)[0] || produtoContextual();
            if (!produto) return false;
            explicarProduto(produto);
            estado.ultimaIntencao = "produto";
            return true;
        }

        if (intencao === "descoberta") {
            iniciarDescobertaGuiada();
            estado.ultimaIntencao = "descoberta";
            return true;
        }

        if (intencao === "similares") {
            const produto = produtoContextual() || produtoPorNome(termo) || produtosMencionados(termo)[0];
            if (!produto) return false;
            registrarResultados(similaresAoProduto(produto, 8), `Separei alternativas parecidas com ${produto.nome}`);
            estado.ultimaIntencao = "similares";
            return true;
        }

        if (intencao === "anterior") {
            if (estado.historicoConsultas.length <= 1) {
                adicionarMensagem("Ainda não tenho uma busca anterior para retomar.");
                estado.ultimaIntencao = "anterior";
                return true;
            }
            const anterior = estado.historicoConsultas.at(-2)?.texto;
            adicionarMensagem(`A busca anterior foi “${anterior}”. Quer que eu retome esse caminho?`);
            adicionarAcoes([{ texto: "Retomar busca", valor: anterior }]);
            estado.ultimaIntencao = "anterior";
            return true;
        }

        if (intencao === "redes") {
            mostrarRedesNoChat();
            estado.ultimaIntencao = "redes";
            return true;
        }

        if (intencao === "humano") {
            adicionarMensagem("Claro! Se quiser falar com uma pessoa da equipe, eu já deixo o caminho pronto.");
            adicionarWhatsAppNoChat();
            estado.ultimaIntencao = "humano";
            return true;
        }

        if (intencao === "entrega") {
            adicionarMensagem("Entrega varia conforme região e momento. A equipe confirma área atendida, prazo e condições certinhas pra você.");
            adicionarWhatsAppNoChat("Consultar entrega pelo WhatsApp");
            estado.ultimaIntencao = "entrega";
            return true;
        }

        if (intencao === "preco") {
            adicionarMensagem("Preço e estoque mudam, então eu não chuto esses dados. A equipe confirma os valores e a disponibilidade atual pra você.");
            adicionarWhatsAppNoChat("Consultar valor e disponibilidade");
            estado.ultimaIntencao = "preco";
            return true;
        }

        if (intencao === "quiz") {
            if (!quizAtivo()) {
                adicionarMensagem("Poxa, o quiz não está ativo por aqui. Mas relaxa: eu consigo continuar a busca com você pelo catálogo.");
                adicionarAcoes([{ texto: "Explorar catálogo", acao: () => { fecharChat(); irCatalogo(); } }]);
            } else {
                adicionarMensagem("Boa escolha! Vou abrir o quiz pra você.");
                fecharChat();
                irQuiz();
            }
            estado.ultimaIntencao = "quiz";
            return true;
        }

        if (intencao === "cafe-manha" || intencao === "lanche") {
            const cafe = intencao === "cafe-manha";
            estado.preferencias.termos = cafe
                ? ["granola", "aveia", "chia", "linhaca", "pasta", "amendoim"]
                : ["lanche", "castanha", "granola", "amendoim", "mix"];
            const encontrados = estado.produtos.filter(p => {
                const textoProduto = normalizar([p.nome, ...(p.tags || [])].join(" "));
                return estado.preferencias.termos.some(item => textoProduto.includes(item));
            });
            registrarResultados(
                encontrados,
                cafe
                    ? "Separei opções do catálogo que combinam com o café da manhã"
                    : "Separei opções práticas do catálogo para explorar como lanche"
            );
            estado.ultimaIntencao = intencao;
            return true;
        }

        return false;
    };

    const processarEntrada = (texto, mostrarUsuario = true) => {
        const original = String(texto || "").trim().slice(0, 300);
        const termo = normalizar(original);
        if (!termo) return;

        if (/^(oi|ola|olá|opa|e ai|e aí|bom dia|boa tarde|boa noite)[!. ]*$/.test(termo)) {
            if (mostrarUsuario) adicionarMensagem(original, "usuario");
            adicionarMensagem("Fala! Que bom te ver por aqui. Me conta o que você quer encontrar e eu te ajudo a encurtar o caminho.");
            adicionarAcoes([
                { texto: "Quero encontrar um produto", acao: responderAjudaEscolha },
                { texto: "Ver categorias", acao: () => {
                    adicionarMensagem("Fechado. Escolhe uma categoria e a gente começa por ela:");
                    adicionarAcoes(estado.categorias.slice(0, 6).map(c => ({ texto: c.nome, valor: c.nome })));
                }}
            ]);
            return;
        }

        if (/^(obrigado|obrigada|valeu|vlw|brigado|brigada|show|perfeito)[!. ]*$/.test(termo)) {
            if (mostrarUsuario) adicionarMensagem(original, "usuario");
            adicionarMensagem("Tamo junto! Se pintar outra dúvida ou bater curiosidade por algum produto, é só mandar.");
            return;
        }

        if (/^(ajuda|me ajuda|o que voce faz|o que você faz|como funciona)[?!. ]*$/.test(termo)) {
            if (mostrarUsuario) adicionarMensagem(original, "usuario");
            adicionarMensagem("Eu te ajudo a garimpar o catálogo: procuro produtos, filtro categorias e preferências, abro o quiz, mostro suas escolhas e te encaminho pra equipe quando precisar.");
            adicionarAcoes([
                { texto: "Encontrar produto", acao: responderAjudaEscolha },
                { texto: "Ver categorias", valor: "categorias" },
                { texto: "Minha conta", acao: () => { fecharChat(); location.href = "conta.html"; } }
            ]);
            return;
        }

        if (/^\/(?:ajuda|help|comandos)$/.test(termo.trim())) {
            if (mostrarUsuario) adicionarMensagem(original, "usuario");
            adicionarMensagem("Atalhos rápidos: /conta abre sua área, /adm abre o Admin Studio e /ajuda mostra esta lista. Fora isso, pode conversar comigo normalmente.");
            return;
        }

        if (/^\/(?:adm|admin)$/.test(termo.trim())) {
            if (mostrarUsuario) adicionarMensagem(original, "usuario");
            adicionarMensagem("Abrindo o Admin Studio local. As alterações feitas lá ficam neste navegador até serem exportadas e publicadas.");
            fecharChat();
            window.setTimeout(() => { location.href = "admin.html"; }, 120);
            return;
        }

        if (/^\/(?:conta|minha-conta)$/.test(termo.trim())) {
            if (mostrarUsuario) adicionarMensagem(original, "usuario");
            adicionarMensagem("Beleza! Vou abrir sua área local.");
            fecharChat();
            window.setTimeout(() => { location.href = "conta.html"; }, 120);
            return;
        }

        if (mostrarUsuario) adicionarMensagem(original, "usuario");
        registrarConsulta(original);

        if (executarIntencao(termo)) return;

        if (/^(oi|ola|olá|bom dia|boa tarde|boa noite|hey)\b/.test(termo)) {
            adicionarMensagem("Oi! Manda do seu jeito: pode falar um produto, uma categoria ou até algo tipo “quero um chá”. Eu organizo a busca pra você.");
            adicionarAcoes([
                { texto: "Encontrar um produto", valor: "quero encontrar um produto" },
                { texto: "Não sei o que escolher", valor: "não sei o que escolher" },
                { texto: "Minhas escolhas", valor: "minhas escolhas" }
            ]);
            return;
        }

        if (/limpar preferencias|limpar preferências|recomecar|recomeçar|nova busca/.test(termo)) {
            limparPreferencias();
            adicionarMensagem("Prontinho, zerei a busca. Bora começar de novo?");
            responderAjudaEscolha();
            return;
        }

        if (/mostrar mais|mais opcoes|mais opções|outros/.test(termo) && estado.ultimosResultados.length) {
            mostrarPaginaResultados(false);
            return;
        }

        if (/meus favoritos|favoritos|minha lista|minhas escolhas|lista de interesse/.test(termo)) {
            if (window.QualimaxConfig?.recursos?.colecoes === false) {
                adicionarMensagem("Favoritos e lista não estão ligados nesta loja no momento.");
            } else if (colecoesAtivas() && window.QualimaxColecoes?.abrirDialogo) {
                adicionarMensagem("Boa! Vou abrir o que você salvou por aqui.");
                fecharChat();
                window.setTimeout(() => window.QualimaxColecoes.abrirDialogo(), 0);
            } else {
                adicionarMensagem("Suas escolhas ficam no catálogo. Vou te levar pra lá.");
                adicionarAcoes([{ texto: "Abrir catálogo", acao: () => { fecharChat(); irCatalogo(); } }]);
            }
            return;
        }

        if (/esse produto|este produto|ultimo produto|último produto|o que eu vi/.test(termo) && estado.ultimoProdutoVisto) {
            registrarResultados([estado.ultimoProdutoVisto], "Este foi o produto mais recente que você abriu");
            return;
        }

        const produtoDireto = produtoPorNome(termo);
        if (produtoDireto) {
            explicarProduto(produtoDireto);
            return;
        }

        atualizarPreferencias(termo);
        const resultados = filtrarComPreferencias();
        const resumo = resumoPreferencias();

        if (resultados.length) {
            registrarResultados(
                resultados,
                resumo ? `Achei ${resultados.length} opções que combinam com ${resumo}` :
                    `Achei ${resultados.length} opções relacionadas ao que você pediu`
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

        adicionarMensagem("Não achei uma opção que bata bem com tudo isso. Quer que eu alivie algum filtro?");
        const acoes = [
            { texto: "Limpar preferências", valor: "limpar preferencias" }
        ];
        if (quizAtivo()) acoes.push({ texto: "Fazer o quiz", acao: () => { fecharChat(); irQuiz(); } });
        acoes.push({ texto: "Falar com a equipe", acao: () => adicionarWhatsAppNoChat() });
        adicionarAcoes(acoes);
    };

    document.addEventListener("qualimax:produto-visto", (evento) => {
        estado.ultimoProdutoVisto = evento.detail?.produto || estado.ultimoProdutoVisto;
        definirProdutoContexto(estado.ultimoProdutoVisto);
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
            adicionarMensagem("Opa, o catálogo não carregou pra mim agora. Ainda dá pra seguir pelo WhatsApp com a equipe.");
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
                adicionarMensagem("Escolhe um caminho pra começar e eu vou refinando com você:");
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
            adicionarMensagem("Pronto, conversa zerada. Me conta: o que você tá procurando agora?");
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
