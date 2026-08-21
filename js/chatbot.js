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
    const MaxNLU = window.QualimaxMaxNLU || { corrigir: normalizar, extrair: () => ({}), ehRespostaCurta: () => false };
    const MaxDecision = window.QualimaxMaxDecision || null;
    const estado = MaxCore.criarEstado();



    const moeda = valor => Number(valor||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    const precoTexto = produto => produto?.preco
        ? `${moeda(produto.preco)}${produto.venda_tipo==="peso" ? ` por ${produto.apresentacao||"100 g"}` : ` (${produto.apresentacao||"unidade"})`}`
        : "preço sob consulta";
    const extrairOrcamento = texto => {
        const n=normalizar(texto).match(/(?:ate|tenho|orcamento|gastar|por|posso gastar|quero gastar)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/);
        return n ? Number(n[1].replace(",",".")) : null;
    };
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



    const obterTempoLocal = (agora = new Date()) => {
        const hora=agora.getHours();
        const minuto=agora.getMinutes();
        const periodo=hora < 12 ? "manha" : hora < 18 ? "tarde" : "noite";
        const saudacao=periodo==="manha" ? "Bom dia" : periodo==="tarde" ? "Boa tarde" : "Boa noite";
        return {
            hora,
            minuto,
            periodo,
            saudacao,
            horario: `${String(hora).padStart(2,"0")}:${String(minuto).padStart(2,"0")}`
        };
    };

    const saudacaoLocal = () => obterTempoLocal().saudacao;

    const responderHorarioLocal = (termo) => {
        const t=normalizar(termo);
        if(!/\b(?:que horas|qual a hora|horario agora|horário agora|hora agora|que horario|que horário)\b/.test(t)) return false;
        const local=obterTempoLocal();
        adicionarMensagem(`${local.saudacao}. Pelo horário local deste dispositivo, agora são ${local.horario}.`);
        return true;
    };

    const PROCESSAMENTO_FRASES = Object.freeze([
        "Um momento…",
        "Só um instante…",
        "Estou organizando as opções…"
    ]);
    let processamentoAtual = null;

    const iniciarProcessamento = (texto = "") => {
        if (processamentoAtual?.isConnected) processamentoAtual.remove();
        const area=mensagens();
        if(!area) return null;
        const el=document.createElement("div");
        el.className="chat-mensagem chat-mensagem-bot chat-processando";
        const frase=texto || PROCESSAMENTO_FRASES[Math.floor(Math.random()*PROCESSAMENTO_FRASES.length)];
        el.textContent=frase;
        el.setAttribute("role","status");
        el.setAttribute("aria-live","polite");
        el.setAttribute("aria-label",frase.replace("…",""));
        area.append(el);
        processamentoAtual=el;
        rolarFim();
        return el;
    };

    const encerrarProcessamento = () => {
        if(processamentoAtual?.isConnected) processamentoAtual.remove();
        processamentoAtual=null;
    };

    const consultaComplexa = (termo) => {
        const t=normalizar(termo);
        let pontos=0;
        if(t.length>55) pontos++;
        if(/\b(?:comparar|comparacao|qual dos dois|entre os dois|desses dois)\b/.test(t)) pontos+=2;
        if(/\b(?:ate|orcamento|tenho|posso gastar|no maximo)\b/.test(t)) pontos++;
        if(/\b(?:vegano|sem gluten|capsula|em po|liquido)\b/.test(t)) pontos++;
        if(/\b(?:mais barato|parecida|semelhante|outra opcao)\b/.test(t)) pontos++;
        if((t.match(/\b(?:e|mas|tambem|também|porem|porém)\b/g)||[]).length>=2) pontos++;
        return pontos>=2;
    };

    const executarComProcessamento = (termo, fn) => {
        if(!consultaComplexa(termo)) return fn();
        iniciarProcessamento();
        // Cede um ciclo ao navegador para que o status seja anunciado/renderizado.
        window.setTimeout(()=>{
            encerrarProcessamento();
            try { fn(); }
            catch (erro) {
                console.error("Max: falha ao processar consulta", erro);
                adicionarMensagem("Não consegui concluir essa análise agora. Podemos tentar novamente com uma frase mais curta.");
            }
        }, 90);
        return true;
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
            adicionarMensagem("O quiz não está disponível neste momento, mas eu posso continuar ajudando você pelo catálogo.");
            return;
        }
        location.href = paginaAtual() === "quiz.html" ? "#quiz" : "quiz.html#quiz";
    };

    const numeroWhatsApp = () => String(window.QualimaxConfig?.contato?.whatsapp || "").replace(/\D/g, "");

    const adicionarWhatsAppNoChat = (textoBotao = "Preparar atendimento", contexto = "") => {
        const area = mensagens();
        const numero = numeroWhatsApp();
        if (!area || !numero) {
            adicionarMensagem("O WhatsApp não está disponível neste momento. Posso encaminhar você para a página de contato.");
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
                    termos: [...(estado.preferencias.termos || [])].slice(0,6),
                    excluirTipos: [...(estado.preferencias.excluirTipos || [])].slice(0,4),
                    excluirCategorias: [...(estado.preferencias.excluirCategorias || [])].slice(0,4)
                },
                contexto: String(contexto || "").slice(0,300),
                carrinho: estado.carrinho.slice(0,20),
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


    const memorizarProdutosExibidos = (lista) => {
        const itens=(Array.isArray(lista)?lista:[]).filter(Boolean);
        estado.ultimoLoteExibido=itens.slice();
        for(const produto of itens){
            estado.historicoProdutosExibidos=estado.historicoProdutosExibidos.filter(p=>p.id!==produto.id);
            estado.historicoProdutosExibidos.push(produto);
        }
        if(estado.historicoProdutosExibidos.length>12){
            estado.historicoProdutosExibidos=estado.historicoProdutosExibidos.slice(-12);
        }
    };

    const produtoPorPosicao = (termo) => {
        const lote=estado.ultimoLoteExibido||[];
        if(!lote.length) return null;
        const t=normalizar(termo);
        const posicoes=[
            [/\b(?:primeir[oa]|1(?:a|o)?|numero 1|número 1)\b/,0],
            [/\b(?:segund[oa]|2(?:a|o)?|numero 2|número 2)\b/,1],
            [/\b(?:terceir[oa]|3(?:a|o)?|numero 3|número 3)\b/,2],
        ];
        for(const [rx,i] of posicoes) if(rx.test(t) && lote[i]) return lote[i];
        return null;
    };

    const produtoAnteriorAoContexto = () => {
        const hist=estado.historicoProdutosExibidos||[];
        if(!hist.length) return null;
        const atual=produtoContextual();
        if(!atual) return hist.at(-1)||null;
        let idx=-1;
        for(let i=hist.length-1;i>=0;i--){
            if(hist[i].id===atual.id){ idx=i; break; }
        }
        if(idx>0) return hist[idx-1];
        return hist.length>1 ? hist.at(-2) : null;
    };

    const similaresMaisBaratos = (produto, limite=6) => {
        if(!produto) return [];
        const preco=Number(produto.preco)||Infinity;
        return similaresAoProduto(produto, Math.max(limite*3,12))
            .filter(p=>Number(p.preco)>0 && Number(p.preco)<preco && !estado.produtosRejeitados.includes(String(p.id)))
            .sort((a,b)=>Number(a.preco)-Number(b.preco))
            .slice(0,limite);
    };


    const removerIdDeAfinidades = id => {
        const chave=String(id);
        estado.produtosGostei=estado.produtosGostei.filter(x=>String(x)!==chave);
        estado.produtosTalvez=estado.produtosTalvez.filter(x=>String(x)!==chave);
        estado.produtosNaoGostei=estado.produtosNaoGostei.filter(x=>String(x)!==chave);
    };

    const marcarAfinidade = (produto, status) => {
        if(!produto) return false;
        const id=String(produto.id);
        removerIdDeAfinidades(id);
        if(status==="gostei") estado.produtosGostei.push(id);
        if(status==="talvez") estado.produtosTalvez.push(id);
        if(status==="nao-gostei"){
            estado.produtosNaoGostei.push(id);
            if(!estado.produtosRejeitados.includes(id)) estado.produtosRejeitados.push(id);
        } else {
            estado.produtosRejeitados=estado.produtosRejeitados.filter(x=>String(x)!==id);
        }
        return true;
    };

    const produtosPorAfinidade = status => {
        const ids=status==="gostei" ? estado.produtosGostei :
            status==="talvez" ? estado.produtosTalvez : estado.produtosNaoGostei;
        const set=new Set((ids||[]).map(String));
        return estado.produtos.filter(p=>set.has(String(p.id)));
    };

    const produtoParaAfinidade = termo =>
        produtoPorPosicao(termo) || produtoPorNome(termo) || produtosMencionados(termo)[0] || produtoContextual();

    const responderAfinidade = termo => {
        const t=normalizar(termo);

        if(/\b(?:mostra|mostrar|quais|ver)\b.*\b(?:gostei|preferidos)\b/.test(t)){
            const itens=produtosPorAfinidade("gostei");
            if(itens.length) registrarResultados(itens,"Produtos que você marcou como gostei nesta conversa");
            else adicionarMensagem("Você ainda não marcou nenhum produto como “gostei” nesta conversa.");
            return true;
        }

        if(/\b(?:mostra|mostrar|quais|ver)\b.*\b(?:talvez|duvida|pensar)\b/.test(t)){
            const itens=produtosPorAfinidade("talvez");
            if(itens.length) registrarResultados(itens,"Produtos que você deixou como talvez");
            else adicionarMensagem("Você ainda não deixou nenhum produto como “talvez” nesta conversa.");
            return true;
        }

        if(/\b(?:mostra|mostrar|quais|ver)\b.*\b(?:nao gostei|rejeitei|descartados)\b/.test(t)){
            const itens=produtosPorAfinidade("nao-gostei");
            if(itens.length) registrarResultados(itens,"Produtos que você marcou como não gostei nesta conversa");
            else adicionarMensagem("Você ainda não marcou nenhum produto como “não gostei” nesta conversa.");
            return true;
        }

        if(/\b(?:gostei dessas|gostei destas)\b/.test(t) && estado.ultimoLoteExibido?.length){
            estado.ultimoLoteExibido.forEach(p=>marcarAfinidade(p,"gostei"));
            adicionarMensagem(`Certo. Marquei ${estado.ultimoLoteExibido.length} opções como “gostei” nesta conversa.`);
            return true;
        }

        if(/\b(?:nao gostei dessas|nenhuma dessas|descarta essas|descartar essas)\b/.test(t) && estado.ultimoLoteExibido?.length){
            estado.ultimoLoteExibido.forEach(p=>marcarAfinidade(p,"nao-gostei"));
            adicionarMensagem("Entendi. Vou deixar essas opções de lado nesta conversa e procurar alternativas diferentes.");
            registrarResultados(filtrarComPreferencias().slice(0,12),"Separei alternativas diferentes");
            return true;
        }

        const produto=produtoParaAfinidade(t);
        if(!produto) return false;

        if(/\b(?:gostei|eu gostei|prefiro esse|prefiro essa|esse me agradou|essa me agradou)\b/.test(t) && !/\bnao gostei\b/.test(t)){
            marcarAfinidade(produto,"gostei");
            definirProdutoContexto(produto);
            adicionarMensagem(`Certo. Marquei ${produto.nome} como “gostei”. Vou considerar isso nas próximas sugestões.`);
            adicionarAcoes([
                {texto:"Adicionar à seleção",valor:`adicionar ${produto.nome}`},
                {texto:"Ver algo parecido",valor:`algo parecido com ${produto.nome}`}
            ]);
            return true;
        }

        if(/\b(?:talvez|vou pensar|deixa em duvida|nao tenho certeza)\b/.test(t)){
            marcarAfinidade(produto,"talvez");
            definirProdutoContexto(produto);
            adicionarMensagem(`Tudo bem. Deixei ${produto.nome} como “talvez”, sem tratar como uma escolha definitiva.`);
            return true;
        }

        if(/\b(?:nao gostei|nao quero esse|nao quero essa|descarta esse|descarta essa)\b/.test(t)){
            marcarAfinidade(produto,"nao-gostei");
            adicionarMensagem(`Entendi. Marquei ${produto.nome} como “não gostei” e vou evitar essa opção nesta conversa.`);
            return true;
        }

        return false;
    };

    const detectarDestinatarioPresente = termo => {
        const t=normalizar(termo);
        const mapa=[
            [/\bminha mae\b/,"sua mãe"],
            [/\bmeu pai\b/,"seu pai"],
            [/\bminha avo\b/,"sua avó"],
            [/\bmeu avo\b/,"seu avô"],
            [/\bminha esposa\b/,"sua esposa"],
            [/\bmeu marido\b/,"seu marido"],
            [/\bminha amiga\b/,"sua amiga"],
            [/\bmeu amigo\b/,"seu amigo"],
            [/\bminha filha\b/,"sua filha"],
            [/\bmeu filho\b/,"seu filho"],
            [/\bminha irma\b/,"sua irmã"],
            [/\bmeu irmao\b/,"seu irmão"]
        ];
        return mapa.find(([rx])=>rx.test(t))?.[1]||"";
    };

    const extrairOrcamentoPresente = termo => {
        const t=normalizar(termo);
        const m=t.match(/\b(?:ate|por|com|orcamento)\s*(?:r\$\s*)?(\d{2,4}(?:[.,]\d{1,2})?)/);
        return m ? Number(m[1].replace(",",".")) : extrairOrcamento(t);
    };

    const montarCestaPresente = (limite, excluidosExtras=[]) => {
        const teto=Number(limite);
        if(!MaxDecision?.montarCestaPorOrcamento || !Number.isFinite(teto) || teto<=0) return {itens:[],total:0};

        const categoriasPreferidas=[
            estado.preferencias.categoria,
            ...produtosPorAfinidade("gostei").map(p=>p.categoria)
        ].filter(Boolean);

        const categoriasPresente=new Set(["chas","cuidados-pessoais","oleaginosas","alimentos","cereais","produtos-naturais"]);
        const baseProdutos=estado.preferencias.categoria
            ? estado.produtos.filter(p=>p.categoria===estado.preferencias.categoria)
            : estado.produtos.filter(p=>categoriasPresente.has(p.categoria));

        return MaxDecision.montarCestaPorOrcamento(baseProdutos,teto,{
            excluidos:[
                ...(estado.produtosRejeitados||[]),
                ...(estado.produtosNaoGostei||[]),
                ...(excluidosExtras||[])
            ],
            preferidos:estado.produtosGostei||[],
            categoriasPreferidas
        });
    };

    const responderModoPresente = termo => {
        const t=normalizar(termo);
        const pede=/\b(?:presente|cesta|kit|lembranca|presentear)\b/.test(t);
        const continua=estado.presente?.ativo && /\b(?:outra|novo|mais barato|mais em conta|refaz|troca|diferente)\b/.test(t);
        if(!pede && !continua) return false;

        const destinatario=detectarDestinatarioPresente(t) || estado.presente.destinatario || "";
        const informado=extrairOrcamentoPresente(t);
        const orcamento=informado || estado.presente.orcamento;

        if(!orcamento){
            estado.presente={ativo:true,destinatario,orcamento:null,produtoIds:[]};
            adicionarMensagem(`Posso montar uma sugestão de cesta${destinatario?` para ${destinatario}`:""} usando os preços aproximados do catálogo. Qual valor você gostaria de gastar?`);
            adicionarAcoes([
                {texto:"Até R$ 50",valor:"cesta até 50 reais"},
                {texto:"Até R$ 100",valor:"cesta até 100 reais"},
                {texto:"Até R$ 150",valor:"cesta até 150 reais"}
            ]);
            return true;
        }

        const excluirAnterior=continua ? (estado.presente.produtoIds||[]) : [];
        const cesta=montarCestaPresente(orcamento,excluirAnterior);

        if(!cesta.itens.length){
            adicionarMensagem(`Não consegui montar uma combinação diferente dentro de ${moeda(orcamento)} com os critérios atuais. Posso tentar um orçamento maior ou rever alguma preferência.`);
            return true;
        }

        estado.presente={
            ativo:true,
            destinatario,
            orcamento,
            produtoIds:cesta.itens.map(p=>String(p.id))
        };

        const alvo=destinatario ? ` para ${destinatario}` : "";
        const itensTexto=cesta.itens.map(p=>`${p.nome} — ${moeda(p.preco)}`).join("; ");
        adicionarMensagem(`Montei uma sugestão de cesta${alvo}: ${itensTexto}. Total aproximado: ${moeda(cesta.total)}.`);
        registrarResultados(cesta.itens,`Sugestão de cesta${alvo}`);
        adicionarAcoes([
            {texto:"Adicionar cesta à seleção",acao:()=>{
                cesta.itens.forEach(p=>atualizarCarrinho(p,Number(p.quantidade_base||1)));
                adicionarMensagem(`Adicionei a cesta à sua seleção. ${resumoCarrinho()}`);
            }},
            {texto:"Montar outra combinação",valor:`outra cesta até ${orcamento} reais`},
            {texto:"Preparar atendimento",acao:()=>adicionarWhatsAppNoChat("Preparar atendimento","Cesta sugerida pelo Max")}
        ]);
        return true;
    };
    const responderReferenciaSemantica = (termo) => {
        const t=normalizar(termo);

        if(/\b(?:nao gostei dessas|não gostei dessas|nao gostei dessas opcoes|não gostei dessas opções|nenhuma dessas|outras diferentes)\b/.test(t)){
            const lote=estado.ultimoLoteExibido||[];
            if(lote.length){
                for(const p of lote) marcarAfinidade(p,"nao-gostei");
                const base=filtrarComPreferencias().filter(p=>!estado.produtosRejeitados.includes(String(p.id)));
                adicionarMensagem("Entendi. Vou deixar essas opções de lado nesta conversa e procurar alternativas diferentes.");
                registrarResultados(base.slice(0,12),"Separei outras possibilidades");
                return true;
            }
        }

        const posicionado=produtoPorPosicao(t);
        if(posicionado && /\b(?:parece melhor|gostei|prefiro|quero essa|quero esse|essa opcao|essa opção|esse produto)\b/.test(t)){
            definirProdutoContexto(posicionado);
            adicionarMensagem(`Certo. Vou considerar ${posicionado.nome} como a opção que mais chamou sua atenção.`);
            adicionarMensagem(explicarEscolha(posicionado,{comparacao:true}));
            adicionarAcoes([
                {texto:"Ver detalhes",acao:()=>explicarProduto(posicionado)},
                {texto:"Encontrar uma alternativa mais barata",valor:"tem outra mais barata parecida com ela?"}
            ]);
            return true;
        }

        if(/\b(?:outra|alguma)\b.*\b(?:mais barata|mais em conta)\b.*\b(?:parecida|semelhante|como ela|como ele)\b|\bmais barata parecida\b/.test(t)){
            const base=posicionado||produtoContextual()||estado.ultimoLoteExibido?.[0];
            if(base){
                const alternativas=similaresMaisBaratos(base,6);
                if(alternativas.length){
                    adicionarMensagem(`Sim. Procurei opções semelhantes a ${base.nome} com preço-base menor.`);
                    registrarResultados(alternativas,`Alternativas mais econômicas que ${base.nome}`);
                }else{
                    adicionarMensagem(`Não encontrei, entre as opções semelhantes cadastradas, uma alternativa com preço-base menor que ${base.nome}.`);
                }
                return true;
            }
        }

        if(/\b(?:volta|voltar|retoma|retomar)\b.*\b(?:naquela|naquele|anterior|antes)\b/.test(t)){
            const anterior=produtoAnteriorAoContexto();
            if(anterior){
                definirProdutoContexto(anterior);
                adicionarMensagem(`Claro. A opção anterior era ${anterior.nome}.`);
                explicarProduto(anterior);
                return true;
            }
        }

        return false;
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
            adicionarMensagem("Chegamos ao fim desta seleção. Se desejar, posso procurar por outro caminho.");
            return;
        }

        if (inicio === 0) adicionarMensagem(`${estado.contextoResultados}:`);
        else adicionarMensagem("Separei mais algumas opções:");

        const grupo = document.createElement("div");
        grupo.className = "chat-produtos";
        pagina.forEach((produto) => grupo.append(criarCardProduto(produto)));
        area.append(grupo);
        memorizarProdutosExibidos(pagina);
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


    const contarComPreferencias = prefs => estado.produtos.filter(produto=>{
        if(prefs.categoria && produto.categoria!==prefs.categoria) return false;
        if(prefs.tipo && normalizar(produto.tipo)!==normalizar(prefs.tipo)) return false;
        if(prefs.vegana===true && produto.vegana!==true) return false;
        if(prefs.semGluten===true && produto.sem_gluten!==true) return false;
        if(prefs.excluirTipos?.includes(normalizar(produto.tipo))) return false;
        if(prefs.excluirCategorias?.includes(produto.categoria)) return false;
        if(estado.produtosRejeitados?.includes(String(produto.id))) return false;
        if(prefs.orcamento && Number(produto.preco)>Number(prefs.orcamento)) return false;

        if(prefs.termos?.length){
            const texto=normalizar([
                produto.nome,produto.copy,produto.descricao,produto.categoria,produto.tipo,
                ...(produto.tags||[]),...(produto.beneficios||[])
            ].join(" "));
            if(!prefs.termos.some(token=>texto.includes(normalizar(token)))) return false;
        }
        return true;
    }).length;

    const diagnosticarRestricao = () => {
        const base={...estado.preferencias,
            termos:[...(estado.preferencias.termos||[])],
            excluirTipos:[...(estado.preferencias.excluirTipos||[])],
            excluirCategorias:[...(estado.preferencias.excluirCategorias||[])]
        };
        const candidatos=[];

        const testar=(rotulo,alterar,aplicar)=>{
            const copia={...base,
                termos:[...base.termos],
                excluirTipos:[...base.excluirTipos],
                excluirCategorias:[...base.excluirCategorias]
            };
            alterar(copia);
            const quantidade=contarComPreferencias(copia);
            if(quantidade>0) candidatos.push({rotulo,quantidade,aplicar});
        };

        if(base.orcamento) testar(
            `ampliar o orçamento de ${moeda(base.orcamento)}`,
            p=>{p.orcamento=null;},
            ()=>{estado.preferencias.orcamento=null;}
        );
        if(base.tipo) testar(
            `aceitar outros formatos além de ${base.tipo}`,
            p=>{p.tipo="";},
            ()=>{estado.preferencias.tipo="";}
        );
        if(base.vegana===true) testar(
            "retirar o filtro vegano",
            p=>{p.vegana=null;},
            ()=>{estado.preferencias.vegana=null;}
        );
        if(base.semGluten===true) testar(
            "retirar o filtro sem glúten",
            p=>{p.semGluten=null;},
            ()=>{estado.preferencias.semGluten=null;}
        );
        if(base.categoria) testar(
            "procurar em outras categorias",
            p=>{p.categoria="";},
            ()=>{estado.preferencias.categoria="";}
        );
        if(base.termos.length) testar(
            "ampliar os termos da busca",
            p=>{p.termos=[];},
            ()=>{estado.preferencias.termos=[];}
        );
        if(base.excluirTipos.length) testar(
            "reconsiderar os formatos excluídos",
            p=>{p.excluirTipos=[];},
            ()=>{estado.preferencias.excluirTipos=[];}
        );

        candidatos.sort((a,b)=>b.quantidade-a.quantidade);
        return candidatos[0]||null;
    };

    const registrarResultados = (itens, contexto) => {
        estado.ultimosResultados = Array.isArray(itens) ? itens : [];
        estado.offsetResultados = 0;
        estado.contextoResultados = contexto || "Encontrei estas opções";
        if (!estado.ultimosResultados.length) {
            const sugestao=diagnosticarRestricao();
            if(sugestao){
                adicionarMensagem(`Não encontrei uma opção que atenda a todos os critérios ao mesmo tempo. O ponto que mais restringe a busca parece ser este: ${sugestao.rotulo}. Se eu flexibilizar somente isso, encontro aproximadamente ${sugestao.quantidade} opção${sugestao.quantidade===1?"":"ões"}.`);
                adicionarAcoes([
                    {texto:`Sim, ${sugestao.rotulo}`,acao:()=>{
                        sugestao.aplicar();
                        const novos=filtrarComPreferencias();
                        registrarResultados(novos,"Ampliei somente o critério que estava restringindo a busca");
                    }},
                    {texto:"Manter meus critérios",acao:()=>adicionarMensagem("Certo. Vou manter suas preferências como estão. Se desejar, podemos tentar outra categoria ou falar com a equipe.")}
                ]);
            }else{
                adicionarMensagem("Não encontrei uma opção que atenda bem a todos os critérios ao mesmo tempo. Podemos rever as preferências ou procurar em outra direção.");
                const acoes=[{ texto: "Limpar preferências", valor: "limpar preferencias" }];
                if (quizAtivo()) acoes.push({ texto: "Responder ao quiz", acao: () => { fecharChat(); irQuiz(); } });
                acoes.push({ texto: "Falar com a equipe", acao: () => adicionarWhatsAppNoChat() });
                adicionarAcoes(acoes);
            }
            return;
        }
        mostrarPaginaResultados(true);

        if (estado.ultimosResultados.length > 1) {
            const principal=produtoMaisCoerente(estado.ultimosResultados);
            const motivo=explicarEscolha(principal);
            if(principal && motivo){
                definirProdutoContexto(principal);
                adicionarMensagem(`Para começar, eu sugiro observar ${principal.nome}. ${motivo}`);
                adicionarAcoes([
                    { texto:"Entender esta sugestão", acao:()=>adicionarMensagem(explicarEscolha(principal,{comparacao:true})) },
                    { texto:"Comparar com outra opção", valor:`comparar ${principal.nome} com ` }
                ]);
            }
        }
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
        if (estado.preferencias.excluirTipos?.length) partes.push(`sem ${estado.preferencias.excluirTipos.join("/")}`);
        if (estado.preferencias.excluirCategorias?.length) partes.push(`fora de ${estado.preferencias.excluirCategorias.map(id=>estado.categorias.find(c=>c.id===id)?.nome||id).join("/")}`);
        if (estado.preferencias.orcamento) partes.push(`até ${moeda(estado.preferencias.orcamento)}`);
        if (estado.preferencias.prioridade==="preco") partes.push("priorizando menor preço");
        return partes.join(" + ");
    };

    const detectarCategoria = (termo) => estado.categorias.find((item) => {
        const nome = normalizar(item.nome);
        const id = normalizar(item.id);
        const partes = nome.split(/\s+/).filter((parte) => parte.length > 2 && !["dos", "das", "com", "para"].includes(parte));
        return termo.includes(nome) || termo.includes(id) || partes.some((parte) => termo.includes(parte));
    });

    const atualizarPreferencias = (termo) => {
        const nlu=MaxNLU.extrair(termo);
        termo=nlu.texto || termo;
        const categoria = detectarCategoria(termo);
        const orcamento=nlu.orcamento ?? extrairOrcamento(termo);
        if(orcamento!==null) estado.preferencias.orcamento=orcamento;
        if(nlu.prioridade) estado.preferencias.prioridade=nlu.prioridade;
        else if(/mais barato|menor preco|menor preço|economizar|mais em conta|preco mais baixo|preço mais baixo/.test(termo)) {
            estado.preferencias.prioridade="preco";
        }
        if (categoria) estado.preferencias.categoria = categoria.id;

        if (nlu.vegana===true || /vegano|vegana|veganos|veganas/.test(termo)) estado.preferencias.vegana = true;
        if (nlu.semGluten===true || /sem gluten|sem glúten/.test(termo)) estado.preferencias.semGluten = true;

        estado.preferencias.excluirTipos ||= [];
        estado.preferencias.excluirCategorias ||= [];
        const negarCapsula=/(?:nao quero|não quero|menos|sem)\s+(?:em\s+)?capsulas?|capsulas?\s+nao/.test(termo);
        const negarPo=/(?:nao quero|não quero|menos|sem)\s+(?:em\s+)?po\b/.test(termo);
        const negarLiquido=/(?:nao quero|não quero|menos|sem)\s+liquidos?/.test(termo);
        const negarCha=/(?:nao quero|não quero|menos)\s+(?:um\s+)?cha\b/.test(termo);
        if(negarCapsula && !estado.preferencias.excluirTipos.includes("capsula")) estado.preferencias.excluirTipos.push("capsula");
        if(negarPo && !estado.preferencias.excluirTipos.includes("po")) estado.preferencias.excluirTipos.push("po");
        if(negarLiquido && !estado.preferencias.excluirTipos.includes("liquido")) estado.preferencias.excluirTipos.push("liquido");
        if(negarCha && !estado.preferencias.excluirTipos.includes("cha")) estado.preferencias.excluirTipos.push("cha");
        if(/qualquer formato|tanto faz o formato|sem preferencia de formato|sem preferência de formato/.test(termo)) estado.preferencias.tipo="";

        if (!negarCapsula && /capsula|cápsula|capsulas|cápsulas/.test(termo)) estado.preferencias.tipo = "capsula";
        else if (!negarPo && /(^|\s)po($|\s)|(^|\s)pó($|\s)|em po|em pó/.test(termo)) estado.preferencias.tipo = "po";
        else if (!negarLiquido && /liquido|líquido/.test(termo)) estado.preferencias.tipo = "liquido";
        else if (!negarCha && /(^|\s)cha($|\s)|(^|\s)chá($|\s)/.test(termo)) estado.preferencias.tipo = "cha";

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


    const nomeCategoria = produto =>
        estado.categorias.find(c => c.id === produto?.categoria)?.nome || produto?.categoria || "";

    const criteriosAtendidos = (produto) => {
        if (!produto) return [];
        const criterios=[];
        if (estado.preferencias.categoria && produto.categoria===estado.preferencias.categoria) {
            criterios.push(`está na categoria ${nomeCategoria(produto)}`);
        }
        if (estado.preferencias.tipo && normalizar(produto.tipo)===normalizar(estado.preferencias.tipo)) {
            criterios.push(`tem o formato ${produto.tipo}`);
        }
        if (estado.preferencias.vegana===true && produto.vegana===true) criterios.push("é cadastrado como vegano");
        if (estado.preferencias.semGluten===true && produto.sem_gluten===true) criterios.push("é cadastrado como sem glúten");

        const texto=normalizar([
            produto.nome,produto.copy,produto.descricao,produto.tipo,
            ...(produto.tags||[]),...(produto.beneficios||[])
        ].join(" "));
        const termos=(estado.preferencias.termos||[])
            .filter(t=>texto.includes(normalizar(t)))
            .slice(0,3);
        if(termos.length) criterios.push(`combina com ${termos.join(", ")}`);

        return criterios;
    };

    const explicarEscolha = (produto, {comparacao=false}={}) => {
        if(!produto) return "";
        const criterios=criteriosAtendidos(produto);
        const partes=[];
        if(criterios.length){
            partes.push(`Considerei as preferências que você informou. Este produto ${criterios.join("; ")}.`);
        }else{
            const cat=nomeCategoria(produto);
            const ben=(produto.beneficios||[]).filter(Boolean).slice(0,2);
            if(cat) partes.push(`Ele aparece no catálogo na categoria ${cat}.`);
            if(ben.length) partes.push(`Os destaques cadastrados são ${ben.join(" e ")}.`);
        }
        if(estado.preferencias.orcamento && Number(produto.preco)>0 && Number(produto.preco)<=Number(estado.preferencias.orcamento)){
            partes.push(`fica dentro do orçamento aproximado de ${moeda(estado.preferencias.orcamento)}`);
        }
        if(estado.preferencias.prioridade==="preco" && produto.preco){
            partes.push("também considerei que você pediu atenção especial ao preço");
        }
        if(produto.preco){
            partes.push(`O preço aproximado informado é ${precoTexto(produto)}.`);
        }
        if(comparacao){
            partes.push("A melhor opção depende do que é mais importante para você: formato, características, quantidade ou preço.");
        }
        return partes.join(" ");
    };

    const produtoMaisCoerente = (lista) => {
        if(!Array.isArray(lista)||!lista.length) return null;
        const pontuados=lista.map(produto=>{
            let pontos=criteriosAtendidos(produto).length*3;
            if(produto.destaque) pontos+=1;
            if(Number(produto.preco)>0) pontos+=0.25;
            return {produto,pontos};
        }).sort((a,b)=>b.pontos-a.pontos || Number(a.produto.preco||Infinity)-Number(b.produto.preco||Infinity));
        return pontuados[0]?.produto||lista[0];
    };


    const carrinhoTotal = () => estado.carrinho.reduce((total,item)=>total + Number(item.subtotal||0),0);

    const itemCarrinho = produto => estado.carrinho.find(i=>String(i.id)===String(produto?.id));

    const atualizarCarrinho = (produto, quantidade=1) => {
        if(!produto) return false;
        const base=Number(produto.quantidade_base||1);
        let qtd=Math.max(base,Number(quantidade)||base);
        if(produto.venda_tipo==="peso") qtd=Math.round(qtd/100)*100;
        else qtd=Math.max(1,Math.round(qtd));
        const subtotal=Number(produto.preco||0)*(qtd/base);
        const existente=itemCarrinho(produto);
        if(existente){ existente.quantidade=qtd; existente.subtotal=subtotal; }
        else estado.carrinho.push({id:produto.id,nome:produto.nome,slug:produto.slug,preco:Number(produto.preco||0),apresentacao:produto.apresentacao||"",venda_tipo:produto.venda_tipo||"unidade",quantidade:qtd,subtotal});
        return true;
    };

    const removerCarrinho = produto => {
        if(!produto) return false;
        const antes=estado.carrinho.length;
        estado.carrinho=estado.carrinho.filter(i=>String(i.id)!==String(produto.id));
        return estado.carrinho.length<antes;
    };

    const definirQuantidadeCarrinho = (produto, quantidade) => {
        if(!produto || !itemCarrinho(produto)) return false;
        return atualizarCarrinho(produto,quantidade);
    };

    const trocarItemCarrinho = (origem,destino,quantidade=null) => {
        if(!origem || !destino) return false;
        const atual=itemCarrinho(origem);
        if(!atual) return false;
        const qtd=quantidade ?? atual.quantidade;
        removerCarrinho(origem);
        atualizarCarrinho(destino,qtd);
        return true;
    };

    const diferencaParaOrcamento = limite => Number(limite||0)-carrinhoTotal();

    const respostaOrcamentoCarrinho = limite => {
        const diff=diferencaParaOrcamento(limite);
        if(diff>=0){
            return `Sua seleção está em ${moeda(carrinhoTotal())}. Ainda ficam aproximadamente ${moeda(diff)} dentro do limite de ${moeda(limite)}.`;
        }
        return `Sua seleção está em ${moeda(carrinhoTotal())}, aproximadamente ${moeda(Math.abs(diff))} acima do limite de ${moeda(limite)}.`;
    };

    const resumoCarrinho = () => {
        if(!estado.carrinho.length) return "Sua seleção está vazia.";
        const partes=estado.carrinho.map(i=>{
            const qtd=i.venda_tipo==="peso"?`${i.quantidade} g`:`${i.quantidade} ×`;
            return `${qtd} ${i.nome} — ${moeda(i.subtotal)}`;
        });
        return `${partes.join("; ")}. Total aproximado: ${moeda(carrinhoTotal())}.`;
    };

    const numeroFalado = valor => {
        const mapa={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10};
        const t=normalizar(valor);
        if(/^\d+$/.test(t)) return Number(t);
        return mapa[t]||null;
    };

    const detectarQuantidadePedido = (termo, produto) => {
        const t=normalizar(termo);
        if(produto?.venda_tipo==="peso"){
            const nome=normalizar(produto.nome).split(/\s+/).find(x=>x.length>3)||"";
            const rxNome=nome ? new RegExp(`(\\d{2,4})\\s*g(?:\\s+de)?[^,.]{0,25}\\b${nome}\\b|\\b${nome}\\b[^,.]{0,25}(\\d{2,4})\\s*g`) : null;
            const g=rxNome?.exec(t)||t.match(/\b(\d{2,4})\s*g\b/);
            if(g) return Number(g[1]||g[2]);
        }
        const tokens=normalizar(produto?.nome||"").split(/\s+/).filter(x=>x.length>3);
        const chave=tokens[0]||"";
        if(chave){
            const rx=new RegExp(`\\b(\\d{1,2}|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\\b[^,.]{0,22}\\b${chave}\\b`);
            const m=t.match(rx);
            if(m){ const n=numeroFalado(m[1]); if(n) return n; }
        }
        return Number(produto?.quantidade_base||1);
    };

    const produtoReferenciadoParaPedido = termo => {
        const pos=produtoPorPosicao(termo);
        if(pos) return pos;
        const direto=produtoPorNome(termo) || produtosMencionados(termo)[0];
        return direto || produtoContextual();
    };

    const responderBeneficios = termo => {
        const t=normalizar(termo), promo=window.QualimaxPromocoes, config=window.QualimaxConfig||{};
        if(!promo) return false;
        const itens=(estado.carrinho||[]).map(item=>{
            const p=estado.produtos.find(x=>String(x.id)===String(item.id));
            if(!p)return null;
            const base=Number(p.quantidade_base||1), quantidade=Number(item.quantidade||base);
            return {...p,quantidade,subtotal:Number(p.preco||0)*(quantidade/base)};
        }).filter(Boolean);

        const codigo=(String(termo).toUpperCase().match(/\b[A-Z0-9_-]{4,30}\b/g)||[])
            .find(x=>(config.promocoes?.cupons||[]).some(c=>String(c.codigo).toUpperCase()===x));

        if(/\b(?:tem cupom|quais cupons|cupom disponivel|cupons disponiveis)\b/.test(t)){
            const cupons=(config.promocoes?.cupons||[]).filter(c=>c.ativo!==false);
            adicionarMensagem(cupons.length
                ? `Nesta demonstração, os cupons disponíveis são: ${cupons.map(c=>`${c.codigo} — ${c.descricao}`).join(" ")}`
                : "Não há cupons promocionais ativos neste momento.");
            return true;
        }

        if(codigo && /\b(?:cupom|funciona|aplica|usar|use)\b/.test(t)){
            const r=promo.avaliarCupom(config,codigo,itens);
            adicionarMensagem(r.valido
                ? `O cupom ${r.codigo} é compatível com sua seleção atual e representa uma economia aproximada de ${moeda(r.desconto)}. Você poderá aplicá-lo no pré-atendimento.`
                : `O cupom ${codigo} não se aplica à seleção atual. ${r.motivo}`);
            return true;
        }

        if(/\b(?:frete gratis|frete grátis|quanto falta.*frete)\b/.test(t)){
            const r=promo.calcular(config,itens,{});
            if(!itens.length) adicionarMensagem(`O frete grátis está configurado a partir de ${moeda(config.promocoes?.freteGratis?.valorMinimo||0)} em produtos.`);
            else adicionarMensagem(r.freteGratis
                ? "Sua seleção já atingiu a condição de frete grátis. A equipe ainda confirma se o endereço está na área atendida."
                : `Faltam aproximadamente ${moeda(r.faltaFrete)} em produtos para atingir o frete grátis.`);
            return true;
        }

        if(/\b(?:quantos pontos|pontos vou ganhar|gera quantos pontos|ganho quantos pontos)\b/.test(t)){
            const r=promo.calcular(config,itens,{});
            adicionarMensagem(itens.length
                ? `Sua seleção atual pode gerar aproximadamente ${r.pontosGerados} Pontos Qualimax depois que a compra for confirmada pela loja.`
                : "Adicione produtos à seleção e eu calculo aproximadamente quantos pontos a compra poderá gerar.");
            return true;
        }

        if(/\b(?:melhor cupom|qual cupom.*melhor|economizo mais)\b/.test(t)){
            const codigos=(config.promocoes?.cupons||[]).filter(c=>c.ativo!==false).map(c=>c.codigo);
            const melhor=promo.melhorCupom(config,itens,codigos);
            adicionarMensagem(melhor
                ? `Para sua seleção atual, o melhor cupom disponível é ${melhor.codigo}, com economia aproximada de ${moeda(melhor.desconto)}${melhor.freteGratis?" e benefício de frete grátis":""}.`
                : "Nenhum dos cupons disponíveis atende às regras da sua seleção atual.");
            return true;
        }
        return false;
    };

    const responderCarrinho = (termo) => {
        const t=normalizar(termo);

        const limiteMatch=t.match(/\b(?:passou de|passa de|acima de|limite de|tenho|ate|até)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/);
        if(limiteMatch && estado.carrinho.length){
            const limite=Number(limiteMatch[1].replace(",","."));
            adicionarMensagem(respostaOrcamentoCarrinho(limite));
            if(carrinhoTotal()>limite){
                adicionarAcoes([{texto:"Procurar opção mais econômica",valor:"tem outra mais barata parecida com ela?"}]);
            }
            return true;
        }

        if(/\b(?:meu pedido|minha selecao|minha seleção|quanto ficou|qual o total|total do pedido)\b/.test(t)){
            adicionarMensagem(resumoCarrinho());
            if(estado.carrinho.length) adicionarAcoes([{texto:"Preparar atendimento",acao:()=>adicionarWhatsAppNoChat("Preparar atendimento","Carrinho do Max")}]);
            return true;
        }

        if(/\b(?:limpar|esvaziar)\s+(?:pedido|carrinho|selecao|seleção)\b/.test(t)){
            estado.carrinho=[];
            adicionarMensagem("Certo. Limpei sua seleção desta conversa.");
            return true;
        }

        const troca=t.match(/\b(?:troca|trocar|substitui|substituir)\s+(.+?)\s+(?:por|pelo|pela)\s+(.+)$/);
        if(troca){
            const origem=produtoPorNome(troca[1]) || produtosMencionados(troca[1])[0] || produtoContextual();
            const destino=produtoPorNome(troca[2]) || produtosMencionados(troca[2])[0];
            if(origem && destino && trocarItemCarrinho(origem,destino)){
                definirProdutoContexto(destino);
                adicionarMensagem(`Substituí ${origem.nome} por ${destino.nome}. ${resumoCarrinho()}`);
            }else{
                adicionarMensagem("Não consegui identificar com segurança os dois produtos da troca. Diga, por exemplo: “troque o cacau pelo mel”.");
            }
            return true;
        }

        const qtdDireta=t.match(/\b(?:deixa|coloca|ajusta|muda)\s+(?:para\s+)?(\d{1,2})\s+(?:unidades?\s+de\s+)?(.+)/);
        if(qtdDireta){
            const qtd=Number(qtdDireta[1]);
            const produto=produtoPorNome(qtdDireta[2]) || produtosMencionados(qtdDireta[2])[0] || produtoContextual();
            if(produto && definirQuantidadeCarrinho(produto,qtd)){
                adicionarMensagem(`Atualizei ${produto.nome} para ${qtd} unidade${qtd===1?"":"s"}. ${resumoCarrinho()}`);
            }else{
                adicionarMensagem("Esse produto ainda não está na sua seleção ou não consegui identificá-lo.");
            }
            return true;
        }

        const maisQtd=t.match(/\b(?:adiciona|coloca|inclui)\s+mais\s+(\d{1,2}|um|uma|dois|duas|tres|quatro|cinco)\s+(.+)/);
        if(maisQtd){
            const acrescimo=numeroFalado(maisQtd[1])||Number(maisQtd[1]);
            const produto=produtoPorNome(maisQtd[2]) || produtosMencionados(maisQtd[2])[0] || produtoContextual();
            const atual=produto ? itemCarrinho(produto) : null;
            if(produto && atual){
                const base=produto.venda_tipo==="peso" ? Number(produto.quantidade_base||100) : 1;
                const nova=Number(atual.quantidade||base)+(Number(acrescimo)||1)*base;
                atualizarCarrinho(produto,nova);
                adicionarMensagem(`Atualizei ${produto.nome}. ${resumoCarrinho()}`);
            }else{
                adicionarMensagem("Esse produto ainda não está na sua seleção. Se desejar, diga o nome do produto e a quantidade total.");
            }
            return true;
        }

        if(/\b(?:remove|remover|tira|tirar|retira|retirar)\b/.test(t)){
            const produto=produtoReferenciadoParaPedido(t);
            if(produto && removerCarrinho(produto)) adicionarMensagem(`${produto.nome} foi removido da sua seleção. ${resumoCarrinho()}`);
            else adicionarMensagem("Não encontrei esse item na sua seleção atual.");
            return true;
        }

        if(/\b(?:coloca|adiciona|adicionar|inclui|incluir|quero levar|vou levar)\b/.test(t)){
            const citados=produtosMencionados(t);
            const itens=citados.length?citados:[produtoReferenciadoParaPedido(t)].filter(Boolean);
            if(!itens.length) return false;
            itens.forEach(produto=>atualizarCarrinho(produto,detectarQuantidadePedido(t,produto)));
            adicionarMensagem(`Adicionei à sua seleção. ${resumoCarrinho()}`);
            return true;
        }
        return false;
    };
    const responderDecisionEngine = (termo) => {
        if(!MaxDecision) return false;
        const contexto=MaxDecision.contextoPagina(estado.produtos);
        estado.contextoPagina=contexto;

        if(contexto?.tipo==="produto" && contexto.produto && /^(?:esse|essa|este|esta|isso|ele)\b/.test(termo)){
            definirProdutoContexto(contexto.produto);
        }

        const ambiguo=MaxDecision.detectarAmbiguidade(termo,estado.produtos);
        if(ambiguo.ambigua){
            const confianca=MaxDecision.avaliarConfianca({
                texto:termo,intencao:MaxIntencoes.detectar(termo),candidatos:ambiguo.candidatos,preferencias:estado.preferencias
            });
            estado.confiancaAtual=confianca;
            adicionarMensagem(`Encontrei mais de uma possibilidade para “${ambiguo.termo}”. Para não escolher por você, qual delas quis dizer?`);
            adicionarAcoes(ambiguo.candidatos.slice(0,6).map(p=>({texto:p.nome,valor:p.nome})));
            return true;
        }

        const conflito=MaxDecision.sugestaoConflito(estado.preferencias);
        if(conflito){
            adicionarMensagem(`${conflito.mensagem} Qual preferência devo manter?`);
            if(conflito.tipo==="formato"){
                adicionarAcoes([
                    {texto:`Quero ${conflito.valor}`,acao:()=>{
                        estado.preferencias.excluirTipos=estado.preferencias.excluirTipos.filter(x=>x!==normalizar(conflito.valor));
                        adicionarMensagem(`Certo. Vou manter ${conflito.valor} como formato desejado.`);
                    }},
                    {texto:`Quero evitar ${conflito.valor}`,acao:()=>{
                        estado.preferencias.tipo="";
                        adicionarMensagem(`Certo. Vou evitar ${conflito.valor}.`);
                    }}
                ]);
            }else{
                adicionarAcoes([{texto:"Rever preferências",valor:"o que você entendeu"}]);
            }
            return true;
        }

        const candidatos=filtrarComPreferencias().slice(0,8);
        const confianca=MaxDecision.avaliarConfianca({
            texto:termo,
            intencao:MaxIntencoes.detectar(termo),
            candidatos,
            preferencias:estado.preferencias
        });
        estado.confiancaAtual=confianca;

        if(confianca.nivel==="baixa" && MaxIntencoes.detectar(termo)==="busca" && termo.length<35){
            adicionarMensagem(`Quero ter certeza de que entendi. ${confianca.motivo}. Você pode dizer uma categoria, característica ou faixa de preço?`);
            adicionarAcoes([
                {texto:"Ver categorias",valor:"categorias"},
                {texto:"Tenho um orçamento",valor:"tenho até 50 reais"},
                {texto:"Não sei o que escolher",valor:"não sei o que escolher"}
            ]);
            return true;
        }
        return false;
    };
    const responderConflitosAtuais = () => {
        if(!MaxDecision) return false;
        const conflitos=MaxDecision.conflitos(estado.preferencias);
        if(!conflitos.length) return false;
        adicionarMensagem(`${conflitos[0]} Para continuar, diga qual preferência devo manter.`);
        return true;
    };

    const filtrarComPreferencias = () => {
        return estado.produtos
            .map((produto) => {
                if (estado.preferencias.categoria && produto.categoria !== estado.preferencias.categoria) return null;
                if (estado.preferencias.tipo && normalizar(produto.tipo) !== normalizar(estado.preferencias.tipo)) return null;
                if (estado.preferencias.vegana === true && produto.vegana !== true) return null;
                if (estado.preferencias.semGluten === true && produto.sem_gluten !== true) return null;
                if (estado.preferencias.excluirTipos?.includes(normalizar(produto.tipo))) return null;
                if (estado.preferencias.excluirCategorias?.includes(produto.categoria)) return null;
                if (estado.produtosRejeitados?.includes(String(produto.id))) return null;
                if (estado.preferencias.orcamento && Number(produto.preco)>Number(estado.preferencias.orcamento)) return null;

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
                if (estado.produtosGostei?.includes(String(produto.id))) pontos += 3;
                if (estado.produtosTalvez?.includes(String(produto.id))) pontos += 1;
                return { produto, pontos };
            })
            .filter(Boolean)
            .filter(({ pontos }) => !estado.preferencias.termos.length || pontos > 0)
            .sort((a, b) => {
                if(estado.preferencias.prioridade==="preco"){
                    return b.pontos-a.pontos || Number(a.produto.preco||Infinity)-Number(b.produto.preco||Infinity);
                }
                return b.pontos - a.pontos || Number(b.produto.destaque) - Number(a.produto.destaque);
            })
            .map(({ produto }) => produto);
    };

    const limparPreferencias = () => {
        const carrinho=[...(estado.carrinho||[])];
        const gostei=[...(estado.produtosGostei||[])];
        const talvez=[...(estado.produtosTalvez||[])];
        const naoGostei=[...(estado.produtosNaoGostei||[])];
        estado.preferencias = { categoria: "", tipo: "", vegana: null, semGluten: null, termos: [], excluirTipos: [], excluirCategorias: [], orcamento:null, prioridade:"" };
        estado.ultimosResultados = [];
        estado.offsetResultados = 0;
        estado.contextoResultados = "";
        MaxCore.limparMemoriaConversa(estado);
        estado.carrinho=carrinho;
        estado.produtosGostei=gostei;
        estado.produtosTalvez=talvez;
        estado.produtosNaoGostei=naoGostei;
        estado.produtosRejeitados=[...naoGostei];
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
        adicionarMensagem("Vamos descobrir juntos. Escolha uma categoria ou, se preferir, responda ao quiz.");
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
        registrarResultados([produto], `Estas são as informações de ${produto.nome}`);
        const beneficios = Array.isArray(produto.beneficios) ? produto.beneficios.filter(Boolean).slice(0, 3) : [];
        const categoria=nomeCategoria(produto);
        const partes=[];
        if(categoria) partes.push(`Ele está cadastrado em ${categoria}.`);
        if(produto.tipo) partes.push(`O formato informado é ${produto.tipo}.`);
        if(beneficios.length) partes.push(`No catálogo, os principais destaques são ${beneficios.join(", ")}.`);
        if(produto.preco) partes.push(`O preço aproximado é ${precoTexto(produto)}.`);
        partes.push("Se desejar, posso comparar esta opção com outra e explicar as diferenças com calma.");
        adicionarMensagem(partes.join(" "));
        adicionarAcoes([
            { texto: "Comparar com outro produto", valor: `comparar ${produto.nome} com ` },
            { texto: "Ver produtos semelhantes", acao: () => {
                const similares = similaresAoProduto(produto, 6);
                registrarResultados(similares, `Encontrei alternativas semelhantes a ${produto.nome}`);
            }},
            { texto: "Preparar atendimento", acao: () => adicionarWhatsAppNoChat("Preparar atendimento",produto.nome) }
        ]);
    };

    const compararProdutos = (itens) => {
        if (!Array.isArray(itens) || itens.length < 2) return false;
        const [a,b] = itens;
        estado.ultimaComparacao=[a,b];
        definirProdutoContexto(b);
        estado.ultimaIntencao = "comparar";
        const catA = nomeCategoria(a) || "categoria não informada";
        const catB = nomeCategoria(b) || "categoria não informada";
        const benA = (a.beneficios || []).slice(0,3).join(", ") || "sem destaques cadastrados";
        const benB = (b.beneficios || []).slice(0,3).join(", ") || "sem destaques cadastrados";
        const precoA=a.preco?precoTexto(a):"preço sob consulta";
        const precoB=b.preco?precoTexto(b):"preço sob consulta";

        adicionarMensagem(`Vamos comparar com calma. ${a.nome}: categoria ${catA}, destaques ${benA}, preço aproximado ${precoA}. ${b.nome}: categoria ${catB}, destaques ${benB}, preço aproximado ${precoB}.`);

        if(Number(a.preco)>0 && Number(b.preco)>0){
            if(Number(a.preco)<Number(b.preco)){
                adicionarMensagem(`${a.nome} tem o menor preço-base entre os dois. Isso não significa que seja automaticamente a melhor escolha, porque apresentação e quantidade também precisam ser consideradas.`);
            }else if(Number(b.preco)<Number(a.preco)){
                adicionarMensagem(`${b.nome} tem o menor preço-base entre os dois. Isso não significa que seja automaticamente a melhor escolha, porque apresentação e quantidade também precisam ser consideradas.`);
            }else{
                adicionarMensagem("Os dois têm o mesmo preço-base aproximado no catálogo.");
            }
        }

        const preferido=produtoMaisCoerente([a,b]);
        if(preferido && criteriosAtendidos(preferido).length){
            adicionarMensagem(`Pelas preferências que você informou nesta conversa, ${preferido.nome} combina melhor com os critérios atuais. ${explicarEscolha(preferido,{comparacao:true})}`);
        }else{
            adicionarMensagem("Se me disser o que pesa mais para você — preço, formato ou alguma característica específica — eu consigo organizar melhor essa comparação.");
        }

        const area = mensagens();
        if (area) {
            const grupo=document.createElement("div");
            grupo.className="chat-produtos";
            grupo.append(criarCardProduto(a), criarCardProduto(b));
            area.append(grupo);
            rolarFim();
        }
        adicionarAcoes([
            {texto:"Quero priorizar preço",valor:`qual tem menor preço entre ${a.nome} e ${b.nome}`},
            {texto:"Preparar atendimento",acao:()=>adicionarWhatsAppNoChat("Preparar atendimento")}
        ]);
        return true;
    };

    const responderSobreLoja = (termo) => {
        const cfg = window.QualimaxConfig || {};
        const empresa = cfg.empresa || {};
        const contato = cfg.contato || {};
        if (/endereco|endereço|onde fica|localizacao|localização|como chegar/.test(termo)) {
            adicionarMensagem(contato.endereco ? `Claro. A loja fica em ${contato.endereco}.` : "O endereço ainda não está disponível por aqui.");
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

    const aplicarContextoPaginaAoEstado = () => {
        if(!MaxDecision) return;
        const contexto=MaxDecision.contextoPagina(estado.produtos);
        estado.contextoPagina=contexto;

        if(contexto?.tipo==="produto" && contexto.produto){
            definirProdutoContexto(contexto.produto);
            return;
        }

        if(contexto?.tipo==="catalogo" && contexto.temFiltros){
            const f=contexto.filtros||{};
            if(f.categoria && estado.categorias.some(c=>c.id===f.categoria)) estado.preferencias.categoria=f.categoria;
            if(f.tipo) estado.preferencias.tipo=f.tipo;
            if(["vegano","vegana"].includes(f.caracteristica)) estado.preferencias.vegana=true;
            if(["sem_gluten","sem-gluten"].includes(f.caracteristica)) estado.preferencias.semGluten=true;
            if(f.busca){
                estado.preferencias.termos=[...new Set(f.busca.split(/\s+/).filter(x=>x.length>1))].slice(0,5);
            }
        }
    };

    const responderContextoDaPagina = (termo) => {
        const t=normalizar(termo);
        const contexto=estado.contextoPagina || MaxDecision?.contextoPagina?.(estado.produtos);
        if(!contexto) return false;

        if(contexto.tipo==="produto" && contexto.produto && /\b(?:esse produto|esta pagina|esta página|esse aqui|este aqui|ele|isso)\b/.test(t)){
            definirProdutoContexto(contexto.produto);
            if(/\b(?:preco|preço|valor|custa)\b/.test(t)){
                adicionarMensagem(`${contexto.produto.nome} está com preço aproximado de ${precoTexto(contexto.produto)}.`);
            }else{
                explicarProduto(contexto.produto);
            }
            return true;
        }

        if(contexto.tipo==="catalogo" && contexto.temFiltros && /\b(?:o que estou vendo|meus filtros|filtros atuais|o que filtrei|essa busca|esta busca)\b/.test(t)){
            const f=contexto.filtros||{};
            const partes=[];
            if(f.busca) partes.push(`busca por “${f.busca}”`);
            if(f.categoria) partes.push(`categoria ${estado.categorias.find(c=>c.id===f.categoria)?.nome||f.categoria}`);
            if(f.tipo) partes.push(`formato ${f.tipo}`);
            if(f.caracteristica) partes.push(f.caracteristica.replace(/_/g," "));
            if(f.preco) partes.push(`faixa ${f.preco}`);
            adicionarMensagem(partes.length
                ? `Neste catálogo, você está usando ${partes.join(", ")}. Posso continuar a conversa a partir desses filtros.`
                : "O catálogo está sem filtros específicos neste momento.");
            return true;
        }
        return false;
    };

    const iniciarDescobertaGuiada = () => {
        estado.etapaDescoberta = "objetivo";
        estado.preferencias = { categoria:"", tipo:"", vegana:null, semGluten:null, termos:[], excluirTipos:[], excluirCategorias:[], orcamento:null, prioridade:"" };
        estado.ultimosResultados = [];
        estado.offsetResultados = 0;
        estado.contextoResultados = "";
        estado.produtosRejeitados = [];
        adicionarMensagem("Vamos por partes, com tranquilidade. Primeiro, diga o tipo de produto que procura ou algo que seja importante para você. Depois eu posso refinar por formato, características e orçamento.");
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

    const responderEtapaGuiada = (termo) => {
        if(estado.etapaDescoberta==="inicio") return false;

        if(estado.etapaDescoberta==="objetivo"){
            atualizarPreferencias(termo);
            if(responderConflitosAtuais()) return true;
            const resultados=filtrarComPreferencias();
            if(!resultados.length) return false;

            estado.etapaDescoberta="refino";
            registrarResultados(resultados,`Encontrei ${resultados.length} opções para começarmos`);
            adicionarMensagem("Para eu refinar melhor: existe alguma característica importante, algum formato que você prefira evitar ou um valor aproximado que gostaria de gastar?");
            adicionarAcoes([
                {texto:"Quero priorizar preço",valor:"quero o mais em conta"},
                {texto:"Sem preferência de formato",valor:"qualquer formato"},
                {texto:"Pode mostrar assim",valor:"pode mostrar assim"}
            ]);
            return true;
        }

        if(estado.etapaDescoberta==="refino"){
            if(/^(?:pode mostrar assim|assim esta bom|assim está bom|nao tenho preferencia|não tenho preferência|tanto faz)$/.test(termo)){
                estado.etapaDescoberta="concluida";
                adicionarMensagem("Certo. Vou manter os critérios atuais. Se depois quiser mudar alguma coisa, basta me dizer.");
                return true;
            }
            atualizarPreferencias(termo);
            if(responderConflitosAtuais()) return true;
            const resultados=filtrarComPreferencias();
            estado.etapaDescoberta="concluida";
            registrarResultados(resultados,`Refinei a seleção com as informações que você acrescentou`);
            return true;
        }
        return false;
    };

    const responderComparacaoContextual = (termo) => {
        const itens=estado.ultimaComparacao || [];
        if(itens.length<2) return false;
        const [a,b]=itens;
        if(/\b(?:mais barato|menor preco|mais em conta)\b/.test(termo)){
            const pa=Number(a.preco)||Infinity, pb=Number(b.preco)||Infinity;
            const escolhido=pa<=pb?a:b;
            adicionarMensagem(`${escolhido.nome} tem o menor preço-base aproximado entre os dois. Ainda assim, vale observar apresentação e quantidade antes de comparar o custo real.`);
            definirProdutoContexto(escolhido);
            return true;
        }
        if(/\b(?:qual dos dois|qual deles|entre os dois|desses dois|qual e melhor)\b/.test(termo)){
            const escolhido=produtoMaisCoerente(itens);
            adicionarMensagem(`Considerando apenas os critérios que você informou nesta conversa, eu começaria por ${escolhido.nome}. ${explicarEscolha(escolhido,{comparacao:true})}`);
            definirProdutoContexto(escolhido);
            return true;
        }
        return false;
    };

    const responderCorrecao = (termo) => {
        if(!/\b(?:na verdade|corrigindo|quis dizer|melhor dizendo)\b/.test(termo)) return false;
        const limpo=termo.replace(/\b(?:na verdade|corrigindo|quis dizer|melhor dizendo)\b[:,]?\s*/,"").trim();
        if(!limpo) return false;
        adicionarMensagem("Entendi a correção. Vou considerar a informação mais recente.");
        atualizarPreferencias(limpo);
        const resultados=filtrarComPreferencias();
        registrarResultados(resultados,`Atualizei a busca com a sua correção`);
        return true;
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

        if (intencao === "preferencias") {
            const resumo=resumoPreferencias();
            adicionarMensagem(resumo ? `Até aqui eu entendi: ${resumo}. Você pode acrescentar ou remover critérios na próxima mensagem.` : "Ainda não tenho preferências suficientes desta busca. Me diga uma categoria, formato ou característica e eu organizo para você.");
            adicionarAcoes([{texto:"Nova busca",valor:"nova busca"},{texto:"Ver categorias",valor:"categorias"}]);
            estado.ultimaIntencao="preferencias";
            return true;
        }

        if (intencao === "explicacao") {
            const produto=produtoContextual();
            if(produto){
                adicionarMensagem(`Claro. Vou explicar de forma simples. ${explicarEscolha(produto,{comparacao:true})}`);
            }else{
                adicionarMensagem("Ainda não tenho um produto em contexto para explicar. Se você escolher ou mencionar uma opção, eu conto quais critérios usei para destacá-la.");
            }
            estado.ultimaIntencao="explicacao";
            return true;
        }

        if (intencao === "loja") {
            const tratada = responderSobreLoja(termo);
            if (tratada) estado.ultimaIntencao = "loja";
            return tratada;
        }

        if (intencao === "categorias") {
            adicionarMensagem("Claro. Escolha uma categoria e eu continuo a busca com você:");
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
                : "Vamos comparar. Diga o nome de dois produtos do catálogo.");
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
            adicionarMensagem("Claro. Se preferir falar com uma pessoa da equipe, eu preparo o caminho para você.");
            adicionarWhatsAppNoChat();
            estado.ultimaIntencao = "humano";
            return true;
        }

        if (intencao === "entrega") {
            adicionarMensagem("As condições de entrega podem variar. A equipe confirma a área atendida, o prazo e os detalhes para você.");
            adicionarWhatsAppNoChat("Consultar entrega pelo WhatsApp");
            estado.ultimaIntencao = "entrega";
            return true;
        }

        if (intencao === "preco") {
            const mencionados=produtosMencionados(termo);
            const produto=mencionados[0]||produtoContextual();
            const orcamento=extrairOrcamento(termo);
            if(orcamento!==null){
                estado.preferencias.orcamento=orcamento;
                estado.preferencias.prioridade="preco";
                const opcoes=estado.produtos.filter(p=>Number(p.preco)>0 && Number(p.preco)<=orcamento)
                    .sort((a,b)=>Number(a.preco)-Number(b.preco)).slice(0,8);
                if(opcoes.length){
                    adicionarMensagem(`Com até ${moeda(orcamento)}, encontrei ${opcoes.length} opções para você explorar. Os valores são aproximados e a equipe confirma o total final.`);
                    registrarResultados(opcoes,`Opções até ${moeda(orcamento)}`);
                }else adicionarMensagem(`Não encontrei no catálogo uma opção com preço aproximado de até ${moeda(orcamento)}. Posso tentar outra faixa.`);
            }else if(produto){
                definirProdutoContexto(produto);
                adicionarMensagem(`${produto.nome} está com preço aproximado de ${precoTexto(produto)}. A equipe confirma disponibilidade e valor final antes do pedido.`);
                adicionarAcoes([{texto:"Preparar pedido",acao:()=>adicionarWhatsAppNoChat("Preparar pedido",produto.nome)}]);
            }else{
                const baratos=[...estado.produtos].filter(p=>Number(p.preco)>0).sort((a,b)=>Number(a.preco)-Number(b.preco)).slice(0,6);
                adicionarMensagem("Agora eu também conheço os preços aproximados do catálogo. Posso mostrar opções por orçamento ou informar o valor de um produto.");
                registrarResultados(baratos,"Algumas opções com preços mais acessíveis");
            }
            estado.ultimaIntencao = "preco";
            return true;
        }

        if (intencao === "quiz") {
            if (!quizAtivo()) {
                adicionarMensagem("O quiz não está disponível neste momento, mas eu posso continuar ajudando você pelo catálogo.");
                adicionarAcoes([{ texto: "Explorar catálogo", acao: () => { fecharChat(); irCatalogo(); } }]);
            } else {
                adicionarMensagem("Certo. Vou abrir o quiz para você.");
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
            adicionarMensagem(`${saudacaoLocal()}! É muito bom receber você por aqui. Conte o que está procurando, mesmo que ainda não tenha certeza, e eu ajudo a organizar as opções.`);
            adicionarAcoes([
                { texto: "Quero encontrar um produto", acao: responderAjudaEscolha },
                { texto: "Ver categorias", acao: () => {
                    adicionarMensagem("Perfeito. Escolha uma categoria e começamos por ela:");
                    adicionarAcoes(estado.categorias.slice(0, 6).map(c => ({ texto: c.nome, valor: c.nome })));
                }}
            ]);
            return;
        }

        if (/^(obrigado|obrigada|valeu|vlw|brigado|brigada|show|perfeito)[!. ]*$/.test(termo)) {
            if (mostrarUsuario) adicionarMensagem(original, "usuario");
            adicionarMensagem("Foi um prazer ajudar. Quando quiser conhecer outra opção ou tirar uma dúvida, estarei por aqui.");
            return;
        }

        if (/^(ajuda|me ajuda|o que voce faz|o que você faz|como funciona)[?!. ]*$/.test(termo)) {
            if (mostrarUsuario) adicionarMensagem(original, "usuario");
            adicionarMensagem("Eu ajudo você a conhecer o catálogo com mais tranquilidade. Posso procurar produtos, organizar preferências, comparar opções, informar preços aproximados e encaminhar você para a equipe quando desejar.");
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
            adicionarMensagem("Certo. Vou abrir sua área local.");
            fecharChat();
            window.setTimeout(() => { location.href = "conta.html"; }, 120);
            return;
        }

        if (mostrarUsuario) adicionarMensagem(original, "usuario");
        registrarConsulta(original);

        if (responderHorarioLocal(termo)) return;
        if (responderContextoDaPagina(termo)) return;
        if (responderAfinidade(termo)) return;
        if (responderModoPresente(termo)) return;
        if (responderBeneficios(termo)) return;
        if (responderCarrinho(termo)) return;
        if (responderCorrecao(termo)) return;

        if(consultaComplexa(termo) && (
            /(?:mais barata|mais em conta).*(?:parecida|semelhante|como ela|como ele)/.test(termo) ||
            /(?:qual dos dois|qual deles|entre os dois|desses dois)/.test(termo)
        )){
            return executarComProcessamento(termo,()=>{
                if(responderReferenciaSemantica(termo)) return;
                if(responderComparacaoContextual(termo)) return;
                responderDecisionEngine(termo);
            });
        }

        if (responderReferenciaSemantica(termo)) return;
        if (responderComparacaoContextual(termo)) return;
        if (responderDecisionEngine(termo)) return;

        const intencaoAtual=MaxIntencoes.detectar(termo);
        if(consultaComplexa(termo)){
            return executarComProcessamento(termo,()=>{
                if (intencaoAtual==="busca" && responderEtapaGuiada(termo)) return;
                if (executarIntencao(termo)) return;
                atualizarPreferencias(termo);
                if(responderConflitosAtuais()) return;
                const resultados=filtrarComPreferencias();
                const resumo=resumoPreferencias();
                registrarResultados(resultados,resumo ? `Encontrei ${resultados.length} opções compatíveis com ${resumo}` : `Encontrei ${resultados.length} opções relacionadas ao que você pediu`);
            });
        }
        if (intencaoAtual==="busca" && responderEtapaGuiada(termo)) return;
        if (executarIntencao(termo)) return;

        if (/^(oi|ola|olá|bom dia|boa tarde|boa noite|hey)\b/.test(termo)) {
            adicionarMensagem(`${saudacaoLocal()}! Pode escrever do seu jeito. Você pode mencionar um produto, uma categoria ou simplesmente dizer o que gostaria de encontrar. Eu organizo a busca para você.`);
            adicionarAcoes([
                { texto: "Encontrar um produto", valor: "quero encontrar um produto" },
                { texto: "Não sei o que escolher", valor: "não sei o que escolher" },
                { texto: "Minhas escolhas", valor: "minhas escolhas" }
            ]);
            return;
        }

        if (/limpar preferencias|limpar preferências|recomecar|recomeçar|nova busca/.test(termo)) {
            limparPreferencias();
            adicionarMensagem("Tudo certo. Limpei os critérios anteriores. Podemos começar uma nova busca.");
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
                adicionarMensagem("Claro. Vou abrir as opções que você salvou.");
                fecharChat();
                window.setTimeout(() => window.QualimaxColecoes.abrirDialogo(), 0);
            } else {
                adicionarMensagem("Suas escolhas ficam disponíveis no catálogo. Vou encaminhar você até lá.");
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
        if(responderConflitosAtuais()) return;
        const resultados = filtrarComPreferencias();
        const resumo = resumoPreferencias();

        if (resultados.length) {
            registrarResultados(
                resultados,
                resumo ? `Encontrei ${resultados.length} opções compatíveis com ${resumo}` :
                    `Encontrei ${resultados.length} opções relacionadas ao que você pediu`
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

        adicionarMensagem("Não encontrei uma opção que atenda bem a todos esses critérios. Se desejar, posso retirar algum filtro e ampliar a busca.");
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
            if(MaxDecision){
                aplicarContextoPaginaAoEstado();
            }
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
            adicionarMensagem("Não consegui carregar o catálogo neste momento. Se preferir, você ainda pode continuar pelo atendimento da equipe.");
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
                adicionarMensagem("Escolhe um caminho para começar e eu vou refinando com você:");
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
            adicionarMensagem("A conversa foi limpa. O que você gostaria de procurar agora?");
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
