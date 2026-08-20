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
const lerSessao = chave => {
    try { return JSON.parse(sessionStorage.getItem(chave) || "{}"); }
    catch { return {}; }
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
    const maxContexto=lerSessao(MAX_CONTEXTO_KEY);
    const quizContexto=lerSessao("qualimax-atendimento-quiz-v1");

    const config=await esperarConfig();
    const empresa=config.empresa||{};
    const contato=config.contato||{};
    document.title=`Preparar atendimento | ${empresa.nome||"Loja"}`;
    if(origemEl) origemEl.textContent=origemAmigavel(origem);

    let produtos=[];
    try{
        const r=await fetch("data/produtos.json",{cache:"no-store"});
        if(r.ok) produtos=(await r.json()).produtos||[];
    }catch{}

    const porId=new Map(produtos.map(p=>[Number(p.id),p]));
    const selecionados=new Set();
    const sugeridos=new Set();

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
    for(const nome of ["cep","rua","numero","complemento","bairro","cidade","estado"]){
        if(form.elements[nome] && lembrado[nome]) form.elements[nome].value=limparTexto(lembrado[nome],140);
    }
    if(Object.keys(lembrado).length) form.elements.lembrar.checked=true;

    if(assuntoParam){
        const option=[...form.elements.assunto.options].find(o=>o.value.toLowerCase()===assuntoParam.toLowerCase());
        if(option) form.elements.assunto.value=option.value;
    }

    const criarProduto = (produto,marcado,fonte) => {
        const label=document.createElement("label");
        label.className="atendimento-produto-item";
        const check=document.createElement("input");
        check.type="checkbox";check.value=String(produto.id);check.checked=marcado;
        check.dataset.atendimentoProduto=String(produto.id);
        const box=document.createElement("span");
        const strong=document.createElement("strong");strong.textContent=produto.nome;
        const small=document.createElement("small");small.textContent=fonte;
        box.append(strong,small);label.append(check,box);
        return label;
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
        .map(el=>porId.get(Number(el.value))).filter(Boolean);

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
            const cidade=limparTexto(form.elements.cidade.value,100);
            const estado=limparTexto(form.elements.estado.value,2).toUpperCase();
            const cep=limparTexto(form.elements.cep.value,10);
            linhas.push("","ENDEREÇO PARA CONSULTAR ENTREGA");
            if(rua) linhas.push(`${rua}${numero?`, ${numero}`:""}`);
            if(complemento) linhas.push(`Complemento: ${complemento}`);
            if(bairro) linhas.push(`Bairro: ${bairro}`);
            if(cidade||estado) linhas.push([cidade,estado].filter(Boolean).join(" - "));
            if(cep) linhas.push(`CEP: ${cep}`);
        }

        if(itens.length){
            linhas.push("","PRODUTOS / INTERESSES");
            itens.forEach(p=>linhas.push(`• ${p.nome}`));
        }

        linhas.push("","ASSUNTO",assunto||"Atendimento pelo site");

        if(observacao) linhas.push("","OBSERVAÇÃO",observacao);

        const prefs=preferenciasMax();
        if(prefs.length){
            linhas.push("","PREFERÊNCIAS INFORMADAS NO MAX");
            prefs.forEach(x=>linhas.push(`• ${x}`));
        }

        linhas.push("","ORIGEM DO ATENDIMENTO",origemAmigavel(origem));
        linhas.push("","Pode confirmar disponibilidade, valores e as condições aplicáveis?");

        return linhas.join("\n").replace(/\n{3,}/g,"\n\n").trim();
    };

    function atualizarResumo(){
        const qtd=produtosMarcados().length;
        if(contador) contador.textContent=`${qtd} ${qtd===1?"selecionado":"selecionados"}`;
        if(recebimentoEl) recebimentoEl.textContent=recebimentoTexto();
        if(preview && document.activeElement!==preview) preview.value=montarMensagem();
    }

    const alternarEndereco=()=>{
        const entrega=form.elements.recebimento.value==="entrega";
        enderecoBox.hidden=!entrega;
        for(const nome of ["rua","numero","bairro","cidade","estado"]){
            form.elements[nome].required=entrega;
        }
        atualizarResumo();
    };

    form.addEventListener("input",atualizarResumo);
    form.addEventListener("change",e=>{
        if(e.target.name==="recebimento") alternarEndereco();
        if(e.target.matches("[data-atendimento-produto]")){
            const id=Number(e.target.value);
            if(e.target.checked) selecionados.add(id); else selecionados.delete(id);
        }
        atualizarResumo();
    });

    document.querySelector("[data-atendimento-limpar-produtos]")?.addEventListener("click",()=>{
        selecionados.clear();
        document.querySelectorAll("[data-atendimento-produto]").forEach(el=>{el.checked=false;});
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

    form.addEventListener("submit",e=>{
        e.preventDefault();
        if(!form.reportValidity()){
            status.textContent="Confira os campos obrigatórios antes de continuar.";
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
            for(const campo of ["nome","telefone","email","cep","rua","numero","complemento","bairro","cidade","estado"]){
                dados[campo]=limparTexto(form.elements[campo].value,254);
            }
            if(!salvarLocal(LEMBRAR_KEY,dados)){
                status.textContent="Não foi possível salvar seus dados neste navegador, mas você ainda pode continuar.";
            }
        }else{
            removerLocal(LEMBRAR_KEY);
        }

        const mensagem=limparTexto(preview.value||montarMensagem(),5000);
        if(!mensagem){
            status.textContent="A mensagem está vazia.";
            return;
        }
        const url=`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
        const nova=window.open(url,"_blank","noopener,noreferrer");
        if(!nova){
            status.textContent="O navegador bloqueou a nova aba. Permita pop-ups para continuar no WhatsApp.";
            return;
        }
        status.textContent="WhatsApp aberto em uma nova aba. Confira a conversa e envie quando quiser.";
    });

    renderProdutos();
    alternarEndereco();
    atualizarResumo();
});
})();