(() => {
"use strict";

const DB_NAME="qualimax-admin-local-v3";
const DB_VERSION=1;
let dbPromise=null;
const abrirDB=()=>{
    if(dbPromise) return dbPromise;
    dbPromise=new Promise(resolve=>{
        const req=indexedDB.open(DB_NAME,DB_VERSION);
        req.onupgradeneeded=()=>{
            const db=req.result;
            if(!db.objectStoreNames.contains("state")) db.createObjectStore("state",{keyPath:"key"});
            if(!db.objectStoreNames.contains("images")) db.createObjectStore("images",{keyPath:"id"});
        };
        req.onsuccess=()=>resolve(req.result);
        req.onerror=()=>resolve(null);
        req.onblocked=()=>resolve(null);
    });
    return dbPromise;
};
const storeGet=async(store,key)=>{
    const db=await abrirDB(); if(!db) return null;
    return new Promise(resolve=>{
        const tx=db.transaction(store,"readonly");
        const q=tx.objectStore(store).get(key);
        q.onsuccess=()=>resolve(q.result||null); q.onerror=()=>resolve(null);
    });
};
const storePut=async(store,value)=>{
    const db=await abrirDB(); if(!db) throw new Error("IndexedDB indisponível.");
    return new Promise((resolve,reject)=>{
        const tx=db.transaction(store,"readwrite");
        tx.objectStore(store).put(value);
        tx.oncomplete=()=>resolve(value); tx.onerror=()=>reject(tx.error||new Error("Falha ao salvar."));
    });
};
const storeDelete=async(store,key)=>{
    const db=await abrirDB(); if(!db) return;
    return new Promise(resolve=>{
        const tx=db.transaction(store,"readwrite");
        tx.objectStore(store).delete(key);
        tx.oncomplete=resolve; tx.onerror=resolve;
    });
};
const storeAll=async(store)=>{
    const db=await abrirDB(); if(!db) return [];
    return new Promise(resolve=>{
        const tx=db.transaction(store,"readonly");
        const q=tx.objectStore(store).getAll();
        q.onsuccess=()=>resolve(q.result||[]); q.onerror=()=>resolve([]);
    });
};
const limparStores=async()=>{
    const db=await abrirDB(); if(!db) return;
    return new Promise(resolve=>{
        const tx=db.transaction(["state","images"],"readwrite");
        tx.objectStore("state").clear(); tx.objectStore("images").clear();
        tx.oncomplete=resolve; tx.onerror=resolve;
    });
};

const clone=v=>JSON.parse(JSON.stringify(v));
const slugify=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100);
const nomeArquivoSeguro=v=>/^[A-Za-z0-9._-]+$/.test(String(v||""))?String(v):"";
const baixar=(nome,blobOrText,tipo="application/json")=>{
    const blob=blobOrText instanceof Blob?blobOrText:new Blob([blobOrText],{type:tipo});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url;a.download=nome;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
};
const getPath=(obj,path)=>path.split(".").reduce((a,k)=>a?.[k],obj);
const setPath=(obj,path,value)=>{
    const parts=path.split("."); let cur=obj;
    parts.slice(0,-1).forEach(k=>{cur[k]??={};cur=cur[k];});
    cur[parts.at(-1)]=value;
};
const esperarFetch=async(url)=>{
    const r=await fetch(url,{cache:"no-store"}); if(!r.ok) throw new Error(`Falha ao carregar ${url}`);
    return r.json();
};

const state={
    produtos:[], categorias:[], config:{}, baseProdutos:[], baseConfig:{},
    selecionado:null, dirty:false
};

const persistir=async()=>{
    await storePut("state",{key:"catalogo",value:state.produtos,updatedAt:Date.now()});
    await storePut("state",{key:"config",value:state.config,updatedAt:Date.now()});
    state.dirty=false; atualizarMetricas();
};
const marcarDirty=()=>{state.dirty=true; atualizarMetricas();};

const atualizarMetricas=async()=>{
    const p=document.querySelector("[data-admin-metrica-produtos]"); if(p)p.textContent=state.produtos.length;
    const d=document.querySelector("[data-admin-metrica-destaques]"); if(d)d.textContent=state.produtos.filter(x=>x.destaque).length;
    const imgs=await storeAll("images");
    const i=document.querySelector("[data-admin-metrica-imagens]"); if(i)i.textContent=imgs.length;
    const s=document.querySelector("[data-admin-metrica-status]"); if(s)s.textContent=state.dirty?"Alterado":"Salvo";
};

const preencherCategorias=()=>{
    const sel=document.querySelector("[data-admin-categorias]"); if(!sel)return;
    sel.replaceChildren(...state.categorias.map(c=>{
        const o=document.createElement("option");o.value=c.id;o.textContent=c.nome;return o;
    }));
};

const produtoPorId=id=>state.produtos.find(p=>Number(p.id)===Number(id));

const renderLista=()=>{
    const box=document.querySelector("[data-admin-lista-produtos]"); if(!box)return;
    const q=String(document.querySelector("[data-admin-busca-produto]")?.value||"").toLowerCase().trim();
    const filtrados=state.produtos.filter(p=>`${p.nome} ${p.slug} ${p.categoria}`.toLowerCase().includes(q))
        .sort((a,b)=>String(a.nome).localeCompare(String(b.nome),"pt-BR"));
    box.replaceChildren(...filtrados.map(p=>{
        const b=document.createElement("button");b.type="button";b.className="admin-produto-item";
        if(Number(p.id)===Number(state.selecionado)) b.classList.add("ativo");
        b.dataset.produtoId=p.id;
        const strong=document.createElement("strong");strong.textContent=p.nome;
        const small=document.createElement("small");small.textContent=`${p.categoria} • ${p.slug}`;
        b.append(strong,small); return b;
    }));
};

const imagemLocal=async(produto)=>{
    const rec=await storeGet("images",String(produto.id)); return rec||null;
};

const preencherForm=async(produto)=>{
    const form=document.querySelector("[data-admin-produto-form]");
    const ph=document.querySelector("[data-admin-editor-placeholder]");
    if(!form||!produto)return;
    ph.hidden=true;form.hidden=false;
    for(const nome of ["id","nome","slug","categoria","tipo","imagem","copy","descricao","cta"]){
        if(form.elements[nome]) form.elements[nome].value=produto[nome]??"";
    }
    form.elements.beneficios.value=(produto.beneficios||[]).join("\n");
    form.elements.tags.value=(produto.tags||[]).join(", ");
    form.elements.vegana.checked=!!produto.vegana;
    form.elements.sem_gluten.checked=!!produto.sem_gluten;
    form.elements.destaque.checked=!!produto.destaque;
    atualizarContadorCopy();
    await renderPreview(produto);
};

const formParaProduto=()=>{
    const form=document.querySelector("[data-admin-produto-form]");
    const id=Number(form.elements.id.value)||Math.max(0,...state.produtos.map(x=>Number(x.id)||0))+1;
    const nome=form.elements.nome.value.trim();
    const slug=form.elements.slug.value.trim()||slugify(nome);
    return {
        ...(produtoPorId(id)||{}),
        id,nome,slug,
        categoria:form.elements.categoria.value,
        imagem:form.elements.imagem.value.trim(),
        descricao:form.elements.descricao.value.trim(),
        beneficios:form.elements.beneficios.value.split(/\n+/).map(x=>x.trim()).filter(Boolean),
        tipo:form.elements.tipo.value.trim(),
        vegana:form.elements.vegana.checked,
        sem_gluten:form.elements.sem_gluten.checked,
        experiencia_minima:(produtoPorId(id)||{}).experiencia_minima||"iniciante",
        tags:form.elements.tags.value.split(",").map(x=>x.trim()).filter(Boolean),
        disponibilidade:(produtoPorId(id)||{}).disponibilidade||"consultar",
        destaque:form.elements.destaque.checked,
        copy:form.elements.copy.value.trim(),
        cta:form.elements.cta.value.trim()
    };
};

const renderPreview=async(produto)=>{
    const box=document.querySelector("[data-admin-produto-preview]"); if(!box)return;
    box.replaceChildren();
    const rec=await imagemLocal(produto);
    let src="";
    if(rec?.blob) src=URL.createObjectURL(rec.blob);
    else if(nomeArquivoSeguro(produto.imagem)) src=`img/thumbs/${produto.imagem}`;

    if(src){
        const img=document.createElement("img");img.src=src;img.alt="";
        img.addEventListener("load",()=>{if(rec?.blob) setTimeout(()=>URL.revokeObjectURL(src),500);},{once:true});
        img.addEventListener("error",()=>img.remove());
        box.append(img);
    }
    const body=document.createElement("div");
    const small=document.createElement("small");small.textContent=produto.categoria||"Categoria";
    const h=document.createElement("strong");h.textContent=produto.nome||"Nome do produto";
    const p=document.createElement("p");p.textContent=produto.copy||"A copy de destaque aparecerá aqui.";
    const cta=document.createElement("span");cta.textContent=produto.cta||"Ver produto";
    body.append(small,h,p,cta);box.append(body);

    const prev=document.querySelector("[data-admin-preview-imagem]"); if(prev){
        prev.replaceChildren();
        if(src){
            const img=document.createElement("img");img.src=src;img.alt="Prévia da imagem enviada";
            prev.append(img);
        } else {
            const p=document.createElement("p");p.textContent="Nenhuma imagem local enviada.";prev.append(p);
        }
    }
};

const atualizarContadorCopy=()=>{
    const ta=document.querySelector("#adm-copy"); const c=document.querySelector("[data-admin-contador-copy]");
    if(ta&&c)c.textContent=`${ta.value.length}/700 caracteres`;
};

const selecionar=async id=>{
    state.selecionado=Number(id);renderLista();
    const p=produtoPorId(id); if(p) await preencherForm(p);
};

const validarProduto=p=>{
    const erros=[];
    if(!p.nome)erros.push("Nome obrigatório");
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug))erros.push("Endereço da página inválido");
    if(state.produtos.some(x=>x.id!==p.id&&x.slug===p.slug))erros.push("Já existe outro produto com este endereço");
    if(p.imagem&&!nomeArquivoSeguro(p.imagem))erros.push("Nome da imagem inválido");
    return erros;
};

