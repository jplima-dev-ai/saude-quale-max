#!/usr/bin/env python3
from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
commerce=root/"assets/scripts/commerce-v333.js"
text=commerce.read_text(encoding="utf-8")

cart_button='''function cartButton(){if(document.querySelector(".carrinho-atalho"))return;const b=document.createElement("a");b.href=rootHref("cart.html");b.className="carrinho-atalho";const icon=document.createElement("img");icon.src=rootHref("assets/images/icons/cart.svg");icon.alt="";icon.width=27;icon.height=27;b.append(icon,document.createTextNode(" Carrinho "));const count=document.createElement("strong");count.dataset.cartCount="";count.textContent="0";b.append(count);document.body.append(b);const update=()=>{const total=cartCount();count.textContent=total;b.setAttribute("aria-label",`Abrir carrinho com ${total} ${total===1?"item":"itens"}`)};update();document.addEventListener("qualimax:cart",update)}'''

page_cart='''function pageCart(){if(document.body.dataset.page!=="carrinho")return;const box=document.querySelector("[data-cart-list]"),summary=document.querySelector("[data-cart-summary]"),budget=document.querySelector("[data-budget]"),save=document.querySelector("[data-cart-save]"),clear=document.querySelector("[data-cart-clear]");if(!box||!summary||!budget||!save||!clear)return;
const thumb=x=>rootHref(`assets/images/thumbs/${String(x.imagem||"").split("/").pop()}`);
const persistOrder=()=>{const orders=read(K.orders,[]);orders.unshift({id:Date.now(),em:new Date().toISOString(),itens:cart(),total:cartTotal()});write(K.orders,orders.slice(0,20));emit("pedido_preparado",{total:cartTotal()})};
const render=()=>{const items=cart();box.replaceChildren();items.forEach(x=>{const row=document.createElement("article");row.className="cart-row";const image=document.createElement("img");image.className="cart-product-image";image.src=thumb(x);image.alt="";image.width=88;image.height=104;image.loading="lazy";image.decoding="async";image.onerror=()=>{image.hidden=true};const info=document.createElement("div");info.className="cart-product-info";const title=document.createElement("h3");title.textContent=x.nome;const meta=document.createElement("p");meta.className="cart-product-meta";meta.textContent=`${x.variante} · ${money(x.preco)} cada`;const line=document.createElement("p");line.className="cart-line-total";line.textContent=`Subtotal: ${money(Number(x.preco)*Number(x.qtd))}`;const actions=document.createElement("div");actions.className="cart-actions";const quantity=document.createElement("div");quantity.className="quantity-control";const qlabel=document.createElement("span");qlabel.textContent="Quantidade";const minus=document.createElement("button");minus.type="button";minus.textContent="−";minus.setAttribute("aria-label",`Diminuir quantidade de ${x.nome}`);const input=document.createElement("input");input.type="number";input.min="1";input.max="99";input.value=x.qtd;input.inputMode="numeric";input.setAttribute("aria-label",`Quantidade de ${x.nome}`);const plus=document.createElement("button");plus.type="button";plus.textContent="+";plus.setAttribute("aria-label",`Aumentar quantidade de ${x.nome}`);const update=next=>{x.qtd=Math.min(99,Math.max(1,Number(next)||1));saveCart(items);announce(`Quantidade de ${x.nome}: ${x.qtd}`);render()};minus.onclick=()=>update(x.qtd-1);plus.onclick=()=>update(x.qtd+1);input.onchange=()=>update(input.value);quantity.append(qlabel,minus,input,plus);const remove=document.createElement("button");remove.type="button";remove.className="cart-remove";remove.textContent="Remover";remove.setAttribute("aria-label",`Remover ${x.nome} do carrinho`);remove.onclick=()=>{if(confirm(`Remover ${x.nome} do carrinho?`)){saveCart(items.filter(y=>y.key!==x.key));emit("remover_carrinho",{id:x.id});announce(`${x.nome} removido do carrinho.`);render()}};actions.append(quantity,remove);info.append(title,meta,line,actions);row.append(image,info);box.append(row)});
if(!items.length){box.innerHTML='<div class="estado-vazio"><h2>Seu carrinho está vazio</h2><p>Escolha seus produtos com calma. Você poderá revisar tudo antes de enviar o pedido.</p><div class="cart-empty-actions"><a class="botao botao-principal" href="catalog.html">Ver produtos</a><a class="botao botao-secundario" href="support.html?origem=carrinho">Pedir ajuda</a></div></div>'}const total=cartTotal();summary.textContent=items.length?`Total estimado: ${money(total)}`:"Total estimado: R$ 0,00";const limit=Number(budget.value||0),status=document.querySelector("[data-budget-status]");if(status)status.textContent=limit?total<=limit?`Está dentro do seu orçamento. Ainda sobram ${money(limit-total)}.`:`O total passou ${money(total-limit)} do seu orçamento.`:"";save.disabled=!items.length;clear.disabled=!items.length};
let timer;budget.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(render,120)});save.onclick=()=>{if(!cart().length)return;persistOrder();announce("Tudo certo. Agora informe os dados de entrega ou retirada.");location.href=rootHref("support.html?origem=carrinho&assunto=Finalizar%20meu%20pedido")};clear.onclick=()=>{if(cart().length&&confirm("Esvaziar todo o carrinho?")){saveCart([]);announce("Carrinho esvaziado.");render()}};render()}'''

