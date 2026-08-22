(function(){
"use strict";
const selected=new Set();
let visible=[];
let undoSnapshot=null;
const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
const $=s=>document.querySelector(s);
const text=(s,value)=>{const el=$(s);if(el)el.textContent=value;};
const quality=p=>{
  const checks=[p.nome,p.slug,p.categoria,Number(p.preco)>0,p.apresentacao,p.copy&&p.copy.length>=60,p.descricao,p.cta,p.imagem,(p.tags||[]).length>=2,(p.beneficios||[]).length>=2];
  return Math.round(checks.filter(Boolean).length/checks.length*100);
};
const filters=()=>({
  category:$('[data-v350-filtro-categoria]')?.value||"",
  status:$('[data-v350-filtro-status]')?.value||"",
  order:$('[data-v350-ordem]')?.value||"nome"
});
const filtrarOrdenar=products=>{
  const f=filters();
  const list=products.filter(p=>{
    if(f.category&&p.categoria!==f.category)return false;
    if(f.status==="destaque"&&!p.destaque)return false;
    if(f.status==="completo"&&quality(p)<85)return false;
    if(f.status==="pendente"&&quality(p)>=85)return false;
    return true;
  });
  list.sort((a,b)=>{
    if(f.order==="preco-asc")return Number(a.preco||0)-Number(b.preco||0);
    if(f.order==="preco-desc")return Number(b.preco||0)-Number(a.preco||0);
    if(f.order==="qualidade")return quality(a)-quality(b);
    return String(a.nome).localeCompare(String(b.nome),"pt-BR");
  });
  visible=list;
  return list;
};
window.QualimaxAdmin350={selecionados:selected,qualidade:quality,filtrarOrdenar};

const updateMetrics=()=>{
  const products=window.QualimaxAdminAPI?.state.produtos||[];
  const validPrices=products.map(p=>Number(p.preco)).filter(v=>Number.isFinite(v)&&v>0);
  text("[data-v350-total]",products.length);
  text("[data-v350-preco-medio]",money.format(validPrices.length?validPrices.reduce((a,b)=>a+b,0)/validPrices.length:0));
  text("[data-v350-destaques]",products.filter(p=>p.destaque).length);
  text("[data-v350-pendencias]",products.filter(p=>quality(p)<85).length);
  text("[data-v350-selecionados]",selected.size);
  text("[data-v350-resultados]",`${visible.length} de ${products.length} produto(s) exibido(s)`);
  const all=$('[data-v350-selecionar-todos]');
  if(all){all.checked=visible.length>0&&visible.every(p=>selected.has(Number(p.id)));all.indeterminate=visible.some(p=>selected.has(Number(p.id)))&&!all.checked;}
};
const announce=message=>text("[data-v350-status]",message);
const render=()=>{window.QualimaxAdminAPI?.renderLista();updateMetrics();};
const remember=label=>{
  const api=window.QualimaxAdminAPI;if(!api)return;
  undoSnapshot={label,products:api.clone(api.state.produtos)};
  const button=$('[data-v350-desfazer]');if(button)button.disabled=false;
};
const recordAudit=(action,count)=>{
  try{
    const key="qualimax_admin_audit_v350";
    const history=JSON.parse(localStorage.getItem(key)||"[]");
    history.unshift({action,count,at:new Date().toISOString()});
    localStorage.setItem(key,JSON.stringify(history.slice(0,50)));
  }catch{}
};
const saveBulk=async(message,action)=>{
  const api=window.QualimaxAdminAPI;
  api.marcarDirty();await api.persistir();render();await api.auditar();
  recordAudit(action,selected.size);announce(message);
};
const selectedProducts=()=>window.QualimaxAdminAPI.state.produtos.filter(p=>selected.has(Number(p.id)));
const csvCell=value=>{
  let v=String(value??"").replace(/\r?\n/g," ");
  if(/^[=+\-@]/.test(v))v="'"+v;
  return `"${v.replace(/"/g,'""')}"`;
};
const downloadCSV=products=>{
  const header=["id","nome","slug","categoria","preco","apresentacao","destaque","qualidade"];
  const rows=products.map(p=>[p.id,p.nome,p.slug,p.categoria,Number(p.preco||0).toFixed(2),p.apresentacao,p.destaque?"sim":"não",quality(p)]);
  const content="\ufeff"+[header,...rows].map(r=>r.map(csvCell).join(";")).join("\n");
  const url=URL.createObjectURL(new Blob([content],{type:"text/csv;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="catalogo-qualimax.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
const setStep=step=>{
  document.querySelectorAll("[data-v350-step]").forEach(el=>el.hidden=el.dataset.v350Step!==step);
  document.querySelectorAll("[data-v350-step-button]").forEach(button=>{
    if(button.dataset.v350StepButton===step)button.setAttribute("aria-current","step");else button.removeAttribute("aria-current");
  });
};
const updateEditorQuality=()=>{
  const api=window.QualimaxAdminAPI;const form=$('[data-admin-produto-form]');if(!api||!form||form.hidden)return;
  try{const p=api.formParaProduto();text("[data-v350-quality-value]",`${quality(p)}%`);text("[data-v350-editor-nome]",p.nome||"Novo produto");}catch{}
};
const populateCategories=()=>{
  const select=$('[data-v350-filtro-categoria]');const api=window.QualimaxAdminAPI;if(!select||!api)return;
  const options=[new Option("Todas","")].concat(api.state.categorias.map(c=>new Option(c.nome,c.id)));
  select.replaceChildren(...options);
};
const init=()=>{
  const api=window.QualimaxAdminAPI;if(!api)return;
  populateCategories();render();setStep("essencial");
  ["[data-admin-busca-produto]","[data-v350-filtro-categoria]","[data-v350-filtro-status]","[data-v350-ordem]"].forEach(s=>$(s)?.addEventListener("input",render));
  $('[data-v350-limpar-filtros]')?.addEventListener("click",()=>{
    $('[data-admin-busca-produto]').value="";$('[data-v350-filtro-categoria]').value="";$('[data-v350-filtro-status]').value="";$('[data-v350-ordem]').value="nome";render();$('[data-admin-busca-produto]').focus();
  });
  $('[data-admin-lista-produtos]')?.addEventListener("change",event=>{
    const input=event.target.closest("[data-v350-select]");if(!input)return;
    const id=Number(input.dataset.v350Select);input.checked?selected.add(id):selected.delete(id);updateMetrics();
  });
  $('[data-v350-selecionar-todos]')?.addEventListener("change",event=>{visible.forEach(p=>event.target.checked?selected.add(Number(p.id)):selected.delete(Number(p.id)));render();});
  $('[data-v350-aplicar-reajuste]')?.addEventListener("click",async()=>{
    const products=selectedProducts(),value=Number($('[data-v350-reajuste-valor]').value),type=$('[data-v350-reajuste-tipo]').value;
    if(!products.length){announce("Selecione pelo menos um produto para reajustar.");return;}
    if(!Number.isFinite(value)||value===0){announce("Informe um reajuste diferente de zero.");return;}
    remember("reajuste de preços");
    products.forEach(p=>{const old=Number(p.preco||0);p.preco=Math.max(0,Math.round((type==="percentual"?old*(1+value/100):old+value)*100)/100);p.preco_atualizado_em=new Date().toISOString().slice(0,10);});
    await saveBulk(`Reajuste aplicado a ${products.length} produto(s). Revise os valores antes de exportar.`,"price-adjustment");
  });
  $('[data-v350-marcar-destaque]')?.addEventListener("click",async()=>{
    const products=selectedProducts();if(!products.length){announce("Selecione pelo menos um produto.");return;}
    remember("alteração de destaque");const target=!products.every(p=>p.destaque);products.forEach(p=>p.destaque=target);
    await saveBulk(`${products.length} produto(s) ${target?"marcado(s)":"removido(s)"} como destaque.`,"featured-change");
  });
  $('[data-v350-exportar-csv]')?.addEventListener("click",()=>{const products=selectedProducts();downloadCSV(products.length?products:visible);announce(`CSV exportado com ${(products.length?products:visible).length} produto(s).`);});
  $('[data-v350-desfazer]')?.addEventListener("click",async event=>{
    if(!undoSnapshot)return;api.state.produtos=api.clone(undoSnapshot.products);const label=undoSnapshot.label;undoSnapshot=null;event.currentTarget.disabled=true;await saveBulk(`Ação desfeita: ${label}.`,"undo");
  });
  document.querySelectorAll("[data-v350-step-button]").forEach(button=>button.addEventListener("click",()=>setStep(button.dataset.v350StepButton)));
  $('[data-admin-produto-form]')?.addEventListener("input",updateEditorQuality);
  window.addEventListener("qualimax:admin-list-rendered",event=>{visible=event.detail.produtos;updateMetrics();updateEditorQuality();});
  const observer=new MutationObserver(updateEditorQuality);const form=$('[data-admin-produto-form]');if(form)observer.observe(form,{attributes:true,attributeFilter:["hidden"]});
};
window.addEventListener("qualimax:admin-ready",init,{once:true});
})();
