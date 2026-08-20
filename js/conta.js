(() => {
"use strict";

const PERFIL_KEY = "qualimax-conta-local-v3";
const getPerfil = () => {
    try { return JSON.parse(localStorage.getItem(PERFIL_KEY) || "{}"); }
    catch { return {}; }
};
const setPerfil = (perfil) => {
    try {
        localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
        return true;
    } catch {
        return false;
    }
};
const removerPerfil = () => {
    try { localStorage.removeItem(PERFIL_KEY); return true; }
    catch { return false; }
};
const baixar = (nome, conteudo, tipo="application/json") => {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = nome;
    document.body.append(a); a.click(); a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),500);
};
const arquivoSeguro = v => /^[A-Za-z0-9._-]+$/.test(String(v||"")) ? String(v) : "";

const esperarConfig = () => new Promise(resolve => {
    if (window.QualimaxConfig) return resolve(window.QualimaxConfig);
    const timer=setTimeout(()=>resolve(window.QualimaxConfig||{}),1200);
    document.addEventListener("qualimax:config-ready",e=>{clearTimeout(timer);resolve(e.detail||{});},{once:true});
});

const criarCard = (produto, rotulo="") => {
    const a=document.createElement("a");
    a.className="conta-produto-card";
    const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(produto.slug||"")?produto.slug:"";
    a.href=slug?`produto/${slug}.html`:"catalogo.html";
    const img=document.createElement("img");
    const arq=arquivoSeguro(produto.imagem);
    if(arq){ img.src=`img/thumbs/${arq}`; img.alt=""; img.loading="lazy"; img.addEventListener("error",()=>img.remove());}
    const box=document.createElement("div");
    if(rotulo){ const small=document.createElement("small"); small.textContent=rotulo; box.append(small); }
    const strong=document.createElement("strong"); strong.textContent=produto.nome||"Produto";
    const span=document.createElement("span"); span.textContent=produto.copy||produto.descricao||"Conheça esta opção.";
    box.append(strong,span);
    if(arq) a.append(img);
    a.append(box);
    return a;
};

