(() => {
    "use strict";

    const copiarLink = async (texto) => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(texto);
            return true;
        }
        const area = document.createElement("textarea");
        area.value = texto;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        area.style.pointerEvents = "none";
        document.body.append(area);
        area.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch { ok = false; }
        area.remove();
        if (!ok) throw new Error("Falha ao copiar link.");
        return true;
    };

    const normalizar = (valor) => String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const nomeArquivoSeguro = (valor) => {
        const nome = String(valor || "").trim();
        return /^[A-Za-z0-9._-]+$/.test(nome) ? nome : "";
    };

    const slugSeguro = (valor) => {
        const slug = String(valor || "").trim();
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : "";
    };

    const pontuarRelacionado = (base, outro) => {
        if (!base || !outro || Number(base.id) === Number(outro.id)) return -1;
        let pontos = base.categoria === outro.categoria ? 5 : 0;
        const tags = new Set((base.tags || []).map(normalizar));
        (outro.tags || []).forEach(tag => { if (tags.has(normalizar(tag))) pontos += 2; });
        if (base.tipo && base.tipo === outro.tipo) pontos += 1;
        if (base.vegana === outro.vegana) pontos += 0.5;
        if (base.sem_gluten === outro.sem_gluten) pontos += 0.5;
        return pontos;
    };

    const criarCardRelacionado = (produto) => {
        const artigo = document.createElement("article");
        artigo.className = "produto-relacionado-pagina-card";

        const link = document.createElement("a");
        const slug = slugSeguro(produto.slug);
        link.href = slug ? `${slug}.html` : "../catalogo.html";
        link.className = "produto-relacionado-pagina-link";

        const img = document.createElement("img");
        const arquivoImagem = nomeArquivoSeguro(produto.imagem);
        if (arquivoImagem) img.src = `../img/thumbs/${arquivoImagem}`;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.width = 232;
        img.height = 288;
        img.addEventListener("error", () => img.remove());

        const box = document.createElement("div");
        const nome = document.createElement("strong");
        nome.textContent = produto.nome;
        const copy = document.createElement("span");
        copy.textContent = produto.copy || produto.descricao || "Conheça esta opção do catálogo.";
        box.append(nome, copy);
        if (arquivoImagem) link.append(img);
        link.append(box);
        artigo.append(link);
        return artigo;
    };

    const renderizarRelacionados = (produto, catalogo) => {
        const secao = document.querySelector("[data-produto-relacionados]");
        const grid = document.querySelector("[data-relacionados-grid]");
        if (!secao || !grid || !produto) return;

        const itens = catalogo
            .map(item => ({ item, pontos: pontuarRelacionado(produto, item) }))
            .filter(x => x.pontos > 0)
            .sort((a, b) => b.pontos - a.pontos || Number(b.item.destaque) - Number(a.item.destaque))
            .slice(0, 4)
            .map(x => x.item);

        secao.hidden = itens.length === 0;
        grid.replaceChildren(...itens.map(criarCardRelacionado));
    };

    const renderizarNavegacao = (produto, catalogo) => {
        const nav = document.querySelector("[data-produto-navegacao]");
        if (!nav || !produto || !catalogo.length) return;

        const indice = catalogo.findIndex(x => Number(x.id) === Number(produto.id));
        if (indice < 0) return;

        const anterior = indice > 0 ? catalogo[indice - 1] : null;
        const proximo = indice < catalogo.length - 1 ? catalogo[indice + 1] : null;
        const elementos = [];

        if (anterior && slugSeguro(anterior.slug)) {
            const a = document.createElement("a");
            a.href = `${anterior.slug}.html`;
            a.className = "produto-nav-link produto-nav-anterior";
            a.innerHTML = `<span aria-hidden="true">←</span><span><small>Produto anterior</small><strong></strong></span>`;
            a.querySelector("strong").textContent = anterior.nome;
            elementos.push(a);
        }

        const catalogoLink = document.createElement("a");
        catalogoLink.href = "../catalogo.html#produtos";
        catalogoLink.className = "produto-nav-catalogo";
        catalogoLink.textContent = "Ver catálogo completo";
        elementos.push(catalogoLink);

        if (proximo && slugSeguro(proximo.slug)) {
            const a = document.createElement("a");
            a.href = `${proximo.slug}.html`;
            a.className = "produto-nav-link produto-nav-proximo";
            a.innerHTML = `<span><small>Próximo produto</small><strong></strong></span><span aria-hidden="true">→</span>`;
            a.querySelector("strong").textContent = proximo.nome;
            elementos.push(a);
        }

        nav.replaceChildren(...elementos);
    };

    document.addEventListener("DOMContentLoaded", async () => {
        const id = Number(document.body.dataset.produtoId || 0);

        try {
            const salvo = sessionStorage.getItem("qualimax-catalogo-url") || "";
            if (/^catalogo\.html(?:\?[^#]*)?#produtos$/.test(salvo)) {
                const destino = `../${salvo}`;
                document.querySelector("[data-retomar-catalogo]")?.setAttribute("href", destino);
                const link = document.querySelector("[data-retomar-catalogo]");
                if (link) link.textContent = "Voltar aos meus resultados";
            } else if (salvo) {
                sessionStorage.removeItem("qualimax-catalogo-url");
            }
        } catch {}

        
        let config = {}, produto = null, catalogo = [];
        const status = document.querySelector("[data-share-status]");

        try {
            const [c, p] = await Promise.all([
                fetch("../data/config.json", { cache: "no-cache" }),
                fetch("../data/produtos.json")
            ]);
            if (c.ok) config = await c.json();
            if (p.ok) {
                catalogo = (await p.json()).produtos || [];
                produto = catalogo.find(x => Number(x.id) === id) || null;
            }
        } catch (erro) {
            console.error("Produto:", erro);
        }

        const nomeLoja = config.empresa?.nome || "Loja";
        document.querySelectorAll(".logo-texto").forEach(el => el.textContent = nomeLoja);
        document.querySelectorAll(".logo-imagem").forEach(img => {
            if (config.marca?.logoImagem && !config.marca.logoImagem.includes("..")) img.src = `../${config.marca.logoImagem}`;
            img.alt = nomeLoja;
        });
        if (produto) document.title = `${produto.nome} | ${nomeLoja}`;

        const numero = String(config.contato?.whatsapp || "").replace(/\D/g, "");
        const link = document.querySelector("[data-produto-whatsapp]");
        if (link && numero && produto) {
            const slug = slugSeguro(produto.slug);
            const params = new URLSearchParams({
                origem: "produto",
                assunto: "Consultar disponibilidade"
            });
            if (slug) params.set("produto", slug);
            link.href = `../atendimento.html?${params.toString()}`;
            link.removeAttribute("target");
            link.removeAttribute("rel");
            link.removeAttribute("aria-disabled");
            link.textContent = "Preparar consulta deste produto";
        } else if (link) {
            link.removeAttribute("href");
            link.removeAttribute("target");
            link.setAttribute("aria-disabled", "true");
            link.classList.add("link-indisponivel");
            link.textContent = "Atendimento não disponível";
        }

        if (produto) {
            renderizarRelacionados(produto, catalogo);
            renderizarNavegacao(produto, catalogo);
        }

        // Integra a página individual aos mesmos favoritos/lista do catálogo.
        const acoes = document.querySelector(".produto-pagina-acoes");
        if (acoes && produto && window.QualimaxDB && config.recursos?.colecoes !== false) {
            await window.QualimaxDB.init?.();
            await window.QualimaxDB.seedProdutos?.(catalogo);

            const fav = document.createElement("button");
            fav.type = "button";
            fav.className = "botao botao-secundario";
            fav.dataset.produtoPaginaFavorito = String(produto.id);

            const lista = document.createElement("button");
            lista.type = "button";
            lista.className = "botao botao-secundario";
            lista.dataset.produtoPaginaInteresse = String(produto.id);

            const atualizarEstados = async () => {
                const [isFav, isLista] = await Promise.all([
                    window.QualimaxDB.isFavorito(produto.id),
                    window.QualimaxDB.isInteresse(produto.id)
                ]);
                fav.setAttribute("aria-pressed", String(isFav));
                fav.textContent = isFav ? "★ Favorito" : "☆ Favoritar";
                lista.setAttribute("aria-pressed", String(isLista));
                lista.textContent = isLista ? "✓ Na minha lista" : "+ Adicionar à lista";
            };

            fav.addEventListener("click", async () => {
                const ativo = await window.QualimaxDB.toggleFavorito(produto.id);
                if (status) status.textContent = ativo ? "Produto adicionado aos favoritos." : "Produto removido dos favoritos.";
                await atualizarEstados();
            });

            lista.addEventListener("click", async () => {
                const ativo = await window.QualimaxDB.toggleInteresse(produto.id);
                if (status) status.textContent = ativo ? "Produto adicionado à lista de interesse." : "Produto removido da lista de interesse.";
                await atualizarEstados();
            });

            const compartilhar = document.querySelector("[data-compartilhar]");
            if (compartilhar) acoes.insertBefore(fav, compartilhar);
            else acoes.append(fav);
            if (compartilhar) acoes.insertBefore(lista, compartilhar);
            else acoes.append(lista);

            await atualizarEstados();
            document.addEventListener("qualimax:db-sync", (evento) => {
                const tipo = String(evento.detail?.tipo || "");
                if (tipo.startsWith("favorito") || tipo.startsWith("interesse")) atualizarEstados();
            });
            await window.QualimaxDB.addHistorico?.(produto.id);
        }

        document.querySelector("[data-compartilhar]")?.addEventListener("click", async () => {
            const dados = {
                title: produto?.nome || document.title,
                text: produto?.copy || "Confira este produto",
                url: location.href
            };
            if (status) status.textContent = "";

            try {
                if (navigator.share) {
                    await navigator.share(dados);
                    if (status) status.textContent = "Opções de compartilhamento abertas.";
                } else {
                    await copiarLink(location.href);
                    if (status) status.textContent = "Link do produto copiado.";
                }
            } catch (erro) {
                if (erro?.name === "AbortError") return;
                try {
                    await copiarLink(location.href);
                    if (status) status.textContent = "Link do produto copiado.";
                } catch {
                    if (status) status.textContent = "Não foi possível compartilhar ou copiar o link neste navegador.";
                }
            }
        });
    });
})();
