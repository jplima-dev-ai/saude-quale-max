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
        document.body.append(area);
        area.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch { ok = false; }
        area.remove();
        if (!ok) throw new Error("Falha ao copiar link.");
        return true;
    };

    document.addEventListener("DOMContentLoaded", async () => {
        const id = Number(document.body.dataset.produtoId || 0);
        let config = {}, produto = null, catalogo = [];
        const status = document.querySelector("[data-share-status]");

        try {
            const [c, p] = await Promise.all([fetch("../data/config.json"), fetch("../data/produtos.json")]);
            if (c.ok) config = await c.json();
            if (p.ok) {
                catalogo = (await p.json()).produtos || [];
                produto = catalogo.find(x => Number(x.id) === id) || null;
            }
        } catch {}

        const nomeLoja = config.empresa?.nome || "Saúde Qualemax";
        document.querySelectorAll(".logo-texto").forEach(el => el.textContent = nomeLoja);
        if (produto) document.title = `${produto.nome} | ${nomeLoja}`;

        const numero = String(config.contato?.whatsapp || "").replace(/\D/g, "");
        const link = document.querySelector("[data-produto-whatsapp]");
        if (link && numero && produto) {
            link.href = `https://wa.me/${numero}?text=${encodeURIComponent(`Olá! Vi ${produto.nome} no site da ${nomeLoja} e gostaria de consultar disponibilidade, valor e detalhes.`)}`;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.removeAttribute("aria-disabled");
        } else if (link) {
            link.removeAttribute("href");
            link.removeAttribute("target");
            link.setAttribute("aria-disabled", "true");
            link.classList.add("link-indisponivel");
            link.textContent = "WhatsApp não configurado";
        }

        // Integra a página individual aos mesmos favoritos/lista do catálogo.
        const acoes = document.querySelector(".produto-pagina-acoes");
        if (acoes && produto && window.QualemaxDB) {
            await window.QualemaxDB.init?.();
            await window.QualemaxDB.seedProdutos?.(catalogo);

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
                    window.QualemaxDB.isFavorito(produto.id),
                    window.QualemaxDB.isInteresse(produto.id)
                ]);
                fav.setAttribute("aria-pressed", String(isFav));
                fav.textContent = isFav ? "★ Favorito" : "☆ Favoritar";
                lista.setAttribute("aria-pressed", String(isLista));
                lista.textContent = isLista ? "✓ Na minha lista" : "+ Adicionar à lista";
            };

            fav.addEventListener("click", async () => {
                const ativo = await window.QualemaxDB.toggleFavorito(produto.id);
                if (status) status.textContent = ativo ? "Produto adicionado aos favoritos." : "Produto removido dos favoritos.";
                await atualizarEstados();
            });
            lista.addEventListener("click", async () => {
                const ativo = await window.QualemaxDB.toggleInteresse(produto.id);
                if (status) status.textContent = ativo ? "Produto adicionado à lista de interesse." : "Produto removido da lista de interesse.";
                await atualizarEstados();
            });

            const compartilhar = document.querySelector("[data-compartilhar]");
            if (compartilhar) acoes.insertBefore(fav, compartilhar);
            else acoes.append(fav);
            if (compartilhar) acoes.insertBefore(lista, compartilhar);
            else acoes.append(lista);
            await atualizarEstados();
            await window.QualemaxDB.addHistorico?.(produto.id);
        }

        document.querySelector("[data-compartilhar]")?.addEventListener("click", async () => {
            const dados = { title: produto?.nome || document.title, text: produto?.copy || "Confira este produto", url: location.href };
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