const auditar=async()=>{
    const erros=[]; const avisos=[];
    const slugs=new Set();
    state.produtos.forEach(p=>{
        if(!p.nome)erros.push(`Produto ${p.id}: sem nome`);
        if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug||""))erros.push(`${p.nome||p.id}: slug inválido`);
        if(slugs.has(p.slug))erros.push(`Slug duplicado: ${p.slug}`); slugs.add(p.slug);
        if(!p.copy)avisos.push(`${p.nome}: sem copy`);
        if(!p.imagem)avisos.push(`${p.nome}: sem imagem definida`);
        if(!state.categorias.some(c=>c.id===p.categoria))erros.push(`${p.nome}: categoria inválida`);
    });
    const box=document.querySelector("[data-admin-auditoria]");
    if(box){
        box.replaceChildren();
        const p=document.createElement("p");
        p.textContent=erros.length?`${erros.length} problema(s) que precisam de correção.`:`Rascunho consistente: ${state.produtos.length} produtos.`;
        box.append(p);
        if(avisos.length){const ul=document.createElement("ul");avisos.slice(0,6).forEach(x=>{const li=document.createElement("li");li.textContent=x;ul.append(li)});box.append(ul);}
    }
    return {erros,avisos};
};

const preencherLoja=()=>{
    const form=document.querySelector("[data-admin-loja-form]");if(!form)return;
    [...form.elements].forEach(el=>{
        if(!el.name)return;
        const v=getPath(state.config,el.name);
        if(v!==undefined) el.value=v;
    });
};
const preencherRecursos=()=>{
    const form=document.querySelector("[data-admin-recursos-form]");if(!form)return;
    [...form.elements].forEach(el=>{
        if(el.name) el.checked=state.config.recursos?.[el.name]!==false;
    });
};

