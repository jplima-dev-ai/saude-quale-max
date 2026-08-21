(() => {
"use strict";

const slugSeguro = v => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v || "")) ? String(v) : "";
const nomeArquivoSeguro = v => /^[A-Za-z0-9._-]+$/.test(String(v || "").trim()) ? String(v).trim() : "";
const categoriaSegura = v => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v || "")) ? String(v) : "";

const carregarJSON = async url => {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Falha ao carregar dados locais.");
    return r.json();
};

const categoriasPreferidas = (produtos, sinais) => {
    const pontos = new Map();
    sinais.forEach(({ id, peso }) => {
        const p = produtos.find(x => Number(x.id) === Number(id));
        if (!p || !categoriaSegura(p.categoria)) return;
        pontos.set(p.categoria, (pontos.get(p.categoria) || 0) + peso);
    });
    return [...pontos].sort((a,b) => b[1]-a[1]).map(x => x[0]);
};

const card = (produto, rotulo) => {
    const a = document.createElement("a");
    a.className = "jornada-card";
    const slug = slugSeguro(produto.slug);
    a.href = slug ? `products/${slug}.html` : "catalog.html";

    const img = document.createElement("img");
    const arquivo = nomeArquivoSeguro(produto.imagem);
    if (arquivo) {
        img.src = `assets/images/thumbs/${arquivo}`;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.width = 116;
        img.height = 144;
        img.addEventListener("error", () => img.remove());
    }

    const box = document.createElement("div");
    const small = document.createElement("small");
    small.textContent = rotulo;
    const strong = document.createElement("strong");
    strong.textContent = produto.nome;
    const span = document.createElement("span");
    span.textContent = produto.copy || produto.descricao || "Continue explorando esta opção.";
    box.append(small,strong,span);
    if (arquivo) a.append(img);
    a.append(box);
    return a;
};

const trilhaCategoria = (categoria, nome, origem) => {
    const segura = categoriaSegura(categoria);
    if (!segura) return null;

    const a = document.createElement("a");
    a.className = "jornada-card jornada-card-trilha";
    a.href = `catalog.html?categoria=${encodeURIComponent(segura)}#produtos`;

    const box = document.createElement("div");
    const small = document.createElement("small");
    small.textContent = origem === "historico"
        ? "Uma trilha inspirada nas suas últimas visitas"
        : "Uma trilha inspirada nas suas escolhas salvas";
    const strong = document.createElement("strong");
    strong.textContent = `Continue explorando ${nome}`;
    const span = document.createElement("span");
    span.textContent = "Se quiser, veja outras opções dessa categoria e continue descobrindo no seu ritmo.";
    box.append(small,strong,span);
    a.append(box);
    return a;
};

const atualizarTexto = ({ titulo, texto, favIds, listaIds, histIds, categoriaNome }) => {
    if (favIds.length) {
        if (titulo) titulo.textContent = "Você já separou algumas coisas que gostou. Quer dar mais uma olhada?";
    } else if (listaIds.length) {
        if (titulo) titulo.textContent = "Sua lista está guardadinha por aqui. Quer continuar?";
    } else if (histIds.length >= 2) {
        if (titulo) titulo.textContent = "Você já passeou um pouco por aqui. Que tal retomar?";
    }

    if (!texto) return;
    if (categoriaNome && histIds.length) {
        texto.textContent = `Você andou olhando ${categoriaNome}. Deixamos alguns atalhos para você continuar sem precisar começar de novo.`;
    } else if (categoriaNome && (favIds.length || listaIds.length)) {
        texto.textContent = `Você salvou algumas opções de ${categoriaNome}. Elas continuam aqui para quando quiser retomar.`;
    } else {
        texto.textContent = "Deixamos aqui alguns atalhos salvos neste dispositivo para você continuar de onde parou.";
    }
};