document.addEventListener("DOMContentLoaded", async () => {
    const perfil=getPerfil();
    const form=document.querySelector("[data-conta-form]");
    if(form){
        form.nome.value=perfil.nome||"";
        form.email.value=perfil.email||"";
        form.telefone.value=perfil.telefone||"";
        form.addEventListener("submit",e=>{
            e.preventDefault();
            const novo={
                nome:String(form.nome.value||"").trim().slice(0,80),
                email:String(form.email.value||"").trim().slice(0,254),
                telefone:String(form.telefone.value||"").trim().slice(0,30),
                atualizadoEm:Date.now()
            };
            const salvo=setPerfil(novo);
            const s=document.querySelector("[data-conta-status]");
            if(s) s.textContent=salvo
                ? "Dados salvos neste navegador."
                : "O navegador bloqueou o armazenamento local. Seus dados não foram salvos.";
        });
    }

    document.querySelector("[data-conta-limpar-perfil]")?.addEventListener("click",()=>{
        const removido=removerPerfil();
        if(form && removido) form.reset();
        const s=document.querySelector("[data-conta-status]");
        if(s) s.textContent=removido ? "Perfil local removido." : "Não foi possível remover o perfil local.";
    });

    let produtos=[];
    try {
        const r=await fetch("data/produtos.json",{cache:"no-store"});
        if(r.ok) produtos=(await r.json()).produtos||[];
    } catch {}

    const map=new Map(produtos.map(p=>[Number(p.id),p]));
    const config=await esperarConfig();
    const colecoesAtivas=config.recursos?.colecoes!==false;

    document.querySelectorAll("[data-conta-colecoes]").forEach(el=>{el.hidden=!colecoesAtivas;});
    if(!colecoesAtivas){
        document.querySelectorAll('.conta-menu a[href="#favoritos"], .conta-menu a[href="#lista"]').forEach(el=>{el.hidden=true;});
    }

    if(window.QualimaxDB){
        await window.QualimaxDB.init?.();
        const [favs,lista,hist]=await Promise.all([
            window.QualimaxDB.getFavoritos(),
            window.QualimaxDB.getInteresse(),
            window.QualimaxDB.getHistorico()
        ]);

        const render=(itens,sel,vazioSel,contadorSel,rotuloFn=()=> "")=>{
            const box=document.querySelector(sel);
            const vazio=document.querySelector(vazioSel);
            const contador=document.querySelector(contadorSel);
            const pares=itens.map(item=>({item,produto:map.get(Number(item.produtoId))})).filter(x=>x.produto);
            if(box) box.replaceChildren(...pares.map(({produto,item})=>criarCard(produto,rotuloFn(item))));
            if(vazio) vazio.hidden=pares.length>0;
            if(contador) contador.textContent=String(pares.length);
            return pares.map(x=>x.produto);
        };

        const favProds=colecoesAtivas ? render(favs.sort((a,b)=>(b.atualizadoEm||0)-(a.atualizadoEm||0)),
            "[data-conta-favoritos]","[data-conta-favoritos-vazio]","[data-conta-favoritos-contador]") : [];
        const listaProds=colecoesAtivas ? render(lista.sort((a,b)=>(b.atualizadoEm||0)-(a.atualizadoEm||0)),
            "[data-conta-lista]","[data-conta-lista-vazio]","[data-conta-lista-contador]") : [];
        render(hist.sort((a,b)=>(b.vistoEm||0)-(a.vistoEm||0)).slice(0,8),
            "[data-conta-recentes]","[data-conta-recentes-vazio]",null,()=> "Visto recentemente");

        const numero=String(config.contato?.whatsapp||"").replace(/\D/g,"");
        const wa=document.querySelector("[data-conta-whatsapp]");
        if(wa && numero && listaProds.length){
            wa.href="atendimento.html?origem=conta&assunto=Fazer%20um%20pedido";
            wa.removeAttribute("target");
            wa.removeAttribute("rel");
            wa.hidden=false;
        }

        document.querySelector("[data-conta-exportar]")?.addEventListener("click",async()=>{
            const dados={
                exportadoEm:new Date().toISOString(),
                perfil:getPerfil(),
                favoritos:(await window.QualimaxDB.getFavoritos()).map(x=>x.produtoId),
                lista:(await window.QualimaxDB.getInteresse()).map(x=>x.produtoId),
                historico:(await window.QualimaxDB.getHistorico()).map(x=>({produtoId:x.produtoId,vistoEm:x.vistoEm}))
            };
            baixar("minha-conta-qualimax.json",JSON.stringify(dados,null,2));
            const s=document.querySelector("[data-conta-privacidade-status]");
            if(s) s.textContent="Arquivo com seus dados locais exportado.";
        });

        document.querySelector("[data-conta-apagar-tudo]")?.addEventListener("click",async()=>{
            if(!confirm("Apagar perfil, favoritos, lista e histórico deste navegador?")) return;
            removerPerfil();
            await Promise.all([
                window.QualimaxDB.limparFavoritos(),
                window.QualimaxDB.limparInteresse(),
                window.QualimaxDB.limparHistorico()
            ]);
            if(form) form.reset();
            for(const sel of ["[data-conta-favoritos]","[data-conta-lista]","[data-conta-recentes]"]){
                document.querySelector(sel)?.replaceChildren();
            }
            document.querySelector("[data-conta-favoritos-vazio]")?.removeAttribute("hidden");
            document.querySelector("[data-conta-lista-vazio]")?.removeAttribute("hidden");
            document.querySelector("[data-conta-recentes-vazio]")?.removeAttribute("hidden");
            const favCount=document.querySelector("[data-conta-favoritos-contador]");if(favCount)favCount.textContent="0";
            const listCount=document.querySelector("[data-conta-lista-contador]");if(listCount)listCount.textContent="0";
            const wa=document.querySelector("[data-conta-whatsapp]");if(wa)wa.hidden=true;
            const s=document.querySelector("[data-conta-privacidade-status]");
            if(s) s.textContent="Dados locais apagados deste navegador.";
        });
    }
});
})();