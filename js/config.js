(() => {
    "use strict";

    const normalizarNumero = (valor) => String(valor ?? "").replace(/\D/g, "");
    const fallback = {
        empresa: { nome: "Saúde Qualemax", descricao: "" },
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
        { chave: "instagram", nome: "Instagram", sigla: "IG", base: "https://www.instagram.com/", prefixo: "" },
        { chave: "facebook", nome: "Facebook", sigla: "FB", base: "https://www.facebook.com/", prefixo: "" },
        { chave: "tiktok", nome: "TikTok", sigla: "TT", base: "https://www.tiktok.com/@", prefixo: "@" },
        { chave: "youtube", nome: "YouTube", sigla: "YT", base: "https://www.youtube.com/@", prefixo: "@" },
        { chave: "pinterest", nome: "Pinterest", sigla: "PT", base: "https://www.pinterest.com/", prefixo: "" }
    ];

    const resolverUrlRede = (rede, valor) => {
        const bruto = String(valor || "").trim();
        if (!bruto) return "";
        if (/^https?:\/\//i.test(bruto)) return bruto;
        const usuario = bruto.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
        return usuario ? `${rede.base}${usuario}/` : "";
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

    const aplicarLinkWhatsApp = (link, numero, nome) => {
        if (!numero) {
            link.removeAttribute("href");
            link.setAttribute("aria-disabled", "true");
            link.classList.add("link-indisponivel");
            return;
        }
        const texto = link.dataset.whatsappMensagem || `Olá! Vim pelo site da ${nome}.`;
        link.href = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
        link.setAttribute("aria-disabled", "false");
        link.classList.remove("link-indisponivel");
    };

    const aplicarDadosEstruturados = (config) => {
        const empresa = config.empresa || {};
        const contato = config.contato || {};
        const redes = config.redes || {};
        const seo = config.seo || {};
        const nome = empresa.nome || "Saúde Qualemax";
        const dados = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": nome,
            "description": empresa.descricao || undefined,
            "url": empresa.site || seo.canonical || undefined,
            "telephone": contato.telefone || undefined,
            "email": contato.email || undefined,
            "address": contato.endereco ? { "@type": "PostalAddress", "streetAddress": contato.endereco, "addressLocality": empresa.cidade || undefined, "addressRegion": empresa.estado || undefined, "postalCode": empresa.cep || undefined, "addressCountry": "BR" } : undefined
        };
        const sameAs = obterRedesAtivas(redes).map((rede) => rede.url);
        if (sameAs.length) dados.sameAs = sameAs;
        Object.keys(dados).forEach((key) => {
            if (dados[key] === undefined || dados[key] === "") delete dados[key];
        });
        if (dados.address) Object.keys(dados.address).forEach((key) => { if (dados.address[key] === undefined || dados.address[key] === "") delete dados.address[key]; });
        const script = document.querySelector("#dados-estruturados");
        if (script) script.textContent = JSON.stringify(dados);
    };

    const aplicarSEO = (config) => {
        const seo = config.seo || {};
        if (seo.title) document.title = seo.title;
        const meta = document.querySelector('meta[name="description"]');
        if (meta && seo.description) meta.content = seo.description;
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && seo.canonical) canonical.href = seo.canonical;
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogTitle && seo.title) ogTitle.content = seo.title;
        if (ogDescription && seo.description) ogDescription.content = seo.description;
        if (ogUrl && seo.canonical) ogUrl.content = seo.canonical;
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
            if (valor) root.style.setProperty(propriedade, valor);
        });

        document.querySelectorAll(".logo-texto, [data-config-nome]").forEach((el) => { el.textContent = nome; });
        document.querySelectorAll("[data-config-logo]").forEach((el) => { el.textContent = marca.logo || "🌿"; });
        document.querySelectorAll("[data-config-logo-label]").forEach((el) => { el.setAttribute("aria-label", `${nome} - voltar ao início`); });
        document.querySelectorAll("[data-config-whatsapp-label]").forEach((el) => { el.setAttribute("aria-label", `Falar com ${nome} pelo WhatsApp - abre em nova aba`); });
        document.querySelectorAll("[data-config-telefone]").forEach((el) => { el.textContent = contato.telefone || "Telefone não informado"; });
        document.querySelectorAll("[data-config-email]").forEach((el) => { el.textContent = contato.email || "E-mail não informado"; });
        document.querySelectorAll("[data-config-endereco]").forEach((el) => { el.textContent = contato.endereco || "Endereço não informado"; });
        document.querySelectorAll("[data-config-cidade]").forEach((el) => { el.textContent = [empresa.cidade, empresa.estado].filter(Boolean).join(" - "); });

        const redesAtivas = aplicarRedesSociais(redes);
        window.QualemaxRedesAtivas = redesAtivas;
        document.querySelectorAll('[data-chat-acao="redes"]').forEach((botao) => { botao.hidden = redesAtivas.length === 0; });

        document.querySelectorAll("[data-configurable-whatsapp]").forEach((link) => aplicarLinkWhatsApp(link, numero, nome));

        document.querySelectorAll("[data-config-email-link]").forEach((link) => {
            if (contato.email) link.href = `mailto:${contato.email}`;
            else link.removeAttribute("href");
        });

        const nomeChatbot = config.chatbot?.nome || "Assistente";
        document.querySelectorAll("[data-chatbot-nome]").forEach((el) => { el.textContent = nomeChatbot; });
        document.querySelectorAll("[data-chatbot-label]").forEach((el) => { el.setAttribute("aria-label", `Abrir ${nomeChatbot}`); });
        document.querySelectorAll("[data-chatbot-region]").forEach((el) => { el.setAttribute("aria-label", nomeChatbot); });
        document.querySelectorAll("[data-chat-saudacao]").forEach((el) => { el.textContent = `Olá! Eu sou ${nomeChatbot}. Posso encontrar produtos, explorar categorias, abrir o quiz ou encaminhar você para a equipe.`; });
        aplicarSEO(config);
        aplicarDadosEstruturados(config);

        window.QualemaxConfig = config;
        document.dispatchEvent(new CustomEvent("qualemax:config-ready", { detail: config }));
    });
})();
