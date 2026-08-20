(() => {
    "use strict";

    let produtos = [];
    let favoritos = new Set();
    let interesse = new Set();
    let ultimoFoco = null;

    const porId = (id) => produtos.find(p => Number(p.id) === Number(id));
    const nomeArquivoSeguro = (valor) => {
        const nome = String(valor || "").trim();
        return /^[A-Za-z0-9._-]+$/.test(nome) ? nome : "";
    };
    const numeroWhatsApp = () => String(window.QualimaxConfig?.contato?.whatsapp || "").replace(/\D/g, "");

    const carregarEstado = async () => {
        if (!window.QualimaxDB) return;
        favoritos = new Set((await window.QualimaxDB.getFavoritos()).map(x => Number(x.produtoId)));
        interesse = new Set((await window.QualimaxDB.getInteresse()).map(x => Number(x.produtoId)));
        atualizarContadores();
        atualizarBotoes();
        await renderizarDialogo();
        await renderizarRecentes();
    };

    const atualizarContadores = () => {
        const total = new Set([...favoritos, ...interesse]).size;
        document.querySelectorAll("[data-escolhas-count]").forEach(el => el.textContent = String(total));
        document.querySelectorAll("[data-lista-count]").forEach(el => el.textContent = String(interesse.size));
        document.querySelectorAll("[data-favoritos-count]").forEach(el => el.textContent = String(favoritos.size));
    };

    const atualizarBotoes = () => {
        document.querySelectorAll("[data-favorito-id]").forEach(btn => {
            const ativo = favoritos.has(Number(btn.dataset.favoritoId));
            btn.setAttribute("aria-pressed", String(ativo));
            btn.textContent = ativo ? "★ Favorito" : "☆ Favoritar";
        });
        document.querySelectorAll("[data-interesse-id]").forEach(btn => {
            const ativo = interesse.has(Number(btn.dataset.interesseId));
            btn.setAttribute("aria-pressed", String(ativo));
            btn.textContent = ativo ? "✓ Na minha lista" : "+ Adicionar à lista";
        });
    };

    const toggleFavorito = async (id) => {
        if (!colecoesAtivas || !window.QualimaxDB) return false;
        const ativo = await window.QualimaxDB.toggleFavorito(Number(id));
        ativo ? favoritos.add(Number(id)) : favoritos.delete(Number(id));
        atualizarContadores(); atualizarBotoes(); await renderizarDialogo();
        anunciar(ativo ? "Produto adicionado aos favoritos." : "Produto removido dos favoritos.");
        return ativo;
    };

    const toggleInteresse = async (id) => {
        if (!colecoesAtivas || !window.QualimaxDB) return false;
        const ativo = await window.QualimaxDB.toggleInteresse(Number(id));
        ativo ? interesse.add(Number(id)) : interesse.delete(Number(id));
        atualizarContadores(); atualizarBotoes(); await renderizarDialogo();
        anunciar(ativo ? "Produto adicionado à sua lista de interesse." : "Produto removido da sua lista de interesse.");
        return ativo;
    };

    const anunciar = (texto) => {
        const status = document.querySelector("[data-escolhas-status]");
        if (status) status.textContent = texto;
    };

    const criarItem = (produto, tipo) => {
        const article = document.createElement("article");
        article.className = "escolha-item";
        const img = document.createElement("img");
        const arquivoImagem = nomeArquivoSeguro(produto.imagem);
        if (arquivoImagem) img.src = `img/thumbs/${arquivoImagem}`;
        img.alt = ""; img.loading = "lazy"; img.width = 72; img.height = 90;
        img.addEventListener("error", () => img.remove());
        const box = document.createElement("div");
        const strong = document.createElement("strong"); strong.textContent = produto.nome;
        const p = document.createElement("p"); p.textContent = produto.copy || produto.descricao || "";
        const acoes = document.createElement("div"); acoes.className = "escolha-item-acoes";
        const abrir = document.createElement("button"); abrir.type = "button"; abrir.textContent = "Ver detalhes";
        abrir.addEventListener("click", () => { fecharDialogo(); window.QualimaxProdutos?.abrirModal?.(produto); });
        const remover = document.createElement("button"); remover.type = "button"; remover.textContent = "Remover";
        remover.addEventListener("click", () => tipo === "favorito" ? toggleFavorito(produto.id) : toggleInteresse(produto.id));
        acoes.append(abrir, remover); box.append(strong, p, acoes);
        if (arquivoImagem) article.append(img);
        article.append(box);
        return article;
    };

    const renderizarDialogo = async () => {
        const favArea = document.querySelector("[data-favoritos-lista]");
        const listArea = document.querySelector("[data-interesse-lista]");
        if (favArea) {
            const itens = [...favoritos].map(porId).filter(Boolean);
            favArea.replaceChildren(...(itens.length ? itens.map(p => criarItem(p, "favorito")) : [Object.assign(document.createElement("p"), { textContent: "Você ainda não favoritou produtos." })]));
        }
        if (listArea) {
            const itens = [...interesse].map(porId).filter(Boolean);
            listArea.replaceChildren(...(itens.length ? itens.map(p => criarItem(p, "interesse")) : [Object.assign(document.createElement("p"), { textContent: "Sua lista de interesse está vazia." })]));
        }
        const enviar = document.querySelector("[data-lista-whatsapp]");
        if (enviar) enviar.disabled = interesse.size === 0 || !numeroWhatsApp();
    };

    const renderizarRecentes = async () => {
        const secao = document.querySelector("[data-recentes-secao]");
        const grade = document.querySelector("[data-recentes-grid]");
        if (!secao || !grade || !window.QualimaxDB) return;
        const ids = (await window.QualimaxDB.getHistorico()).sort((a,b) => (b.vistoEm || 0) - (a.vistoEm || 0)).slice(0,4).map(x => Number(x.produtoId));
        const itens = ids.map(porId).filter(Boolean);
        secao.hidden = !itens.length;
        grade.replaceChildren(...itens.map(produto => {
            const article = document.createElement("article"); article.className = "recente-card";
            const img = document.createElement("img");
            const arquivoImagem = nomeArquivoSeguro(produto.imagem);
            if (arquivoImagem) img.src = `img/thumbs/${arquivoImagem}`;
            img.alt = ""; img.loading = "lazy"; img.width=116; img.height=144;
            img.addEventListener("error", () => img.remove());
            const box = document.createElement("div");
            const strong = document.createElement("strong"); strong.textContent = produto.nome;
            const btn = document.createElement("button"); btn.type="button"; btn.textContent="Ver novamente"; btn.addEventListener("click", () => window.QualimaxProdutos?.abrirModal?.(produto));
            box.append(strong, btn);
            if (arquivoImagem) article.append(img);
            article.append(box);
            return article;
        }));
    };

    const registrarVisualizacao = async (produto) => {
        if (!colecoesAtivas || !produto || !window.QualimaxDB) return;
        await window.QualimaxDB.addHistorico(Number(produto.id));
        await renderizarRecentes();
    };

    const abrirDialogo = () => {
        if (!colecoesAtivas) return;
        const modal = document.querySelector("[data-escolhas-modal]"); if (!modal) return;
        ultimoFoco = document.activeElement; modal.hidden = false; modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-aberto");
        modal.querySelector("[data-escolhas-fechar]")?.focus();
    };
    const fecharDialogo = () => {
        const modal = document.querySelector("[data-escolhas-modal]"); if (!modal) return;
        modal.hidden = true; modal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-aberto"); ultimoFoco?.focus?.(); ultimoFoco = null;
    };

    const enviarLista = () => {
        if (!interesse.size) return;
        location.href = "atendimento.html?origem=conta&assunto=Fazer%20um%20pedido";
    };

    document.addEventListener("qualimax:catalog-ready", async (e) => { produtos = e.detail?.produtos || []; await carregarEstado(); });
    document.addEventListener("qualimax:produtos-renderizados", atualizarBotoes);
    document.addEventListener("qualimax:colecoes-refresh", atualizarBotoes);
    document.addEventListener("qualimax:produto-visto", async (e) => registrarVisualizacao(e.detail?.produto));
    document.addEventListener("click", (e) => {
        if (!colecoesAtivas) return;
        const fav = e.target.closest?.("[data-favorito-id]"); if (fav) { toggleFavorito(fav.dataset.favoritoId); return; }
        const lista = e.target.closest?.("[data-interesse-id]"); if (lista) { toggleInteresse(lista.dataset.interesseId); return; }
        if (e.target.closest?.("[data-escolhas-abrir]")) abrirDialogo();
        if (e.target.closest?.("[data-escolhas-fechar]")) fecharDialogo();
    });
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("[data-lista-whatsapp]")?.addEventListener("click", enviarLista);
        document.querySelector("[data-lista-limpar]")?.addEventListener("click", async () => { await window.QualimaxDB?.limparInteresse?.(); interesse.clear(); atualizarContadores(); atualizarBotoes(); await renderizarDialogo(); anunciar("Lista de interesse limpa."); });
        document.querySelector("[data-favoritos-limpar]")?.addEventListener("click", async () => { await window.QualimaxDB?.limparFavoritos?.(); favoritos.clear(); atualizarContadores(); atualizarBotoes(); await renderizarDialogo(); anunciar("Favoritos limpos."); });
        document.querySelector("[data-escolhas-modal]")?.addEventListener("click", e => { if (e.target === e.currentTarget) fecharDialogo(); });
        document.addEventListener("keydown", e => {
            const m=document.querySelector("[data-escolhas-modal]");
            if (!m || m.hidden) return;
            if (e.key === "Escape") { fecharDialogo(); return; }
            if (e.key !== "Tab") return;
            const focaveis = [...m.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && !el.hidden);
            if (!focaveis.length) return;
            const primeiro=focaveis[0], ultimo=focaveis[focaveis.length-1];
            if (e.shiftKey && document.activeElement===primeiro) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement===ultimo) { e.preventDefault(); primeiro.focus(); }
        });
    });

    window.QualimaxColecoes = {
        toggleFavorito,
        toggleInteresse,
        registrarVisualizacao,
        abrirDialogo,
        getFavoritos: () => colecoesAtivas ? [...favoritos] : [],
        getInteresse: () => colecoesAtivas ? [...interesse] : [],
        ativa: () => colecoesAtivas
    };
})();