const init = async () => {
    const secao = document.querySelector("[data-jornada-local]");
    if (!secao || !window.QualimaxDB) return;

    if (!window.QualimaxConfig) {
        await new Promise((resolve) => {
            const timer = window.setTimeout(resolve, 1200);
            document.addEventListener("qualimax:config-ready", () => {
                clearTimeout(timer);
                resolve();
            }, { once: true });
        });
    }
    if (window.QualimaxConfig?.recursos?.jornadaLocal === false) {
        secao.hidden = true;
        return;
    }

    try {
        const [pd, cd] = await Promise.all([
            carregarJSON("./data/products.json"),
            carregarJSON("./data/categories.json")
        ]);
        const produtos = Array.isArray(pd.produtos) ? pd.produtos : [];
        const cats = Array.isArray(cd.categorias) ? cd.categorias : [];

        await window.QualimaxDB.init?.();
        await window.QualimaxDB.seedProdutos?.(produtos);

        const carregarSinais = async () => {
            const [hist, favs, lista] = await Promise.all([
                window.QualimaxDB.getHistorico(),
                window.QualimaxDB.getFavoritos(),
                window.QualimaxDB.getInteresse()
            ]);
            const histOrd = [...hist].sort((a,b) => (b.vistoEm || 0) - (a.vistoEm || 0));
            return {
                histIds: histOrd.map(x => Number(x.produtoId)),
                favIds: favs.sort((a,b)=>(b.atualizadoEm||0)-(a.atualizadoEm||0)).map(x => Number(x.produtoId)),
                listaIds: lista.sort((a,b)=>(b.atualizadoEm||0)-(a.atualizadoEm||0)).map(x => Number(x.produtoId))
            };
        };

        const renderizar = async () => {
            const { histIds, favIds, listaIds } = await carregarSinais();
            const todos = [...new Set([...favIds,...listaIds,...histIds])];
            if (!todos.length) {
                secao.hidden = true;
                return;
            }

            const grade = document.querySelector("[data-jornada-grid]");
            const itens = [];
            const usados = new Set();
            const adicionar = (id, rotulo) => {
                const p = produtos.find(x => Number(x.id) === Number(id));
                if (p && !usados.has(Number(p.id))) {
                    itens.push(card(p, rotulo));
                    usados.add(Number(p.id));
                }
            };

            favIds.slice(0,1).forEach(id => adicionar(id,"Você favoritou"));
            listaIds.slice(0,1).forEach(id => adicionar(id,"Está na sua lista"));
            histIds.slice(0,2).forEach(id => adicionar(id,"Visto recentemente"));

            const sinaisPonderados = [
                ...favIds.map(id => ({ id, peso: 7 })),
                ...listaIds.map(id => ({ id, peso: 6 })),
                ...histIds.map((id, idx) => ({ id, peso: Math.max(1, 5-idx) }))
            ];
            const prefs = categoriasPreferidas(produtos, sinaisPonderados);
            const cat = prefs[0] ? cats.find(x => x.id === prefs[0]) : null;
            if (prefs[0]) {
                const origem = histIds.some(id => produtos.find(p => Number(p.id)===id)?.categoria === prefs[0])
                    ? "historico" : "salvos";
                const trilha = trilhaCategoria(prefs[0], cat?.nome || prefs[0], origem);
                if (trilha) itens.push(trilha);
            }

            grade?.replaceChildren(...itens.slice(0,4));
            atualizarTexto({
                titulo: document.querySelector("[data-jornada-titulo]"),
                texto: document.querySelector("[data-jornada-texto]"),
                favIds, listaIds, histIds,
                categoriaNome: cat?.nome || ""
            });
            secao.hidden = false;
        };

        await renderizar();

        document.querySelector("[data-jornada-limpar]")?.addEventListener("click", async () => {
            await window.QualimaxDB.limparHistorico?.();
            const status = document.querySelector("[data-jornada-status]");
            if (status) status.textContent = "Histórico de navegação limpo. Favoritos e lista de interesse foram mantidos.";
            await renderizar();
        });

        document.addEventListener("qualimax:jornada-refresh", renderizar);
    } catch (e) {
        console.error("Jornada local:", e);
        secao.hidden = true;
    }
};

document.addEventListener("DOMContentLoaded", init);
})();
