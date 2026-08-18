(() => {
    "use strict";

    const normalizar = (texto) => String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let produtos = [];
    let categorias = [];
    let ultimoFoco = null;
    let ultimoProdutoVisto = null;

    const mensagens = () => document.querySelector("[data-chat-mensagens]");
    const adicionarMensagem = (texto, tipo = "bot") => {
        const area = mensagens();
        if (!area) return;
        const elemento = document.createElement("div");
        elemento.className = `chat-mensagem chat-mensagem-${tipo}`;
        elemento.textContent = texto;
        area.append(elemento);
        area.scrollTop = area.scrollHeight;
    };

    const abrirSecao = (seletor, focoSeletor, valorBusca = null) => {
        const reduzirMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || document.documentElement.classList.contains("movimento-reduzido");
        document.querySelector(seletor)?.scrollIntoView({ behavior: reduzirMovimento ? "auto" : "smooth", block: "start" });
        window.setTimeout(() => {
            const foco = document.querySelector(focoSeletor);
            if (valorBusca !== null && foco instanceof HTMLInputElement) {
                foco.value = valorBusca;
                foco.dispatchEvent(new Event("input", { bubbles: true }));
            }
            foco?.focus();
        }, reduzirMovimento ? 0 : 350);
    };

    const paginaAtual = () => location.pathname.split("/").pop() || "index.html";
    const irCatalogo = ({ busca = "", categoria = "" } = {}) => {
        if (paginaAtual() === "catalogo.html") {
            if (categoria) { const select = document.querySelector("[data-filtro-categoria]"); if (select) { select.value = categoria; select.dispatchEvent(new Event("change", { bubbles:true })); } }
            abrirSecao("#produtos", "[data-busca-produtos]", busca || null);
            return;
        }
        const q = new URLSearchParams(); if (busca) q.set("busca", busca); if (categoria) q.set("categoria", categoria);
        location.href = `catalogo.html${q.toString() ? `?${q}` : ""}#produtos`;
    };
    const irQuiz = () => { location.href = paginaAtual() === "quiz.html" ? "#quiz" : "quiz.html#quiz"; };

    const mostrarRedesNoChat = () => {
        const area = mensagens();
        const redes = Array.isArray(window.QualimaxRedesAtivas) ? window.QualimaxRedesAtivas : [];
        if (!area) return;
        if (!redes.length) {
            adicionarMensagem("Os perfis oficiais da loja ainda não foram configurados neste site.");
            return;
        }
        adicionarMensagem("Você pode acompanhar a loja nestes canais oficiais:");
        const grupo = document.createElement("div");
        grupo.className = "chat-redes";
        redes.forEach((rede) => {
            const link = document.createElement("a");
            link.href = rede.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = rede.nome;
            link.setAttribute("aria-label", `${rede.nome} da loja (abre em nova aba)`);
            grupo.append(link);
        });
        area.append(grupo);
        area.scrollTop = area.scrollHeight;
    };


    const adicionarWhatsAppNoChat = (mensagem = "Falar com a equipe no WhatsApp") => {
        const area = mensagens();
        const numero = String(window.QualimaxConfig?.contato?.whatsapp || "").replace(/\D/g, "");
        if (!area || !numero) {
            adicionarMensagem("O WhatsApp ainda não está configurado. Use outro canal disponível na página de contato.");
            return;
        }
        const nome = window.QualimaxConfig?.empresa?.nome || "a loja";
        const link = document.createElement("a");
        link.className = "chat-whatsapp-cta";
        link.href = `https://wa.me/${numero}?text=${encodeURIComponent(`Olá! Vim pelo site da ${nome} e gostaria de falar com a equipe.`)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = mensagem;
        link.setAttribute("aria-label", `${mensagem}, abre em nova aba`);
        area.append(link);
        area.scrollTop = area.scrollHeight;
    };

    const mostrarProdutosNoChat = (itens, contexto = "Encontrei estas opções") => {
        const area = mensagens();
        if (!area || !itens.length) return;
        adicionarMensagem(`${contexto}:`);
        const grupo = document.createElement("div");
        grupo.className = "chat-produtos";
        itens.slice(0, 3).forEach((produto) => {
            const card = document.createElement("div");
            card.className = "chat-produto-card";
            const imagem = document.createElement("img");
            imagem.src = `img/thumbs/${produto.imagem}`;
            imagem.alt = "";
            imagem.loading = "lazy";
            imagem.width = 96;
            imagem.height = 120;
            imagem.addEventListener("error", () => imagem.remove());
            const nome = document.createElement("strong");
            nome.textContent = produto.nome;
            const texto = document.createElement("span");
            texto.textContent = produto.copy || produto.descricao || "Confira os detalhes no catálogo.";
            const botao = document.createElement("button");
            botao.type = "button";
            botao.textContent = "Abrir detalhes";
            botao.addEventListener("click", () => {
                document.querySelector("[data-chat-fechar]")?.click();
                if (window.QualimaxProdutos?.abrirModal) window.QualimaxProdutos.abrirModal(produto);
                else location.href = `produto/${produto.slug}.html`;
            });
            const lista = document.createElement("button");
            lista.type = "button";
            lista.textContent = "Adicionar à minha lista";
            lista.addEventListener("click", async () => {
                const ativo = await window.QualimaxColecoes?.toggleInteresse?.(produto.id);
                lista.textContent = ativo ? "Adicionado à minha lista" : "Adicionar à minha lista";
            });
            card.append(imagem, nome, texto, botao, lista);
            grupo.append(card);
        });
        area.append(grupo);
        area.scrollTop = area.scrollHeight;
    };

    const responder = (texto) => {
        const termo = normalizar(texto);
        if (!termo) return;

        if (/meus favoritos|favoritos|minha lista|minhas escolhas|lista de interesse/.test(termo)) {
            adicionarMensagem("Vou abrir suas escolhas salvas neste navegador.");
            document.querySelector("[data-chat-fechar]")?.click();
            window.setTimeout(() => window.QualimaxColecoes?.abrirDialogo?.(), 0);
            return;
        }
        if (/esse produto|este produto|ultimo produto|último produto|o que eu vi|ele mesmo/.test(termo) && ultimoProdutoVisto) {
            mostrarProdutosNoChat([ultimoProdutoVisto], "Este foi o produto mais recente que você abriu");
            return;
        }
        if (/cafe da manha|café da manhã|cafe da manhã|café da manha|lanche/.test(termo)) {
            const nomes = /lanche/.test(termo)
                ? ["Castanha", "Granola", "Pasta de Amendoim", "Mix de Castanhas", "Aveia"]
                : ["Granola", "Aveia", "Pasta de Amendoim", "Chia", "Linhaça"];
            const encontrados = produtos.filter(p => nomes.some(n => normalizar(p.nome).includes(normalizar(n))));
            mostrarProdutosNoChat(encontrados, "Separei opções do catálogo que combinam com esse momento da rotina");
            return;
        }
        if (/instagram|facebook|tiktok|tik tok|youtube|pinterest|rede social|redes sociais/.test(termo)) {
            mostrarRedesNoChat();
            return;
        }
        if (/whatsapp|pessoa|humano|atendimento/.test(termo)) {
            adicionarMensagem("Claro. Você pode continuar diretamente com a equipe pelo WhatsApp.");
            adicionarWhatsAppNoChat();
            return;
        }
        if (/quiz|escolher|indicacao|indicação|nao sei/.test(termo)) {
            adicionarMensagem("Posso ajudar você a explorar algumas opções. Vou abrir o quiz para continuar.");
            document.querySelector("[data-chat-fechar]")?.click();
            irQuiz();
            return;
        }
        if (/entrega|entregam|entregar|frete/.test(termo)) {
            adicionarMensagem("Área atendida, prazo e condições de entrega precisam ser confirmados com a equipe.");
            adicionarWhatsAppNoChat("Consultar entrega pelo WhatsApp");
            return;
        }
        if (/preco|preço|valor|custa|custo/.test(termo)) {
            adicionarMensagem("Os valores e a disponibilidade precisam ser confirmados com a equipe. Vou abrir o catálogo para você localizar o produto.");
            document.querySelector("[data-chat-fechar]")?.click();
            irCatalogo();
            return;
        }
        if (/vegano|vegana|veganos|veganas/.test(termo)) {
            const encontrados = produtos.filter((item) => item.vegana === true);
            if (encontrados.length) mostrarProdutosNoChat(encontrados, `Encontrei ${encontrados.length} opções cadastradas como veganas`);
            else adicionarMensagem("Não encontrei produtos cadastrados como veganos neste catálogo.");
            return;
        }
        if (/sem gluten|sem glúten|gluten|glúten/.test(termo)) {
            const encontrados = produtos.filter((item) => item.sem_gluten === true);
            if (encontrados.length) mostrarProdutosNoChat(encontrados, `Encontrei ${encontrados.length} opções cadastradas como sem glúten`);
            else adicionarMensagem("Não encontrei produtos cadastrados como sem glúten neste catálogo.");
            return;
        }
        if (/capsula|cápsula|capsulas|cápsulas|po|pó|liquido|líquido/.test(termo)) {
            const mapaFormato = termo.match(/capsula|cápsula/) ? "capsula" : termo.match(/liquido|líquido/) ? "liquido" : "po";
            const encontrados = produtos.filter((item) => normalizar(item.tipo) === mapaFormato);
            if (encontrados.length) mostrarProdutosNoChat(encontrados, `Encontrei ${encontrados.length} opções nesse formato`);
            else adicionarMensagem("Não encontrei opções cadastradas nesse formato agora.");
            return;
        }
        const categoria = categorias.find((item) => {
            const nome = normalizar(item.nome);
            const partes = nome.split(/\s+/).filter((parte) => parte.length > 2 && !["dos", "das", "com"].includes(parte));
            return termo.includes(nome) || termo.includes(normalizar(item.id)) || partes.some((parte) => termo.includes(parte));
        });
        if (categoria) {
            const encontrados = produtos.filter((item) => item.categoria === categoria.id);
            mostrarProdutosNoChat(encontrados, `${categoria.nome}: encontrei ${encontrados.length} ${encontrados.length === 1 ? "opção" : "opções"}`);

            const area = mensagens();
            if (area && encontrados.length) {
                const verCategoria = document.createElement("button");
                verCategoria.type = "button";
                verCategoria.className = "chat-categoria-cta";
                verCategoria.textContent = `Ver ${categoria.nome} no catálogo`;
                verCategoria.addEventListener("click", () => {
                    document.querySelector("[data-chat-fechar]")?.click();
                    irCatalogo({ categoria: categoria.id });
                });
                area.append(verCategoria);
                area.scrollTop = area.scrollHeight;
            }
            return;
        }
        const palavrasIgnoradas = new Set(["quero", "tem", "voces", "vocês", "algum", "alguma", "coisa", "produto", "produtos", "para", "com", "uma", "uns", "umas", "de", "do", "da", "dos", "das", "e", "o", "a"]);
        const tokens = termo.split(/\s+/).map((item) => item.replace(/[^a-z0-9-]/g, "")).filter((item) => item.length > 1 && !palavrasIgnoradas.has(item));
        const encontrados = produtos
            .map((item) => {
                const textoProduto = normalizar([item.nome, item.copy, item.descricao, item.categoria, item.tipo, ...(item.tags || [])].join(" "));
                const pontuacao = tokens.reduce((total, token) => total + (textoProduto.includes(token) ? 1 : 0), 0);
                return { item, pontuacao };
            })
            .filter(({ pontuacao }) => pontuacao > 0)
            .sort((a, b) => b.pontuacao - a.pontuacao)
            .map(({ item }) => item);
        if (encontrados.length) {
            mostrarProdutosNoChat(encontrados, `Encontrei ${encontrados.length} ${encontrados.length === 1 ? "opção relacionada" : "opções relacionadas"} à sua busca`);
            return;
        }
        adicionarMensagem("Não encontrei uma correspondência segura para essa busca. Tente o nome do produto, uma categoria como ‘chás’ ou ‘castanhas’, uma característica como ‘vegano’ ou ‘sem glúten’, ou faça o quiz.");
    };

    document.addEventListener("qualimax:produto-visto", (evento) => {
        ultimoProdutoVisto = evento.detail?.produto || ultimoProdutoVisto;
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
        try {
            const [p, c] = await Promise.all([fetch("./data/produtos.json"), fetch("./data/categorias.json")]);
            if (!p.ok || !c.ok) throw new Error("Falha ao carregar dados do assistente.");
            produtos = (await p.json()).produtos || [];
            categorias = (await c.json()).categorias || [];
        } catch (erro) {
            console.error(erro);
            adicionarMensagem("No momento, não consegui carregar o catálogo. Você ainda pode falar diretamente com a equipe.");
        }

        const abrir = () => {
            ultimoFoco = document.activeElement;
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
            const destinoFoco = ultimoFoco instanceof HTMLElement && document.contains(ultimoFoco) ? ultimoFoco : fallback;
            destinoFoco?.focus();
        };

        document.querySelectorAll("[data-chat-abrir]").forEach((botao) => botao.addEventListener("click", abrir));
        document.querySelector("[data-chat-fechar]")?.addEventListener("click", fechar);
        document.querySelector("[data-chat-enviar]")?.addEventListener("click", () => {
            const campo = document.querySelector("[data-chat-input]");
            if (!campo?.value.trim()) return;
            const texto = campo.value.trim();
            adicionarMensagem(texto, "usuario");
            campo.value = "";
            responder(texto);
            campo.focus();
        });
        document.querySelector("[data-chat-input]")?.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                document.querySelector("[data-chat-enviar]")?.click();
            }
        });
        document.querySelectorAll("[data-chat-acao]").forEach((botao) => botao.addEventListener("click", () => {
            const acao = botao.dataset.chatAcao;
            if (acao === "produto") { fechar(); irCatalogo(); return; }
            if (acao === "categorias") { fechar(); irCatalogo(); return; }
            if (acao === "quiz") { fechar(); irQuiz(); return; }
            if (acao === "redes") { mostrarRedesNoChat(); return; }
            if (acao === "whatsapp") {
                adicionarMensagem("Você pode continuar diretamente com a equipe:");
                adicionarWhatsAppNoChat();
            }
        }));

        document.addEventListener("keydown", (evento) => {
            if (widget.hidden) return;
            if (evento.key === "Escape") { fechar(); return; }
            if (evento.key !== "Tab") return;
            const focaveis = [...widget.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && !el.hidden);
            if (!focaveis.length) return;
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (evento.shiftKey && document.activeElement === primeiro) { evento.preventDefault(); ultimo.focus(); }
            else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primeiro.focus(); }
        });
    });
})();
