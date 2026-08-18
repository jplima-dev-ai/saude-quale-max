(() => {
    "use strict";

    const estado = {
        produtos: [],
        categorias: [],
        filtroCategoria: "",
        filtroTipo: "",
        filtroCaracteristica: "",
        busca: ""
    };

    const normalizar = (valor) => String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const categoriaNome = (id) => {
        const categoria = estado.categorias.find((item) => item.id === id);
        return categoria?.nome || id || "Sem categoria";
    };

    const construirMensagem = (produto) => {
        const nomeLoja = window.QualemaxConfig?.empresa?.nome || "a loja";
        return encodeURIComponent(
            `Olá! Vi o produto ${produto.nome} no site da ${nomeLoja} e gostaria de consultar disponibilidade e detalhes.`
        );
    };

    const numeroWhatsApp = () => String(window.QualemaxConfig?.contato?.whatsapp || "").replace(/\D/g, "");
    const linkWhatsApp = (produto) => `https://wa.me/${numeroWhatsApp()}?text=${construirMensagem(produto)}`;
    const imagemMiniatura = (produto) => `img/thumbs/${produto.imagem}`;

    const criarBotaoFavorito = (produto) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "produto-acao-secundaria";
        botao.dataset.favoritoId = produto.id;
        botao.setAttribute("aria-pressed", "false");
        botao.textContent = "☆ Favoritar";
        return botao;
    };

    const criarBotaoInteresse = (produto) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "produto-acao-secundaria";
        botao.dataset.interesseId = produto.id;
        botao.setAttribute("aria-pressed", "false");
        botao.textContent = "+ Adicionar à lista";
        return botao;
    };

    const pontuarRelacionado = (base, outro) => {
        if (base.id === outro.id) return -1;
        let pontos = base.categoria === outro.categoria ? 5 : 0;
        const tags = new Set((base.tags || []).map(normalizar));
        (outro.tags || []).forEach(tag => { if (tags.has(normalizar(tag))) pontos += 2; });
        if (base.tipo && base.tipo === outro.tipo) pontos += 1;
        if (base.vegana === outro.vegana) pontos += 0.5;
        if (base.sem_gluten === outro.sem_gluten) pontos += 0.5;
        return pontos;
    };

    const relacionados = (produto, limite = 3) => estado.produtos
        .map(item => ({ item, pontos: pontuarRelacionado(produto, item) }))
        .filter(x => x.pontos > 0)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, limite)
        .map(x => x.item);

    const criarCard = (produto) => {
        const artigo = document.createElement("article");
        artigo.className = "produto-card produto-card-dinamico";
        if (produto.destaque) artigo.classList.add("produto-card-destaque");

        const imagem = document.createElement("img");
        imagem.src = imagemMiniatura(produto);
        imagem.alt = `${produto.nome} — ${categoriaNome(produto.categoria)}.`;
        imagem.loading = "lazy";
        imagem.decoding = "async";
        imagem.width = 464;
        imagem.height = 576;
        imagem.addEventListener("error", () => {
            imagem.hidden = true;
            imagemWrap.classList.add("imagem-indisponivel");
            imagemWrap.setAttribute("aria-label", `Imagem de ${produto.nome} indisponível.`);
        });

        const imagemWrap = document.createElement("div");
        imagemWrap.className = "produto-imagem";
        imagemWrap.append(imagem);

        const conteudo = document.createElement("div");
        conteudo.className = "produto-conteudo";

        const categoria = document.createElement("span");
        categoria.className = "produto-categoria";
        categoria.textContent = categoriaNome(produto.categoria);

        const titulo = document.createElement("h3");
        titulo.textContent = produto.nome;

        const descricao = document.createElement("p");
        descricao.textContent = produto.copy || produto.descricao || "Consulte a equipe para conhecer os detalhes deste produto.";

        const acoes = document.createElement("div");
        acoes.className = "produto-acoes";

        const detalhes = document.createElement("button");
        detalhes.type = "button";
        detalhes.className = "botao botao-produto botao-detalhes";
        detalhes.textContent = produto.cta || "Quero saber mais";
        detalhes.addEventListener("click", () => abrirModal(produto));

        acoes.append(detalhes);
        const acoesSecundarias = document.createElement("div");
        acoesSecundarias.className = "produto-acoes-secundarias";
        acoesSecundarias.append(criarBotaoFavorito(produto), criarBotaoInteresse(produto));
        acoes.append(acoesSecundarias);
        if (numeroWhatsApp()) {
            const whatsapp = document.createElement("a");
            whatsapp.className = "link-destaque";
            whatsapp.target = "_blank";
            whatsapp.rel = "noopener noreferrer";
            whatsapp.href = linkWhatsApp(produto);
            whatsapp.textContent = "Consultar pelo WhatsApp →";
            whatsapp.setAttribute("aria-label", `Consultar ${produto.nome} pelo WhatsApp, abre em nova aba`);
            acoes.append(whatsapp);
        }
        if (produto.destaque) {
            const selo = document.createElement("span");
            selo.className = "produto-selo-destaque";
            selo.textContent = "Destaque da loja";
            imagemWrap.append(selo);
        }
        conteudo.append(categoria, titulo, descricao, acoes);
        artigo.append(imagemWrap, conteudo);
        return artigo;
    };

    const renderizarDestaques = () => {
        const grade = document.querySelector("[data-destaques-grid]");
        if (!grade) return;
        const destaques = estado.produtos.filter((produto) => produto.destaque).slice(0, 8);
        grade.replaceChildren(...destaques.map(criarCard));
    };

    const renderizar = () => {
        const grade = document.querySelector("[data-produtos-grid]");
        const contador = document.querySelector("[data-produtos-contador]");
        const vazio = document.querySelector("[data-produtos-vazio]");
        if (!grade) return;

        const termo = normalizar(estado.busca).trim();
        const termosBusca = termo.split(/\s+/).filter(Boolean);
        const filtrados = estado.produtos.filter((produto) => {
            const texto = normalizar([
                produto.nome,
                produto.categoria,
                categoriaNome(produto.categoria),
                produto.tipo,
                produto.copy,
                produto.descricao,
                ...(produto.tags || []),
                ...(produto.beneficios || [])
            ].join(" "));

            const correspondeBusca = !termosBusca.length || termosBusca.every((item) => texto.includes(item));
            const correspondeCategoria = !estado.filtroCategoria || produto.categoria === estado.filtroCategoria;
            const correspondeTipo = !estado.filtroTipo || produto.tipo === estado.filtroTipo;
            const correspondeCaracteristica = !estado.filtroCaracteristica ||
                (estado.filtroCaracteristica === "vegana" && produto.vegana === true) ||
                (estado.filtroCaracteristica === "sem-gluten" && produto.sem_gluten === true);

            return correspondeBusca && correspondeCategoria && correspondeTipo && correspondeCaracteristica;
        });

        grade.replaceChildren(...filtrados.map(criarCard));
        if (contador) {
            const termoInformado = estado.busca.trim();
            const contexto = termoInformado ? ` para “${termoInformado}”` : "";
            contador.textContent = `${filtrados.length} ${filtrados.length === 1 ? "produto encontrado" : "produtos encontrados"}${contexto}.`;
        }
        if (vazio) {
            vazio.hidden = filtrados.length !== 0;
            const textoVazio = vazio.querySelector("[data-produtos-vazio-texto]");
            if (!filtrados.length && textoVazio) {
                const filtrosAtivos = [estado.busca, estado.filtroCategoria, estado.filtroTipo, estado.filtroCaracteristica].some(Boolean);
                textoVazio.textContent = filtrosAtivos
                    ? "Nenhum produto corresponde aos critérios informados. Você pode limpar os filtros, perguntar ao assistente ou falar com a equipe."
                    : "Nenhum produto está disponível para exibição neste momento. Fale com a equipe para receber ajuda.";
            }
        }
        document.dispatchEvent(new CustomEvent("qualemax:produtos-renderizados"));
    };

    const preencherFiltros = () => {
        const categoria = document.querySelector("[data-filtro-categoria]");
        const tipo = document.querySelector("[data-filtro-tipo]");
        if (categoria) {
            estado.categorias.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = item.nome;
                categoria.append(option);
            });
        }
        if (tipo) {
            const tipos = [...new Set(estado.produtos.map((item) => item.tipo).filter(Boolean))].sort();
            tipos.forEach((item) => {
                const option = document.createElement("option");
                option.value = item;
                option.textContent = item.charAt(0).toUpperCase() + item.slice(1);
                tipo.append(option);
            });
        }
    };

    let ultimoFoco = null;
    const abrirModal = (produto) => {
        const modal = document.querySelector("[data-produto-modal]");
        const titulo = document.querySelector("[data-modal-titulo]");
        const conteudo = document.querySelector("[data-modal-conteudo]");
        if (!modal || !titulo || !conteudo) return;

        if (modal.hidden) ultimoFoco = document.activeElement;
        titulo.textContent = produto.nome;
        conteudo.replaceChildren();

        const layout = document.createElement("div");
        layout.className = "produto-modal-layout";

        const imagemWrap = document.createElement("div");
        imagemWrap.className = "produto-modal-imagem";
        const imagem = document.createElement("img");
        imagem.src = `img/${produto.imagem}`;
        imagem.alt = `${produto.nome} — ${categoriaNome(produto.categoria)}.`;
        imagem.decoding = "async";
        imagem.width = 928;
        imagem.height = 1152;
        imagem.addEventListener("error", () => {
            imagemWrap.hidden = true;
        });
        imagemWrap.append(imagem);

        const informacoes = document.createElement("div");
        informacoes.className = "produto-modal-informacoes";

        const categoria = document.createElement("p");
        categoria.className = "produto-modal-categoria";
        categoria.textContent = categoriaNome(produto.categoria);

        const descricao = document.createElement("p");
        descricao.textContent = produto.copy || produto.descricao || "Descrição não cadastrada.";

        const lista = document.createElement("ul");
        lista.className = "produto-modal-lista";
        const caracteristicas = [
            produto.tipo ? `Formato: ${produto.tipo}` : "",
            produto.vegana ? "Produto cadastrado como vegano" : "",
            produto.sem_gluten ? "Produto cadastrado como sem glúten" : ""
        ].filter(Boolean);
        (produto.beneficios || []).forEach((item) => caracteristicas.push(`Característica: ${item}`));
        caracteristicas.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            lista.append(li);
        });
        const observacao = document.createElement("p");
        observacao.className = "produto-modal-aviso";
        observacao.textContent = "Disponibilidade, valor atual e informações comerciais devem ser confirmados com a equipe.";

        informacoes.append(categoria, descricao);
        if (caracteristicas.length) informacoes.append(lista);
        informacoes.append(observacao);

        const acoesPersistentes = document.createElement("div");
        acoesPersistentes.className = "produto-modal-acoes-secundarias";
        acoesPersistentes.append(criarBotaoFavorito(produto), criarBotaoInteresse(produto));
        informacoes.append(acoesPersistentes);

        if (numeroWhatsApp()) {
            const link = document.createElement("a");
            link.className = "botao botao-principal";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.href = linkWhatsApp(produto);
            link.textContent = "Consultar pelo WhatsApp";
            link.setAttribute("aria-label", `Consultar ${produto.nome} pelo WhatsApp, abre em nova aba`);
            informacoes.append(link);
        }

        if (produto.slug) {
            const paginaAcoes = document.createElement("div");
            paginaAcoes.className = "produto-pagina-acoes-inline";
            const pagina = document.createElement("a");
            pagina.className = "link-destaque";
            pagina.href = `produto/${produto.slug}.html`;
            pagina.textContent = "Abrir página do produto →";
            const compartilhar = document.createElement("button");
            compartilhar.type = "button";
            compartilhar.className = "produto-compartilhar";
            compartilhar.textContent = "Compartilhar";
            compartilhar.addEventListener("click", async () => {
                const url = new URL(`produto/${produto.slug}.html`, window.location.href).href;
                try {
                    if (navigator.share) await navigator.share({ title: produto.nome, text: produto.copy || produto.descricao || "", url });
                    else { await navigator.clipboard.writeText(url); compartilhar.textContent = "Link copiado"; window.setTimeout(() => compartilhar.textContent = "Compartilhar", 1800); }
                } catch {}
            });
            paginaAcoes.append(pagina, compartilhar);
            informacoes.append(paginaAcoes);
        }
        layout.append(imagemWrap, informacoes);
        conteudo.append(layout);

        const itensRelacionados = relacionados(produto);
        if (itensRelacionados.length) {
            const secaoRelacionados = document.createElement("section");
            secaoRelacionados.className = "produto-relacionados";
            const h3 = document.createElement("h3");
            h3.textContent = "Você também pode explorar";
            const grid = document.createElement("div");
            grid.className = "produto-relacionados-grid";
            itensRelacionados.forEach(item => {
                const botao = document.createElement("button");
                botao.type = "button";
                botao.className = "produto-relacionado";
                const img = document.createElement("img");
                img.src = imagemMiniatura(item); img.alt = ""; img.loading = "lazy"; img.width = 80; img.height = 100;
                img.addEventListener("error", () => img.remove());
                const span = document.createElement("span"); span.textContent = item.nome;
                botao.append(img, span);
                botao.addEventListener("click", () => abrirModal(item));
                grid.append(botao);
            });
            secaoRelacionados.append(h3, grid);
            conteudo.append(secaoRelacionados);
        }

        document.dispatchEvent(new CustomEvent("qualemax:produto-visto", { detail: { produto } }));
        modal.hidden = false;
        document.body.classList.add("modal-aberto");
        modal.setAttribute("aria-hidden", "false");
        modal.querySelector("[data-modal-fechar]")?.focus();
    };

    const fecharModal = () => {
        const modal = document.querySelector("[data-produto-modal]");
        if (!modal) return;
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-aberto");
        ultimoFoco?.focus?.();
        ultimoFoco = null;
    };

    window.QualemaxProdutos = { abrirModal, fecharModal, obterTodos: () => [...estado.produtos], relacionados };

    document.addEventListener("DOMContentLoaded", async () => {
        if (!window.QualemaxConfig) {
            await new Promise((resolve) => document.addEventListener("qualemax:config-ready", resolve, { once: true }));
        }
        try {
            const [produtosResposta, categoriasResposta] = await Promise.all([
                fetch("./data/produtos.json"),
                fetch("./data/categorias.json")
            ]);
            if (!produtosResposta.ok || !categoriasResposta.ok) throw new Error("Falha ao carregar catálogo.");
            const produtosDados = await produtosResposta.json();
            const categoriasDados = await categoriasResposta.json();
            estado.produtos = Array.isArray(produtosDados.produtos) ? produtosDados.produtos : [];
            estado.categorias = Array.isArray(categoriasDados.categorias) ? categoriasDados.categorias : [];
            await window.QualemaxDB?.seedProdutos?.(estado.produtos);
            const sugestoes = document.querySelector("[data-sugestoes-produtos]");
            if (sugestoes) {
                const valores = new Set();
                estado.produtos.forEach(produto => { valores.add(produto.nome); (produto.tags || []).forEach(tag => valores.add(tag)); });
                estado.categorias.forEach(categoria => valores.add(categoria.nome));
                sugestoes.replaceChildren(...[...valores].sort((a,b) => String(a).localeCompare(String(b), "pt-BR")).map(valor => {
                    const option = document.createElement("option"); option.value = valor; return option;
                }));
            }
            preencherFiltros();
            const categoriaPendente = document.documentElement.dataset.categoriaPendente || "";
            if (categoriaPendente && estado.categorias.some((item) => item.id === categoriaPendente)) {
                estado.filtroCategoria = categoriaPendente;
                const selectCategoria = document.querySelector("[data-filtro-categoria]");
                if (selectCategoria) selectCategoria.value = categoriaPendente;
                delete document.documentElement.dataset.categoriaPendente;
            }
            renderizar();
            renderizarDestaques();
            document.dispatchEvent(new CustomEvent("qualemax:catalog-ready", { detail: { produtos: estado.produtos, categorias: estado.categorias } }));
            window.setTimeout(() => document.dispatchEvent(new CustomEvent("qualemax:colecoes-refresh")), 0);
        } catch (erro) {
            console.error(erro);
            const vazio = document.querySelector("[data-produtos-vazio]");
            if (vazio) {
                vazio.hidden = false;
                vazio.textContent = numeroWhatsApp() ? "Não foi possível carregar o catálogo agora. Fale com a equipe pelo WhatsApp para consultar os produtos." : "Não foi possível carregar o catálogo agora. Fale com a equipe pelos canais de contato disponíveis.";
            }
        }

        document.querySelector("[data-busca-produtos]")?.addEventListener("input", (evento) => {
            estado.busca = evento.target.value;
            renderizar();
        });
        document.querySelector("[data-filtro-categoria]")?.addEventListener("change", (evento) => {
            estado.filtroCategoria = evento.target.value;
            renderizar();
        });
        document.querySelector("[data-filtro-tipo]")?.addEventListener("change", (evento) => {
            estado.filtroTipo = evento.target.value;
            renderizar();
        });
        document.querySelector("[data-filtro-caracteristica]")?.addEventListener("change", (evento) => {
            estado.filtroCaracteristica = evento.target.value;
            renderizar();
        });
        const limparFiltros = () => {
            estado.busca = "";
            estado.filtroCategoria = "";
            estado.filtroTipo = "";
            estado.filtroCaracteristica = "";
            const busca = document.querySelector("[data-busca-produtos]");
            const categoria = document.querySelector("[data-filtro-categoria]");
            const tipo = document.querySelector("[data-filtro-tipo]");
            const caracteristica = document.querySelector("[data-filtro-caracteristica]");
            if (busca) busca.value = "";
            if (categoria) categoria.value = "";
            if (tipo) tipo.value = "";
            if (caracteristica) caracteristica.value = "";
            renderizar();
            busca?.focus();
        };
        document.querySelector("[data-limpar-filtros]")?.addEventListener("click", limparFiltros);
        document.querySelector("[data-vazio-limpar]")?.addEventListener("click", limparFiltros);

        document.querySelectorAll("[data-modal-fechar]").forEach((botao) => botao.addEventListener("click", fecharModal));
        document.querySelector("[data-produto-modal]")?.addEventListener("click", (evento) => {
            if (evento.target === evento.currentTarget) fecharModal();
        });
        document.addEventListener("keydown", (evento) => {
            const modal = document.querySelector("[data-produto-modal]");
            if (!modal || modal.hidden) return;
            if (evento.key === "Escape") { fecharModal(); return; }
            if (evento.key === "Tab") {
                const focaveis = [...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hasAttribute("disabled"));
                if (!focaveis.length) return;
                const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
                if (evento.shiftKey && document.activeElement === primeiro) { evento.preventDefault(); ultimo.focus(); }
                else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primeiro.focus(); }
            }
        });
    });
})();
