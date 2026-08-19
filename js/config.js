(() => {
    "use strict";

    const normalizarNumero = (valor) => String(valor ?? "").replace(/\D/g, "");
    const fallback = {
        empresa: { nome: "Loja", descricao: "" },
        contato: {},
        marca: {},
        redes: {},
        chatbot: { ativo: false, nome: "Assistente" },
        seo: {}
    };

    const aplicarTexto = (seletor, valor) => {
        if (valor === undefined || valor === null || valor === "") return;
        document.querySelectorAll(seletor).forEach((el) => { el.textContent = valueToString(valor); });
    };

    const valueToString = (valor) => String(valor);

    const redesDisponiveis = [
        { chave: "instagram", nome: "Instagram", sigla: "IG", base: "https://www.instagram.com/", dominio: "instagram.com" },
        { chave: "facebook", nome: "Facebook", sigla: "FB", base: "https://www.facebook.com/", dominio: "facebook.com" },
        { chave: "tiktok", nome: "TikTok", sigla: "TT", base: "https://www.tiktok.com/@", dominio: "tiktok.com" },
        { chave: "youtube", nome: "YouTube", sigla: "YT", base: "https://www.youtube.com/@", dominio: "youtube.com" },
        { chave: "pinterest", nome: "Pinterest", sigla: "PT", base: "https://www.pinterest.com/", dominio: "pinterest.com" }
    ];

    const hostPermitido = (hostname, dominio) => hostname === dominio || hostname.endsWith(`.${dominio}`);

    const resolverUrlRede = (rede, valor) => {
        const bruto = String(valor || "").trim();
        if (!bruto) return "";

        if (/^https?:\/\//i.test(bruto)) {
            try {
                const url = new URL(bruto);
                if (url.protocol !== "https:" || !hostPermitido(url.hostname.toLowerCase(), rede.dominio)) return "";
                url.username = "";
                url.password = "";
                return url.href;
            } catch {
                return "";
            }
        }

        const usuario = bruto.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
        if (!/^[A-Za-z0-9._-]{1,100}$/.test(usuario)) return "";
        return `${rede.base}${encodeURIComponent(usuario)}/`;
    };

    const caminhoImagemSeguro = (valor) => {
        const caminho = String(valor || "").trim();
        if (!caminho || caminho.includes("..") || caminho.startsWith("/") || /^(?:[a-z]+:|\/\/)/i.test(caminho)) return "";
        return /^img\/[A-Za-z0-9._/-]+$/.test(caminho) ? caminho : "";
    };

    const emailSeguro = (valor) => {
        const email = String(valor || "").trim();
        if (email.length > 254 || /[\r\n]/.test(email)) return "";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
    };

    const corSegura = (valor) => {
        const cor = String(valor || "").trim();
        return /^#[0-9A-Fa-f]{6}$/.test(cor) ? cor : "";
    };

    const obterRedesAtivas = (redes = {}) => redesDisponiveis
        .map((rede) => ({ ...rede, url: resolverUrlRede(rede, redes[rede.chave]) }))
        .filter((rede) => rede.url);

    const criarLinkRede = (rede, compacto = false) => {
        const link = document.createElement("a");
        link.href = rede.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = compacto ? "rodape-rede-link" : "rede-link";
        link.dataset.evento = `rede-${rede.chave}`;
        link.setAttribute("aria-label", `${rede.nome} da loja (abre em nova aba)`);

        const icone = document.createElement("span");
        icone.className = "rede-icone";
        icone.setAttribute("aria-hidden", "true");
        icone.textContent = rede.sigla;

        const texto = document.createElement("span");
        texto.textContent = rede.nome;
        link.append(icone, texto);
        return link;
    };

    const aplicarRedesSociais = (redes = {}) => {
        const ativas = obterRedesAtivas(redes);
        const container = document.querySelector("[data-redes-container]");
        const lista = document.querySelector("[data-redes-lista]");
        const rodape = document.querySelector("[data-redes-rodape]");

        if (lista) {
            lista.replaceChildren(...ativas.map((rede) => criarLinkRede(rede)));
        }
        if (rodape) {
            rodape.replaceChildren(...ativas.map((rede) => criarLinkRede(rede, true)));
        }

        const possuiRedes = ativas.length > 0;
        if (container) container.hidden = !possuiRedes;
        if (rodape) rodape.hidden = !possuiRedes;
        return ativas;
    };

    const aplicarLinkWhatsApp = (link, numero, nome, empresa = {}) => {
        if (!numero) {
            link.removeAttribute("href");
            link.setAttribute("aria-disabled", "true");
            link.classList.add("link-indisponivel");
            return;
        }
        const modelo = link.dataset.whatsappMensagem || "Olá! Vim pelo site da {empresa}.";
        const texto = modelo
            .replaceAll("{empresa}", nome)
            .replaceAll("{cidade}", empresa.cidade || "")
            .replaceAll("{estado}", empresa.estado || "");
        link.href = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
        link.setAttribute("aria-disabled", "false");
        link.classList.remove("link-indisponivel");
    };

    const aplicarDadosEstruturados = (config) => {
        const empresa = config.empresa || {};
        const contato = config.contato || {};
        const redes = config.redes || {};
        const seo = config.seo || {};
        const nome = empresa.nome || "Loja";
        const site = String(empresa.site || seo.canonical || "").replace(/\/?$/, "/");
        const pagina = document.body?.dataset.page || "home";
        const paginaSEO = seo.paginas?.[pagina] || {};
        const paginaUrl = paginaSEO.canonical || site || location.href;

        const loja = {
            "@type": "Store",
            "@id": site ? `${site}#loja` : undefined,
            "name": nome,
            "description": empresa.descricao || undefined,
            "url": site || undefined,
            "telephone": contato.telefone || undefined,
            "email": contato.email || undefined,
            "address": contato.endereco ? {
                "@type": "PostalAddress",
                "streetAddress": contato.endereco,
                "addressLocality": empresa.cidade || undefined,
                "addressRegion": empresa.estado || undefined,
                "postalCode": empresa.cep || undefined,
                "addressCountry": "BR"
            } : undefined
        };

        const sameAs = obterRedesAtivas(redes).map((rede) => rede.url);
        if (sameAs.length) loja.sameAs = sameAs;

        const website = site ? {
            "@type": "WebSite",
            "@id": `${site}#website`,
            "url": site,
            "name": nome,
            "publisher": { "@id": `${site}#loja` },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${site}catalogo.html?busca={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        } : null;

        const nomesPaginas = {
            home: "Início",
            catalogo: "Catálogo",
            quiz: "Quiz",
            sobre: "Sobre",
            contato: "Contato"
        };

        const breadcrumb = pagina !== "home" && site ? {
            "@type": "BreadcrumbList",
            "@id": `${paginaUrl}#breadcrumb`,
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": site },
                { "@type": "ListItem", "position": 2, "name": nomesPaginas[pagina] || "Página", "item": paginaUrl }
            ]
        } : null;

        const limpar = (objeto) => {
            if (!objeto || typeof objeto !== "object") return objeto;
            Object.keys(objeto).forEach((key) => {
                if (objeto[key] === undefined || objeto[key] === "") delete objeto[key];
                else if (objeto[key] && typeof objeto[key] === "object" && !Array.isArray(objeto[key])) limpar(objeto[key]);
            });
            return objeto;
        };

        const grafo = [limpar(loja), website && limpar(website), breadcrumb && limpar(breadcrumb)].filter(Boolean);
        const dados = { "@context": "https://schema.org", "@graph": grafo };
        const script = document.querySelector("#dados-estruturados");
        if (script) script.textContent = JSON.stringify(dados);
    };

    const aplicarSEO = (config) => {
        const seo = config.seo || {};
        const pagina = document.body?.dataset.page || "home";
        const especifico = seo.paginas?.[pagina] || {};
        const dados = pagina === "home"
            ? { title: seo.title, description: seo.description, canonical: seo.canonical, ...especifico }
            : especifico;

        if (dados.title) document.title = dados.title;
        const meta = document.querySelector('meta[name="description"]');
        if (meta && dados.description) meta.content = dados.description;
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && dados.canonical) canonical.href = dados.canonical;
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogTitle && dados.title) ogTitle.content = dados.title;
        if (ogDescription && dados.description) ogDescription.content = dados.description;
        if (ogUrl && dados.canonical) ogUrl.content = dados.canonical;
    };

    document.addEventListener("DOMContentLoaded", async () => {
        let config = fallback;
        try {
            const resposta = await fetch("./data/config.json", { cache: "no-cache" });
            if (!resposta.ok) throw new Error("Falha ao carregar configuração.");
            config = await resposta.json();
        } catch (erro) {
            console.error("Configuração:", erro);
        }

        const marca = config.marca || {};
        const empresa = config.empresa || {};
        const contato = config.contato || {};
        const redes = config.redes || {};
        const nome = empresa.nome || fallback.empresa.nome;
        const numero = normalizarNumero(contato.whatsapp);
        const root = document.documentElement;

        Object.entries({
            "--cor-principal": marca.corPrincipal,
            "--cor-secundaria": marca.corSecundaria,
            "--cor-acento": marca.corAcento,
            "--cor-fundo": marca.corFundo
        }).forEach(([propriedade, valor]) => {
            const segura = corSegura(valor); if (segura) root.style.setProperty(propriedade, segura);
        });

        document.querySelectorAll(".logo-texto, [data-config-nome]").forEach((el) => { el.textContent = nome; });
        document.querySelectorAll("[data-config-logo]").forEach((el) => { el.textContent = marca.logo || "🌿"; });
        document.querySelectorAll("[data-config-logo-img]").forEach((img) => {
            const logoSeguro = caminhoImagemSeguro(marca.logoImagem); if (logoSeguro) { img.src = logoSeguro; img.alt = nome; img.hidden = false; }
            else { img.hidden = true; }
        });
        document.querySelectorAll("[data-config-logo-label]").forEach((el) => { el.setAttribute("aria-label", `${nome} - voltar ao início`); });
        document.querySelectorAll("[data-config-whatsapp-label]").forEach((el) => { el.setAttribute("aria-label", `Falar com ${nome} pelo WhatsApp - abre em nova aba`); });
        document.querySelectorAll("[data-config-telefone]").forEach((el) => { el.textContent = contato.telefone || ""; });
        document.querySelectorAll("[data-config-email]").forEach((el) => { el.textContent = contato.email || ""; });
        document.querySelectorAll("[data-config-endereco]").forEach((el) => { el.textContent = contato.endereco || ""; });
        document.querySelectorAll("[data-config-cidade]").forEach((el) => { el.textContent = [empresa.cidade, empresa.estado].filter(Boolean).join(" - "); });
        document.querySelectorAll("[data-config-descricao]").forEach((el) => { el.textContent = empresa.descricao || ""; });
        document.querySelectorAll("[data-config-localidade]").forEach((el) => { el.textContent = [empresa.cidade, empresa.estado].filter(Boolean).join(" - "); });
        document.querySelectorAll("[data-config-frase-rodape]").forEach((el) => {
            const local = [empresa.cidade, empresa.estado].filter(Boolean).join(" - ");
            el.textContent = local
                ? `Produtos naturais e atendimento humanizado em ${local}.`
                : (empresa.descricao || "Produtos naturais e atendimento humanizado.");
        });

        const recursos = config.recursos || {};
        document.querySelectorAll("[data-recurso]").forEach((el) => {
            const chave = el.dataset.recurso;
            if (Object.prototype.hasOwnProperty.call(recursos, chave)) {
                el.hidden = recursos[chave] === false;
            }
        });

        const comercial = config.comercial || {};
        let possuiComercial = false;
        ["horario","entrega","retirada","observacoes"].forEach((chave) => {
            const valor = String(comercial[chave] || "").trim();
            const item = document.querySelector(`[data-comercial-item="${chave}"]`);
            document.querySelectorAll(`[data-config-comercial-${chave}]`).forEach((el) => {
                el.textContent = valor;
            });
            if (item) item.hidden = !valor;
            if (valor) possuiComercial = true;
        });
        const comercialContainer = document.querySelector("[data-comercial-container]");
        if (comercialContainer) comercialContainer.hidden = !possuiComercial;

        const redesAtivas = aplicarRedesSociais(redes);
        window.QualimaxRedesAtivas = redesAtivas;
        const instagram = redesAtivas.find((rede) => rede.chave === "instagram");
        document.querySelectorAll("[data-config-instagram-handle]").forEach((el) => {
            const bruto = String(redes.instagram || "").trim();
            el.textContent = bruto && !/^https?:\/\//i.test(bruto)
                ? (bruto.startsWith("@") ? bruto : `@${bruto}`)
                : (instagram ? "Instagram" : "");
            el.hidden = !instagram;
        });
        document.querySelectorAll("[data-config-instagram-link]").forEach((el) => {
            if (instagram) {
                el.href = instagram.url;
                el.hidden = false;
            } else {
                el.removeAttribute("href");
                el.hidden = true;
            }
        });
        document.querySelectorAll("[data-config-instagram-card]").forEach((el) => {
            el.hidden = !instagram;
        });
        document.querySelectorAll('[data-chat-acao="redes"]').forEach((botao) => { botao.hidden = redesAtivas.length === 0; });

        document.querySelectorAll("[data-configurable-whatsapp]").forEach((link) => aplicarLinkWhatsApp(link, numero, nome, empresa));

        document.querySelectorAll("[data-config-email-link]").forEach((link) => {
            const email = emailSeguro(contato.email); if (email) link.href = `mailto:${email}`;
            else link.removeAttribute("href");
        });

        const nomeChatbot = config.chatbot?.nome || "Assistente";
        document.querySelectorAll("[data-chatbot-nome]").forEach((el) => { el.textContent = nomeChatbot; });
        document.querySelectorAll("[data-chatbot-label]").forEach((el) => { el.setAttribute("aria-label", `Abrir ${nomeChatbot}`); });
        document.querySelectorAll("[data-chatbot-region]").forEach((el) => { el.setAttribute("aria-label", nomeChatbot); });
        document.querySelectorAll("[data-chat-saudacao]").forEach((el) => { el.textContent = `Olá! Eu sou ${nomeChatbot}. Posso encontrar produtos, explorar categorias, abrir o quiz ou encaminhar você para a equipe.`; });
        aplicarSEO(config);
        aplicarDadosEstruturados(config);

        window.QualimaxConfig = config;
        document.dispatchEvent(new CustomEvent("qualimax:config-ready", { detail: config }));
    });
})();