text=re.sub(r'function cartButton\(\)\{.*?\}\nfunction enhanceCards',cart_button+'\nfunction enhanceCards',text,flags=re.S)
text=re.sub(r'function pageCart\(\)\{.*?\}\nfunction campaigns',page_cart+'\nfunction campaigns',text,flags=re.S)
text=text.replace('enhanceCards();commandPalette();notifications();smartSearch();','enhanceCards();if(document.documentElement.dataset.performanceMode!=="lite"){commandPalette();notifications()}smartSearch();')
commerce.write_text(text,encoding="utf-8")

cart=root/"cart.html"
html=cart.read_text(encoding="utf-8")
main='''<main id="conteudo" class="container pagina-v333"><p class="secao-subtitulo">Compra simples e segura</p><h1>Seu carrinho</h1><p class="checkout-intro">Confira os produtos com calma. Você só enviará o pedido à loja depois de revisar todos os dados.</p><ol class="checkout-steps" aria-label="Etapas para finalizar"><li aria-current="step">Revisar produtos</li><li>Informar entrega</li><li>Confirmar no WhatsApp</li></ol><div class="checkout-layout"><section aria-labelledby="cart-items-title"><h2 id="cart-items-title" class="cart-items-title">1. Produtos escolhidos</h2><div data-cart-list aria-live="polite"></div><p><a href="catalog.html">← Continuar escolhendo produtos</a></p></section><aside class="cart-summary" aria-labelledby="cart-summary-title"><h2 id="cart-summary-title">Resumo do pedido</h2><p class="cart-total" data-cart-summary aria-live="polite"></p><p>O valor é estimado. A loja confirmará preço e disponibilidade antes da compra.</p><label for="budget"><strong>Quer definir um limite?</strong> (opcional)</label><input id="budget" data-budget type="number" min="0" step="1" inputmode="decimal" placeholder="Ex.: 150"><p data-budget-status role="status" aria-live="polite"></p><div class="checkout-safe"><span aria-hidden="true">✓</span><span>Nenhuma cobrança será feita nesta tela.</span></div><button class="botao botao-principal checkout-primary" data-cart-save type="button">Continuar para entrega</button><button class="botao botao-secundario" data-cart-clear type="button">Esvaziar carrinho</button><p class="checkout-help"><a href="support.html?origem=carrinho">Preciso de ajuda para comprar</a></p></aside></div></main>'''
html=re.sub(r'<main id="conteudo".*?</main>',main,html,flags=re.S)
cart.write_text(html,encoding="utf-8")

# Camada leve e estilos do checkout em todas as páginas, sem duplicações.
for page in root.rglob("*.html"):
    h=page.read_text(encoding="utf-8")
    prefix="../" if page.parent.name=="products" else ""
    css=f'<link rel="stylesheet" href="{prefix}assets/styles/checkout-v353.css">'
    js=f'<script src="{prefix}assets/scripts/performance-v353.js" defer></script>'
    if "checkout-v353.css" not in h:
        h=h.replace("</head>",css+"</head>")
    if "performance-v353.js" not in h:
        h=h.replace("</body>",js+"</body>")
    page.write_text(h,encoding="utf-8")

# Atualização coerente de versão e cache em código, dados, testes e documentação ativa.
for pattern in ["*.json","*.js","*.py","*.md"]:
    for p in root.rglob(pattern):
        if p.name=="migrate-v353.py":continue
        try:s=p.read_text(encoding="utf-8")
        except UnicodeDecodeError:continue
        if "3.5.2" in s:p.write_text(s.replace("3.5.2","3.5.6"),encoding="utf-8")

print("Migração 3.5.6 aplicada")
