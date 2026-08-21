(() => {
"use strict";

const PERFIL_KEY = "qualimax-conta-local-v3";
const LEMBRAR_KEY = "qualimax-atendimento-dados-v1";
const MAX_CONTEXTO_KEY = "qualimax-atendimento-max-v1";

const limparTexto = (valor, limite=1000) =>
    String(valor ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"").trim().slice(0,limite);

const slugSeguro = valor => {
    const slug=String(valor||"").trim();
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : "";
};

const lerLocal = chave => {
    try { return JSON.parse(localStorage.getItem(chave) || "{}"); }
    catch { return {}; }
};
const salvarLocal = (chave,valor) => {
    try { localStorage.setItem(chave,JSON.stringify(valor)); return true; }
    catch { return false; }
};
const removerLocal = chave => {
    try { localStorage.removeItem(chave); } catch {}
};
const lerSessao = (chave, validadeMs=30*60*1000) => {
    try {
        const valor=JSON.parse(sessionStorage.getItem(chave) || "{}");
        if(valor?.em && Date.now()-Number(valor.em)>validadeMs){
            sessionStorage.removeItem(chave);
            return {};
        }
        return valor && typeof valor==="object" ? valor : {};
    } catch { return {}; }
};

const esperarConfig = () => new Promise(resolve => {
    if (window.QualimaxConfig) return resolve(window.QualimaxConfig);
    const timer=setTimeout(()=>resolve(window.QualimaxConfig||{}),1200);
    document.addEventListener("qualimax:config-ready",e=>{
        clearTimeout(timer); resolve(e.detail||window.QualimaxConfig||{});
    },{once:true});
});

const normalizarNumero = valor => String(valor||"").replace(/\D/g,"");

const origemAmigavel = origem => ({
    max:"Max",
    produto:"Página de produto",
    catalogo:"Catálogo",
    conta:"Minha Conta",
    home:"Página inicial",
    contato:"Contato",
    quiz:"Quiz",
    sobre:"Sobre"
}[origem] || "Site");

document.addEventListener("DOMContentLoaded", async () => {
    const form=document.querySelector("[data-atendimento-form]");
    if(!form) return;

    const status=document.querySelector("[data-atendimento-status]");
    const preview=document.querySelector("[data-atendimento-preview]");
    const produtosBox=document.querySelector("[data-atendimento-produtos]");
    const vazio=document.querySelector("[data-atendimento-produtos-vazio]");
    const contador=document.querySelector("[data-atendimento-contador]");
    const origemEl=document.querySelector("[data-atendimento-origem]");
    const recebimentoEl=document.querySelector("[data-atendimento-recebimento]");
    const enderecoBox=document.querySelector("[data-atendimento-endereco]");

    const params=new URLSearchParams(location.search);
    const origem=limparTexto(params.get("origem")||"site",30).toLowerCase();
    const produtoSlug=slugSeguro(params.get("produto"));
    const assuntoParam=limparTexto(params.get("assunto"),80);
    // Contextos de jornada só devem ser reaproveitados quando a origem corresponde.
    // Isso evita que uma conversa antiga do Max contamine um atendimento iniciado pela Home, Conta ou Catálogo.
    const maxContexto=origem==="max" ? lerSessao(MAX_CONTEXTO_KEY) : {};
    const quizContexto=origem==="quiz" ? lerSessao("qualimax-atendimento-quiz-v1") : {};

    const config=await esperarConfig();
    const empresa=config.empresa||{};
    const contato=config.contato||{};
    document.title=`Preparar atendimento | ${empresa.nome||"Loja"}`;
    if(origemEl) origemEl.textContent=origemAmigavel(origem);

    const cepStatus=document.querySelector("[data-atendimento-cep-status]");
    const normalizarLocalidade=valor=>String(valor||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
    const enderecoResolvido={cep:"",rua:"",bairro:"",cidade:"",estado:"",valido:false};
    let cepTimer=null;
    let cepController=null;

    const formatarCep=valor=>{
        const numeros=String(valor||"").replace(/\D/g,"").slice(0,8);
        return numeros.length>5?`${numeros.slice(0,5)}-${numeros.slice(5)}`:numeros;
    };

    const limparEnderecoCep=(mensagem="")=>{
        enderecoResolvido.cep="";enderecoResolvido.rua="";enderecoResolvido.bairro="";enderecoResolvido.cidade="";enderecoResolvido.estado="";enderecoResolvido.valido=false;
        form.elements.rua.value="";form.elements.bairro.value="";
        form.elements.rua.readOnly=true;form.elements.bairro.readOnly=true;
        form.elements.rua.setAttribute("aria-readonly","true");form.elements.bairro.setAttribute("aria-readonly","true");
        if(cepStatus) cepStatus.textContent=mensagem;
    };

    const consultarCep=async cep=>{
        const numeros=String(cep||"").replace(/\D/g,"");
        if(numeros.length!==8){limparEnderecoCep("");return false;}
        cepController?.abort();
        cepController=new AbortController();
        const signal=cepController.signal;
        if(cepStatus) cepStatus.textContent="Consultando CEP…";
        form.elements.cep.setAttribute("aria-busy","true");
        try{
            let dados=null;
            try{
                const r=await fetch(`https://brasilapi.com.br/api/cep/v1/${numeros}`,{signal,headers:{Accept:"application/json"}});
                if(r.ok){
                    const v=await r.json();
                    dados={cep:v.cep,rua:v.street,bairro:v.neighborhood,cidade:v.city,estado:v.state};
                }
            }catch(e){ if(e?.name==="AbortError") throw e; }

            if(!dados){
                const r=await fetch(`https://viacep.com.br/ws/${numeros}/json/`,{signal,headers:{Accept:"application/json"}});
                if(r.ok){
                    const v=await r.json();
                    if(!v.erro) dados={cep:v.cep,rua:v.logradouro,bairro:v.bairro,cidade:v.localidade,estado:v.uf};
                }
            }

            if(!dados) throw new Error("CEP não encontrado");
            const cidadeLoja=normalizarLocalidade(empresa.cidade);
            const estadoLoja=normalizarLocalidade(empresa.estado);
            if(cidadeLoja && normalizarLocalidade(dados.cidade)!==cidadeLoja || estadoLoja && normalizarLocalidade(dados.estado)!==estadoLoja){
                limparEnderecoCep(`Este CEP fica em ${dados.cidade||"outra cidade"}/${dados.estado||""}. No momento, a entrega pelo site está configurada para ${empresa.cidade||"a cidade da loja"}/${empresa.estado||""}.`);
                return false;
            }

            enderecoResolvido.cep=dados.cep||formatarCep(numeros);
            enderecoResolvido.rua=limparTexto(dados.rua,140);
            enderecoResolvido.bairro=limparTexto(dados.bairro,100);
            enderecoResolvido.cidade=limparTexto(dados.cidade,100);
            enderecoResolvido.estado=limparTexto(dados.estado,2).toUpperCase();
            enderecoResolvido.valido=true;
            form.elements.rua.value=enderecoResolvido.rua;
            form.elements.bairro.value=enderecoResolvido.bairro;
            form.elements.cep.value=formatarCep(numeros);

            // CEPs gerais podem não trazer logradouro/bairro. Nesses casos, liberamos só os campos ausentes.
            form.elements.rua.readOnly=Boolean(enderecoResolvido.rua);
            form.elements.bairro.readOnly=Boolean(enderecoResolvido.bairro);
            form.elements.rua.setAttribute("aria-readonly",String(Boolean(enderecoResolvido.rua)));
            form.elements.bairro.setAttribute("aria-readonly",String(Boolean(enderecoResolvido.bairro)));
            if(cepStatus) cepStatus.textContent=enderecoResolvido.rua
                ? `Endereço encontrado: ${enderecoResolvido.rua}${enderecoResolvido.bairro?`, ${enderecoResolvido.bairro}`:""}. Agora informe número e complemento, se houver.`
                : "CEP encontrado. Complete os campos de endereço que não vieram preenchidos.";
            atualizarResumo();
            if(form.elements.numero) form.elements.numero.focus();
            return true;
        }catch(e){
            if(e?.name!=="AbortError") limparEnderecoCep("Não consegui consultar este CEP agora. Confira os números ou tente novamente em instantes.");
            return false;
        }finally{
            form.elements.cep.removeAttribute("aria-busy");
        }
    };

    form.elements.cep?.addEventListener("input",e=>{
        const formatado=formatarCep(e.target.value);
        if(e.target.value!==formatado) e.target.value=formatado;
        clearTimeout(cepTimer);
        limparEnderecoCep("");
        const numeros=formatado.replace(/\D/g,"");
        if(numeros.length===8) cepTimer=setTimeout(()=>consultarCep(numeros),350);
        atualizarResumo();
    });
    form.elements.cep?.addEventListener("blur",()=>{
        const numeros=form.elements.cep.value.replace(/\D/g,"");
        if(numeros.length===8 && !enderecoResolvido.valido) consultarCep(numeros);
    });

    let produtos=[];
    try{
        const r=await fetch("data/products.json",{cache:"no-store"});
        if(r.ok) produtos=(await r.json()).produtos||[];
    }catch{}

    const porId=new Map(produtos.map(p=>[Number(p.id),p]));
    const moeda=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    const selecionados=new Set();
    const sugeridos=new Set();
    const quantidadesMax=new Map();
    let cupomAplicado="";
    const PROMO=window.QualimaxPromocoes;
    const beneficiosEl={
        cupomStatus:document.querySelector("[data-atendimento-cupom-status]"),
        descontos:document.querySelector("[data-atendimento-descontos]"),
        pontosGerados:document.querySelector("[data-atendimento-pontos-gerados]"),
        freteTexto:document.querySelector("[data-frete-texto]"),
        freteBarra:document.querySelector("[data-frete-barra]")
    };

    if(produtoSlug){
        const p=produtos.find(x=>x.slug===produtoSlug);
        if(p) selecionados.add(Number(p.id));
    }

    if(window.QualimaxDB){
        await window.QualimaxDB.init?.();
        const [lista,favoritos]=await Promise.all([
            window.QualimaxDB.getInteresse?.()||[],
            window.QualimaxDB.getFavoritos?.()||[]
        ]);
        lista.forEach(x=>{if(porId.has(Number(x.produtoId))) selecionados.add(Number(x.produtoId));});
        favoritos.forEach(x=>{if(porId.has(Number(x.produtoId))) sugeridos.add(Number(x.produtoId));});
    }

    if(maxContexto?.produtoId && porId.has(Number(maxContexto.produtoId))){
        selecionados.add(Number(maxContexto.produtoId));
    }
    if(origem==="max" && Array.isArray(maxContexto?.carrinho)){
        maxContexto.carrinho.slice(0,20).forEach(item=>{
            const id=Number(item?.id);
            if(!porId.has(id)) return;
            selecionados.add(id);
            const produto=porId.get(id);
            const base=Number(produto.quantidade_base||1);
            let qtd=Math.max(base,Number(item.quantidade||base));
            qtd=produto.venda_tipo==="peso"?Math.round(qtd/100)*100:Math.round(qtd);
            quantidadesMax.set(id,qtd);
        });
    }
    if(origem==="quiz" && Array.isArray(quizContexto?.produtoIds)){
        quizContexto.produtoIds.forEach(id=>{
            if(porId.has(Number(id))) selecionados.add(Number(id));
        });
    }

    const perfil=lerLocal(PERFIL_KEY);
    const lembrado=lerLocal(LEMBRAR_KEY);
    const dadosIniciais={...lembrado,...perfil};
    for(const nome of ["nome","telefone","email"]){
        if(form.elements[nome] && dadosIniciais[nome]) form.elements[nome].value=limparTexto(dadosIniciais[nome],nome==="nome"?120:254);
    }
    for(const nome of ["cep","rua","numero","complemento","bairro"]){
        if(form.elements[nome] && lembrado[nome]) form.elements[nome].value=limparTexto(lembrado[nome],140);
    }
    if(Object.keys(lembrado).length) form.elements.lembrar.checked=true;

    if(assuntoParam){
        const option=[...form.elements.assunto.options].find(o=>o.value.toLowerCase()===assuntoParam.toLowerCase());
        if(option) form.elements.assunto.value=option.value;
    }

    const criarProduto = (produto,marcado,fonte) => {
        const item=document.createElement("div");
        item.className="atendimento-produto-item";

        const check=document.createElement("input");
        check.type="checkbox";
        check.value=String(produto.id);
        check.checked=marcado;
        check.dataset.atendimentoProduto=String(produto.id);
        check.id=`at-produto-${produto.id}`;

        const box=document.createElement("div");
        const nomeLabel=document.createElement("label");
        nomeLabel.htmlFor=check.id;
        nomeLabel.className="atendimento-produto-nome";
        const strong=document.createElement("strong");strong.textContent=produto.nome;
        nomeLabel.append(strong);

        const preco=document.createElement("small");
        preco.textContent=produto.preco ? `${moeda(produto.preco)}${produto.venda_tipo==="peso" ? ` / ${produto.apresentacao||"100 g"}` : ` • ${produto.apresentacao||"unidade"}`}` : "Preço sob consulta";
        const small=document.createElement("small");small.textContent=fonte;

        const controles=document.createElement("div");
        controles.className="produto-pedido-controles";
        const qId=`at-quantidade-${produto.id}`;
        const qLabel=document.createElement("label");
        qLabel.htmlFor=qId;
        qLabel.textContent=produto.venda_tipo==="peso" ? "Quantidade (g)" : "Quantidade";
        const q=document.createElement("input");
        q.id=qId;
        q.type="number";
        q.dataset.atendimentoQuantidade=String(produto.id);
        q.min=produto.venda_tipo==="peso"?"100":"1";
        q.max=produto.venda_tipo==="peso"?"5000":"20";
        q.step=String(produto.incremento||1);
        q.value=String(quantidadesMax.get(Number(produto.id))||produto.quantidade_base||1);
        q.disabled=!marcado;
        controles.append(qLabel,q);
        box.append(nomeLabel,preco,small,controles);
        item.append(check,box);
        return item;
    };

    const renderProdutos=()=>{
        const ids=[...new Set([...selecionados,...sugeridos])].filter(id=>porId.has(id));
        produtosBox.replaceChildren(...ids.map(id=>{
            const marcado=selecionados.has(id);
            const fonte=marcado?"Selecionado para o atendimento":"Favorito salvo — opcional";
            return criarProduto(porId.get(id),marcado,fonte);
        }));
        vazio.hidden=ids.length>0;
        atualizarResumo();
    };

    const produtosMarcados=()=>[...document.querySelectorAll("[data-atendimento-produto]:checked")]
        .map(el=>{
            const produto=porId.get(Number(el.value));
            if(!produto)return null;
            const input=document.querySelector(`[data-atendimento-quantidade="${produto.id}"]`);
            const base=Number(produto.quantidade_base||1);
            let quantidade=Math.max(base,Number(input?.value||base));
            if(produto.venda_tipo==="peso") quantidade=Math.round(quantidade/100)*100;
            else quantidade=Math.round(quantidade);
            const subtotal=Number(produto.preco||0)*(quantidade/base);
            return {...produto,quantidade,subtotal};
        }).filter(Boolean);

    const totalEstimado=()=>produtosMarcados().reduce((s,p)=>s+Number(p.subtotal||0),0);
    const beneficiosEstimados=()=>{
        const itens=produtosMarcados();
        if(!PROMO) return {subtotal:totalEstimado(),total:totalEstimado(),descontoCupom:0,descontoPontos:0,freteGratis:false,faltaFrete:0,pontosGerados:0};
        return PROMO.calcular(config,itens,{
            cupom:cupomAplicado,
            pontosUsar:Number(form.elements.pontos?.value||0)
        });
    };

    const recebimentoTexto=()=>({
        retirada:"Retirar na loja",
        entrega:"Receber em casa",
        confirmar:"Confirmar com a equipe"
    }[form.elements.recebimento.value]||"Confirmar com a equipe");

    const preferenciasMax=()=>{
        const pref=maxContexto?.preferencias||{};
        const itens=[];
        if(pref.categoria) itens.push(`categoria: ${limparTexto(pref.categoria,50)}`);
        if(pref.tipo) itens.push(`formato: ${limparTexto(pref.tipo,50)}`);
        if(pref.vegana===true) itens.push("vegano");
        if(pref.semGluten===true) itens.push("sem glúten");
        if(Array.isArray(pref.termos) && pref.termos.length){
            const termos=pref.termos.map(x=>limparTexto(x,40)).filter(Boolean).slice(0,6);
            if(termos.length) itens.push(`interesses: ${termos.join(", ")}`);
        }
        if(Array.isArray(pref.excluirTipos) && pref.excluirTipos.length){
            itens.push(`evitar formatos: ${pref.excluirTipos.map(x=>limparTexto(x,30)).filter(Boolean).join(", ")}`);
        }
        return itens;
    };

    const montarMensagem=()=>{
        const linhas=[];
        const nome=limparTexto(form.elements.nome.value,120);
        const telefone=limparTexto(form.elements.telefone.value,30);
        const email=limparTexto(form.elements.email.value,254);
        const assunto=limparTexto(form.elements.assunto.value,80);
        const observacao=limparTexto(form.elements.observacao.value,1000);
        const recebimento=form.elements.recebimento.value;
        const pagamento=limparTexto(form.elements.pagamento?.value||"Pix",40);
        const troco=limparTexto(form.elements.troco?.value||"",20);
        const itens=produtosMarcados();

        linhas.push(`Olá! Vim pelo site da ${empresa.nome||"loja"}.`,"");
        linhas.push("MEUS DADOS");
        linhas.push(`Nome: ${nome||"[preencher nome]"}`);
        if(telefone) linhas.push(`Telefone: ${telefone}`);
        if(email) linhas.push(`E-mail: ${email}`);
        linhas.push("");

        linhas.push("COMO QUERO RECEBER");
        linhas.push(recebimentoTexto());

        if(recebimento==="entrega"){
            const rua=limparTexto(form.elements.rua.value,140);
            const numero=limparTexto(form.elements.numero.value,20);
            const complemento=limparTexto(form.elements.complemento.value,80);
            const bairro=limparTexto(form.elements.bairro.value,100);
            const cidade=limparTexto(empresa.cidade,100);
            const estado=limparTexto(empresa.estado,2).toUpperCase();
            const cep=limparTexto(form.elements.cep.value,10);
            linhas.push("","ENDEREÇO PARA CONSULTAR ENTREGA");
            if(rua) linhas.push(`${rua}${numero?`, ${numero}`:""}`);
            if(complemento) linhas.push(`Complemento: ${complemento}`);
            if(bairro) linhas.push(`Bairro: ${bairro}`);
            if(cidade||estado) linhas.push([cidade,estado].filter(Boolean).join(" - "));
            if(cep) linhas.push(`CEP: ${cep}`);
        }

        if(itens.length){
            linhas.push("","MEU PEDIDO");
            itens.forEach(p=>{
                const qtd=p.venda_tipo==="peso" ? `${p.quantidade} g` : `${p.quantidade} ×`;
                const unit=p.venda_tipo==="peso" ? `${moeda(p.preco)} / ${p.apresentacao||"100 g"}` : `${moeda(p.preco)} cada`;
                linhas.push(`• ${p.nome} — ${qtd} — ${unit} — subtotal ${moeda(p.subtotal)}`);
            });
            const beneficios=beneficiosEstimados();
            linhas.push(`SUBTOTAL ESTIMADO: ${moeda(beneficios.subtotal)}`);
            if(beneficios.cupom?.valido) linhas.push(`Cupom ${beneficios.cupom.codigo}: -${moeda(beneficios.descontoCupom)}`);
            if(beneficios.pontosUsados) linhas.push(`Pontos demonstrativos usados: ${beneficios.pontosUsados} (-${moeda(beneficios.descontoPontos)})`);
            if(beneficios.freteGratis) linhas.push("Benefício de frete: FRETE GRÁTIS (sujeito à confirmação da área atendida)");
            linhas.push(`TOTAL ESTIMADO APÓS BENEFÍCIOS: ${moeda(beneficios.total)}`);
            linhas.push(`Esta compra pode gerar aproximadamente ${beneficios.pontosGerados} Pontos Qualimax após a confirmação.`);
            linhas.push("Valores, disponibilidade, frete e benefícios são confirmados pela loja.");
        }

        linhas.push("","FORMA DE PAGAMENTO",pagamento);
        if(pagamento==="Dinheiro em espécie" && troco) linhas.push(`Troco para: ${troco}`);

        linhas.push("","ASSUNTO",assunto||"Atendimento pelo site");

        if(observacao) linhas.push("","OBSERVAÇÃO",observacao);

        const prefs=preferenciasMax();
        if(prefs.length){
            linhas.push("","PREFERÊNCIAS INFORMADAS NO MAX");
            prefs.forEach(x=>linhas.push(`• ${x}`));
        }

        linhas.push("","ORIGEM DO ATENDIMENTO",origemAmigavel(origem));
        linhas.push("","Pode confirmar disponibilidade, total final e as condições aplicáveis?");

        return linhas.join("\n").replace(/\n{3,}/g,"\n\n").trim();
    };

    function atualizarResumo(){
        const qtd=produtosMarcados().length;
        if(contador) contador.textContent=`${qtd} ${qtd===1?"selecionado":"selecionados"}`;
        if(recebimentoEl) recebimentoEl.textContent=recebimentoTexto();
        const pagamento=form.elements.pagamento?.value||"Pix";
        const pagEl=document.querySelector("[data-atendimento-pagamento]");
        if(pagEl) pagEl.textContent=pagamento;
        const beneficios=beneficiosEstimados();
        const total=moeda(beneficios.total);
        const totalBox=document.querySelector("[data-atendimento-total] strong");
        const totalResumo=document.querySelector("[data-atendimento-total-resumo]");
        if(totalBox) totalBox.textContent=total;
        if(totalResumo) totalResumo.textContent=total;
        if(beneficiosEl.descontos){
            const partes=[];
            if(beneficios.descontoCupom) partes.push(`Cupom: -${moeda(beneficios.descontoCupom)}`);
            if(beneficios.descontoPontos) partes.push(`Pontos: -${moeda(beneficios.descontoPontos)}`);
            beneficiosEl.descontos.textContent=partes.join(" · ");
        }
        if(beneficiosEl.pontosGerados) beneficiosEl.pontosGerados.textContent=`Pode gerar aproximadamente ${beneficios.pontosGerados} pontos após confirmação da compra.`;
        const minimo=Number(config.promocoes?.freteGratis?.valorMinimo||0);
        if(beneficiosEl.freteBarra){
            beneficiosEl.freteBarra.max=Math.max(1,minimo);
            beneficiosEl.freteBarra.value=Math.min(minimo,beneficios.subtotal);
            beneficiosEl.freteBarra.textContent=`${moeda(beneficios.subtotal)} de ${moeda(minimo)}`;
        }
        if(beneficiosEl.freteTexto){
            beneficiosEl.freteTexto.textContent=beneficios.freteGratis
                ? "Você atingiu a condição de frete grátis. A equipe confirma a área atendida."
                : minimo>0 && beneficios.subtotal>0
                    ? `Faltam ${moeda(beneficios.faltaFrete)} para atingir o frete grátis.`
                    : `Frete grátis em compras a partir de ${moeda(minimo)}.`;
        }
        const trocoBox=document.querySelector("[data-atendimento-troco]");
        if(trocoBox) trocoBox.hidden=pagamento!=="Dinheiro em espécie";
        if(preview && document.activeElement!==preview) preview.value=montarMensagem();
    }

    const alternarEndereco=()=>{
        const entrega=form.elements.recebimento.value==="entrega";
        enderecoBox.hidden=!entrega;
        for(const nome of ["cep","rua","numero","bairro"]){
            form.elements[nome].required=entrega;
        }

        if(!entrega){
            cepController?.abort();
            form.elements.cep.removeAttribute("aria-busy");
        }else{
            const numeros=form.elements.cep.value.replace(/\D/g,"");
            if(numeros.length===8 && !enderecoResolvido.valido){
                consultarCep(numeros);
            }
        }
        atualizarResumo();
    };

    document.querySelector("[data-atendimento-aplicar-cupom]")?.addEventListener("click",()=>{
        const codigo=String(form.elements.cupom?.value||"").trim();
        if(!codigo){
            cupomAplicado="";
            if(beneficiosEl.cupomStatus) beneficiosEl.cupomStatus.textContent="Cupom removido.";
            atualizarResumo();
            return;
        }
        const resultado=PROMO?.avaliarCupom(config,codigo,produtosMarcados());
        if(resultado?.valido){
            cupomAplicado=resultado.codigo;
            form.elements.cupom.value=resultado.codigo;
            if(beneficiosEl.cupomStatus) beneficiosEl.cupomStatus.textContent=`Cupom ${resultado.codigo} aplicado. Economia estimada: ${moeda(resultado.desconto)}.`;
        }else{
            cupomAplicado="";
            if(beneficiosEl.cupomStatus) beneficiosEl.cupomStatus.textContent=resultado?.motivo||"Não foi possível validar esse cupom.";
        }
        atualizarResumo();
    });

    form.addEventListener("input",atualizarResumo);
    form.addEventListener("change",e=>{
        if(e.target.name==="recebimento") alternarEndereco();
        if(e.target.matches("[data-atendimento-produto]")){
            const id=Number(e.target.value);
            if(e.target.checked) selecionados.add(id); else selecionados.delete(id);
            const quantidade=document.querySelector(`[data-atendimento-quantidade="${id}"]`);
            if(quantidade) quantidade.disabled=!e.target.checked;
        }
        atualizarResumo();
    });

    document.querySelector("[data-atendimento-limpar-produtos]")?.addEventListener("click",()=>{
        selecionados.clear();
        document.querySelectorAll("[data-atendimento-produto]").forEach(el=>{
            el.checked=false;
            const quantidade=document.querySelector(`[data-atendimento-quantidade="${el.value}"]`);
            if(quantidade) quantidade.disabled=true;
        });
        atualizarResumo();
        status.textContent="Seleção de produtos limpa.";
    });

    document.querySelector("[data-atendimento-copiar]")?.addEventListener("click",async()=>{
        const texto=preview.value.trim();
        try{
            await navigator.clipboard.writeText(texto);
            status.textContent="Mensagem copiada.";
        }catch{
            preview.focus();preview.select();
            status.textContent="Selecione o texto e use o comando de copiar do seu dispositivo.";
        }
    });

    // Não usamos submit nativo: se o JavaScript falhar/desativar,
    // dados pessoais nunca são serializados para a URL pelo navegador.
    form.addEventListener("submit",e=>e.preventDefault());
    document.querySelector("[data-atendimento-enviar]")?.addEventListener("click",()=>{
        if(!form.reportValidity()){
            status.textContent="Confira os campos obrigatórios antes de continuar.";
            return;
        }
        if(form.elements.recebimento.value==="entrega" && !enderecoResolvido.valido){
            status.textContent="Consulte um CEP válido da área de entrega antes de continuar.";
            form.elements.cep.focus();
            return;
        }
        const numero=normalizarNumero(contato.whatsapp);
        if(!numero){
            status.textContent="O WhatsApp da loja não está configurado.";
            return;
        }

        const nome=limparTexto(form.elements.nome.value,120);
        if(nome.split(/\s+/).filter(Boolean).length<2){
            status.textContent="Informe seu nome completo para agilizar o atendimento.";
            form.elements.nome.focus();
            return;
        }

        if(form.elements.lembrar.checked){
            const dados={};
            for(const campo of ["nome","telefone","email","cep","rua","numero","complemento","bairro"]){
                dados[campo]=limparTexto(form.elements[campo].value,254);
            }
            if(!salvarLocal(LEMBRAR_KEY,dados)){
                status.textContent="Não foi possível salvar seus dados neste navegador, mas você ainda pode continuar.";
            }
        }else{
            removerLocal(LEMBRAR_KEY);
        }

        const mensagem=limparTexto(montarMensagem(),5000);
        preview.value=mensagem;
        if(!mensagem){
            status.textContent="A mensagem está vazia.";
            return;
        }
        const url=`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
        const link=document.createElement("a");
        link.href=url;
        link.target="_blank";
        link.rel="noopener noreferrer";
        link.hidden=true;
        document.body.append(link);
        link.click();
        link.remove();
        status.textContent="WhatsApp solicitado em uma nova aba. Confira a conversa e envie quando quiser.";
    });

    renderProdutos();
    alternarEndereco();
    atualizarResumo();
});
})();