const exportarImagemLista=async()=>{
    const box=document.querySelector("[data-admin-imagens-exportar]");if(!box)return;
    const imgs=await storeAll("images");
    box.replaceChildren(...imgs.map(rec=>{
        const row=document.createElement("div");row.className="admin-imagem-export-item";
        const span=document.createElement("span");span.textContent=rec.filename||`produto-${rec.id}`;
        const b=document.createElement("button");b.type="button";b.className="botao botao-secundario";b.textContent="Baixar imagem";
        b.addEventListener("click",()=>baixar(rec.filename||`produto-${rec.id}.webp`,rec.blob,rec.blob.type));
        row.append(span,b);return row;
    }));
    if(!imgs.length){const p=document.createElement("p");p.textContent="Nenhuma imagem local enviada.";box.append(p);}
};

const mudarTab=tab=>{
    document.querySelectorAll("[data-admin-panel]").forEach(p=>p.hidden=p.dataset.adminPanel!==tab);
    document.querySelectorAll("[data-admin-tab]").forEach(b=>{
        const ativo=b.dataset.adminTab===tab;b.classList.toggle("ativo",ativo);
        if(ativo)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
    });
    if(tab==="exportar")exportarImagemLista();
};

document.addEventListener("DOMContentLoaded",async()=>{
    try{
        const [prod,cats,cfg]=await Promise.all([
            esperarFetch("data/produtos.json"),esperarFetch("data/categorias.json"),esperarFetch("data/config.json")
        ]);
        state.baseProdutos=clone(prod.produtos||[]);state.categorias=clone(cats.categorias||[]);state.baseConfig=clone(cfg);
        const savedP=await storeGet("state","catalogo"), savedC=await storeGet("state","config");
        state.produtos=clone(savedP?.value||state.baseProdutos);
        state.config=clone(savedC?.value||state.baseConfig);
        preencherCategorias();renderLista();preencherLoja();preencherRecursos();await atualizarMetricas();await auditar();
    }catch(e){
        const box=document.querySelector("[data-admin-auditoria]");if(box)box.textContent="Não foi possível carregar os dados publicados.";
        console.error(e);
    }

    document.querySelectorAll("[data-admin-tab]").forEach(b=>b.addEventListener("click",()=>mudarTab(b.dataset.adminTab)));
    document.querySelector("[data-admin-busca-produto]")?.addEventListener("input",renderLista);
    document.querySelector("[data-admin-lista-produtos]")?.addEventListener("click",e=>{
        const b=e.target.closest("[data-produto-id]");if(b)selecionar(b.dataset.produtoId);
    });

    document.querySelector("[data-admin-novo-produto]")?.addEventListener("click",async()=>{
        const id=Math.max(0,...state.produtos.map(x=>Number(x.id)||0))+1;
        const novo={id,nome:"Novo produto",slug:`novo-produto-${id}`,categoria:state.categorias[0]?.id||"",imagem:"",descricao:"",beneficios:[],tipo:"",vegana:false,sem_gluten:false,experiencia_minima:"iniciante",tags:[],disponibilidade:"consultar",destaque:false,copy:"",cta:"Conhecer produto"};
        state.produtos.push(novo);marcarDirty();renderLista();await selecionar(id);
    });

    const form=document.querySelector("[data-admin-produto-form]");
    form?.addEventListener("input",async()=>{
        if(form.elements.nome===document.activeElement && (!form.elements.slug.value||form.elements.slug.dataset.auto==="true")){
            form.elements.slug.value=slugify(form.elements.nome.value);form.elements.slug.dataset.auto="true";
        }
        atualizarContadorCopy();
        try{await renderPreview(formParaProduto());}catch{}
    });
    form?.elements.slug?.addEventListener("input",()=>{form.elements.slug.dataset.auto="false";});

    form?.addEventListener("submit",async e=>{
        e.preventDefault();
        const p=formParaProduto(); const erros=validarProduto(p);
        const status=document.querySelector("[data-admin-produto-status]");
        if(erros.length){if(status)status.textContent=erros.join(". ");return;}
        const idx=state.produtos.findIndex(x=>Number(x.id)===Number(p.id));
        if(idx>=0)state.produtos[idx]=p;else state.produtos.push(p);
        state.selecionado=p.id;marcarDirty();await persistir();renderLista();await preencherForm(p);
        if(status)status.textContent="Produto salvo no rascunho local.";
    });

    document.querySelector("[data-admin-duplicar]")?.addEventListener("click",async()=>{
        const atual=formParaProduto();
        const id=Math.max(0,...state.produtos.map(x=>Number(x.id)||0))+1;
        const novo={...clone(atual),id,nome:`${atual.nome} — cópia`,slug:`${slugify(atual.slug||atual.nome)}-${id}`};
        state.produtos.push(novo);marcarDirty();await persistir();renderLista();await selecionar(id);
    });

    document.querySelector("[data-admin-excluir]")?.addEventListener("click",async()=>{
        const id=Number(form?.elements.id.value);const p=produtoPorId(id);if(!p)return;
        if(!confirm(`Excluir "${p.nome}" do rascunho local?`))return;
        state.produtos=state.produtos.filter(x=>Number(x.id)!==id);await storeDelete("images",String(id));
        state.selecionado=null;marcarDirty();await persistir();renderLista();
        form.hidden=true;document.querySelector("[data-admin-editor-placeholder]").hidden=false;
    });

    document.querySelector("[data-admin-upload-imagem]")?.addEventListener("change",async e=>{
        const file=e.target.files?.[0]; if(!file||!form)return;
        const status=document.querySelector("[data-admin-produto-status]");
        if(file.size>5*1024*1024){if(status)status.textContent="Imagem acima de 5 MB. Escolha um arquivo menor.";return;}
        if(!["image/png","image/jpeg","image/webp"].includes(file.type)){if(status)status.textContent="Formato não suportado.";return;}
        const id=String(form.elements.id.value);
        const ext=file.type==="image/png"?".png":file.type==="image/webp"?".webp":".jpg";
        const nome=`${slugify(form.elements.slug.value||form.elements.nome.value)||`produto-${id}`}${ext}`;
        await storePut("images",{id,filename:nome,blob:file,updatedAt:Date.now()});
        form.elements.imagem.value=nome;marcarDirty();await renderPreview(formParaProduto());await atualizarMetricas();
        if(status)status.textContent="Imagem guardada localmente. Exporte-a antes de publicar.";
    });

    document.querySelector("[data-admin-loja-form]")?.addEventListener("submit",async e=>{
        e.preventDefault();const f=e.currentTarget;
        [...f.elements].forEach(el=>{if(el.name)setPath(state.config,el.name,el.value.trim?.()??el.value);});
        marcarDirty();await persistir();
        const s=document.querySelector("[data-admin-loja-status]");if(s)s.textContent="Dados da loja salvos no rascunho.";
    });

    document.querySelector("[data-admin-recursos-form]")?.addEventListener("submit",async e=>{
        e.preventDefault();state.config.recursos??={};
        [...e.currentTarget.elements].forEach(el=>{if(el.name)state.config.recursos[el.name]=el.checked;});
        marcarDirty();await persistir();
        const s=document.querySelector("[data-admin-recursos-status]");if(s)s.textContent="Recursos salvos no rascunho.";
    });

    document.querySelector("[data-admin-auditar]")?.addEventListener("click",auditar);

    document.querySelector("[data-admin-restaurar-base]")?.addEventListener("click",async()=>{
        if(!confirm("Descartar todos os rascunhos locais do Admin Studio e voltar aos dados publicados?"))return;
        await limparStores();state.produtos=clone(state.baseProdutos);state.config=clone(state.baseConfig);state.selecionado=null;state.dirty=false;
        renderLista();preencherLoja();preencherRecursos();await atualizarMetricas();await auditar();
        if(form){form.hidden=true;document.querySelector("[data-admin-editor-placeholder]").hidden=false;}
    });

    document.querySelector("[data-admin-exportar-produtos]")?.addEventListener("click",()=>{
        baixar("produtos.json",JSON.stringify({produtos:state.produtos},null,2));
        document.querySelector("[data-admin-export-status]").textContent="produtos.json exportado.";
    });
    document.querySelector("[data-admin-exportar-config]")?.addEventListener("click",()=>{
        baixar("config.json",JSON.stringify(state.config,null,2));
        document.querySelector("[data-admin-export-status]").textContent="config.json exportado.";
    });
    document.querySelector("[data-admin-exportar-backup]")?.addEventListener("click",async()=>{
        const imgs=await storeAll("images");
        const metaImgs=imgs.map(x=>({id:x.id,filename:x.filename,type:x.blob?.type,size:x.blob?.size,updatedAt:x.updatedAt}));
        const backup={versao:"3.0",exportadoEm:new Date().toISOString(),produtos:state.produtos,config:state.config,imagens:metaImgs};
        baixar("qualimax-admin-backup-v3.json",JSON.stringify(backup,null,2));
        document.querySelector("[data-admin-export-status]").textContent="Backup exportado. As imagens devem ser baixadas separadamente.";
    });
    document.querySelector("[data-admin-importar-backup]")?.addEventListener("change",async e=>{
        const file=e.target.files?.[0];if(!file)return;
        try{
            const b=JSON.parse(await file.text());
            if(!Array.isArray(b.produtos)||!b.config)throw new Error();
            state.produtos=clone(b.produtos);state.config=clone(b.config);state.selecionado=null;marcarDirty();await persistir();
            renderLista();preencherLoja();preencherRecursos();await atualizarMetricas();await auditar();
            document.querySelector("[data-admin-export-status]").textContent="Backup importado. Imagens locais não fazem parte do JSON.";
        }catch{
            document.querySelector("[data-admin-export-status]").textContent="Backup inválido.";
        } finally {e.target.value="";}
    });
});
})();