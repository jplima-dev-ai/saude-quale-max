(() => {
    "use strict";

    let produtos = [];
    let favoritos = new Set();
    let interesse = new Set();
    let ultimoFoco = null;

    const porId = (id) => produtos.find(p => Number(p.id) === Number(id));
    const numeroWhatsApp = () => String(window.QualemaxConfig?.contato?.whatsapp || "").replace(/\D/g, "");

    const carregarEstado = async () => {
        if (!window.QualemaxDB) return;
        favoritos = new Set((await window.QualemaxDB.getFavoritos()).map(x => Number(x.produtoId)));
        interesse = new Set((await window.QualemaxDB.getInteresse()).map(x => Number(x.produtoId)));
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
        if (!window.QualemaxDB) return false;
        const ativo = await window.QualemaxDB.toggleFavorito(Number(id));
        ativo ? favoritos.add(Number(id)) : favoritos.delete(Number(id));
        atualizarContadores(); atualizarBotoes(); await renderizarDialogo();
        anunciar(ativo ? "Produto adicionado aos favoritos." : "Produto removido dos favoritos.");
        return ativo;
    };

    const toggleInteresse = async (id) => {
        if (!window.QualemaxDB) return false;
        const ativo = await window.QualemaxDB.toggleInteresse(Number(id));
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
        img.src = `img/thumbs/${produto.imagem}`; img.alt = ""; img.loading = "lazy"; img.width = 72; img.height = 90;
        img.addEventListener("error", () => img.remove());
        const box = document.createElement("div");
        const strong = document.createElement("strong"); strong.textContent = produto.nome;
        const p = document.createElement("p"); p.textContent = produto.copy || produto.descricao || "";
        const acoes = document.createElement("div"); acoes.className = "escolha-item-acoes";
        const abrir = document.createElement("button"); abrir.type = "button"; abrir.textContent = "Ver detalhes";
        abrir.addEventListener("click", () => { fecharDialogo(); window.QualemaxProdutos?.abrirModal?.(produto); });
        const remover = document.createElement("button"); remover.type = "button"; remover.textContent = "Remover";
        remover.addEventListener("click", () => tipo === "favorito" ? toggleFavorito(produto.id) : toggleInteresse(produto.id));
        acoes.append(abrir, remover); box.append(strong, p, acoes); article.append(img, box); return article;
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
        if (!secao || !grade || !window.QualemaxDB) return;
        const ids = (await window.QualemaxDB.getHistorico()).sort((a,b) => (b.vistoEm || 0) - (a.vistoEm || 0)).slice(0,4).map(x => Number(x.produtoId));
        const itens = ids.map(porId).filter(Boolean);
        secao.hidden = !itens.length;
        grade.replaceChildren(...itens.map(produto => {
            const article = document.createElement("article"); article.className = "recente-card";
            const img = document.createElement("img"); img.src = `img/thumbs/${produto.imagem}`; img.alt = ""; img.loading = "lazy"; img.width=116; img.height=144;
            const box = document.createElement("div");
            const strong = document.createElement("strong"); strong.textContent = produto.nome;
            const btn = document.createElement("button"); btn.type="button"; btn.textContent="Ver novamente"; btn.addEventListener("click", () => window.QualemaxProdutos?.abrirModal?.(produto));
            box.append(strong, btn); article.append(img, box); return article;
        }));
    };

    const registrarVisualizacao = async (produto) => {
        if (!produto || !window.QualemaxDB) return;
        await window.QualemaxDB.addHistorico(Number(produto.id));
        await renderizarRecentes();
    };

    const abrirDialogo = () => {
        const modal = document.querySelector("[data-escolhas-modal]"); if (!modal) return;
        ultimoFoco = document.activeElement; modal.hidden = false; modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-aberto");
        modal.querySelector("[data-escolhas-fechar]")?.focus();
    };
    const fecharDialogo = () => {
        const modal = document.querySelector("[data-escolhas-modal]"); if (!modal) return;
        modal.hidden = true; modal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-aberto"); ultimoFoco?.focus?.(); ultimoFoco = null;
    };

    const enviarLista = () => {
        const numero = numeroWhatsApp(); if (!numero || !interesse.size) return;
        const nomes = [...interesse].map(porId).filter(Boolean).map(p => p.nome);
        const nomeLoja = window.QualemaxConfig?.empresa?.nome || "a loja";
        const texto = `Olá! Montei uma lista de interesse no site da ${nomeLoja}: ${nomes.join(", ")}. Gostaria de consultar disponibilidade, valores e detalhes.`;
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
    };

    document.addEventListener("qualemax:catalog-ready", async (e) => { produtos = e.detail?.produtos || []; await carregarEstado(); });
    document.addEventListener("qualemax:produtos-renderizados", atualizarBotoes);
    document.addEventListener("qualemax:colecoes-refresh", atualizarBotoes);
    document.addEventListener("qualemax:produto-visto", async (e) => registrarVisualizacao(e.detail?.produto));
    document.addEventListener("click", (e) => {
        const fav = e.target.closest?.("[data-favorito-id]"); if (fav) { toggleFavorito(fav.dataset.favoritoId); return; }
        const lista = e.target.closest?.("[data-interesse-id]"); if (lista) { toggleInteresse(lista.dataset.interesseId); return; }
        if (e.target.closest?.("[data-escolhas-abrir]")) abrirDialogo();
        if (e.target.closest?.("[data-escolhas-fechar]")) fecharDialogo();
    });
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("[data-lista-whatsapp]")?.addEventListener("click", enviarLista);
        document.querySelector("[data-lista-limpar]")?.addEventListener("click", async () => { await window.QualemaxDB?.limparInteresse?.(); interesse.clear(); atualizarContadores(); atualizarBotoes(); await renderizarDialogo(); anunciar("Lista de interesse limpa."); });
        document.querySelector("[data-favoritos-limpar]")?.addEventListener("click", async () => { await window.QualemaxDB?.limparFavoritos?.(); favoritos.clear(); atualizarContadores(); atualizarBotoes(); await renderizarDialogo(); anunciar("Favoritos limpos."); });
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

    window.QualemaxColecoes = { toggleFavorito, toggleInteresse, registrarVisualizacao, abrirDialogo, getFavoritos: () => [...favoritos], getInteresse: () => [...interesse] };
})();
