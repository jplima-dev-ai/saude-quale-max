(() => {
    "use strict";
    document.addEventListener("DOMContentLoaded", async () => {
        const grid=document.querySelector("[data-categorias-grid]");
        if (!grid) return;
        try {
            const resposta=await fetch("./data/categories.json");
            if (!resposta.ok) throw new Error("Falha ao carregar categorias.");
            const dados=await resposta.json();
            const categorias=Array.isArray(dados.categorias)?dados.categorias:[];
            grid.replaceChildren(...categorias.map((cat)=>{
                const article=document.createElement("article"); article.className="categoria-card";
                const img=document.createElement("img"); img.src=`assets/images/${cat.imagem}`; img.alt=`${cat.nome}.`; img.loading="lazy"; img.width=640; img.height=480;
                const div=document.createElement("div"); div.className="categoria-conteudo";
                const h=document.createElement("h3"); h.textContent=cat.nome;
                const p=document.createElement("p"); p.textContent=cat.descricao;
                const a=document.createElement("a"); a.href="#produtos"; a.textContent="Conhecer →"; a.addEventListener("click",()=>{
                    const select=document.querySelector("[data-filtro-categoria]"); if(select){select.value=cat.id; select.dispatchEvent(new Event("change", { bubbles: true }));} else { document.documentElement.dataset.categoriaPendente = cat.id; }
                });
                div.append(h,p,a); article.append(img,div); return article;
            }));
        } catch(e){ console.error(e); const aviso=document.createElement("p"); aviso.setAttribute("role","alert"); aviso.textContent="Não foi possível carregar as categorias agora."; grid.replaceChildren(aviso); }
    });
})();
