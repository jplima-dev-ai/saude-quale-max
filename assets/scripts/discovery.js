(() => {
"use strict";

const trilhas = [
  { id:"pausa", titulo:"Para desacelerar um pouquinho", texto:"Chás e aromas para aqueles minutos em que tudo o que você quer é uma pausa gostosa.", href:"catalog.html?categoria=chas#produtos", termos:["camomila","erva-cidreira","lavanda","chá"] },
  { id:"crocancia", titulo:"Para quem não resiste a uma boa crocância", texto:"Castanhas, sementes e granolas para deixar o lanche mais gostoso e descobrir novas combinações.", href:"catalog.html?busca=castanha#produtos", termos:["castanha","granola","sementes","mix"] },
  { id:"cozinha", titulo:"Para dar uma cara nova às suas receitas", texto:"Temperos e ingredientes que trazem novos aromas, texturas e sabores para a cozinha do dia a dia.", href:"catalog.html?categoria=temperos#produtos", termos:["cúrcuma","gengibre","canela","óleo","vinagre"] },
  { id:"manha", titulo:"Para começar o dia de um jeito diferente", texto:"Aveia, granola, sementes e outras opções para montar um café da manhã com mais variedade e do seu jeito.", href:"catalog.html?busca=granola#produtos", termos:["aveia","granola","chia","linhaça","pasta"] },
  { id:"praticidade", titulo:"Para deixar a rotina mais simples", texto:"Conheça diferentes formatos e encontre opções que se encaixem com mais naturalidade no seu dia.", href:"catalog.html?categoria=vitaminas#produtos", termos:["vitamina","multivitamínico","complexo","magnésio"] },
  { id:"treino", titulo:"Para quem quer conhecer melhor a suplementação esportiva", texto:"Creatina, proteínas e outras opções para você conhecer, comparar e tirar suas dúvidas antes de escolher.", href:"catalog.html?categoria=suplementos#produtos", termos:["whey","creatina","colágeno"] },
  { id:"aromas", titulo:"Quando o aroma também faz parte da escolha", texto:"Chás, especiarias e lavanda para quem gosta de descobrir produtos também pelo aroma e pela experiência.", href:"catalog.html?busca=aroma#produtos", termos:["chá","canela","lavanda","gengibre"] },
  { id:"novidade", titulo:"Que tal descobrir algo que você ainda não conhece?", texto:"Um convite para passear pelo catálogo sem compromisso e deixar alguma novidade chamar sua atenção.", href:"catalog.html#produtos", termos:[] }
];

const seguroHref = (href) => /^(?:catalog\.html)(?:[?#].*)?$/.test(href) ? href : "catalog.html";

const criarTrilha = (item) => {
  const a=document.createElement("a");
  a.className="editorial-trilha";
  a.href=seguroHref(item.href);
  const strong=document.createElement("strong"); strong.textContent=item.titulo;
  const span=document.createElement("span"); span.textContent=item.texto;
  const small=document.createElement("small"); small.textContent="Quero ver essas opções →";
  a.append(strong,span,small);
  return a;
};

const hashDoDia = () => {
  const agora=new Date();
  return agora.getFullYear()*1000 + (agora.getMonth()+1)*50 + agora.getDate();
};

const rotacionar = (lista, deslocamento) => {
  if (!lista.length) return [];
  const n=((deslocamento%lista.length)+lista.length)%lista.length;
  return [...lista.slice(n),...lista.slice(0,n)];
};

const renderHome = () => {
  const grid=document.querySelector("[data-editorial-trilhas]");
  if (!grid) return;
  const ordem=rotacionar(trilhas,hashDoDia()).slice(0,4);
  grid.replaceChildren(...ordem.map(criarTrilha));
  const destaques=[
    ["Talvez você encontre algo que nem estava procurando","Hoje, que tal deixar a curiosidade guiar um pouquinho?","Você não precisa saber exatamente o que procura. Às vezes uma boa descoberta começa por um sabor, um aroma ou uma ideia simples para o seu dia."],
    ["Tem dias em que a gente só quer descobrir algo novo","O que parece combinar com o seu momento hoje?","Passeie pelas sugestões sem pressa. Hoje uma ideia pode chamar sua atenção; amanhã, talvez seja outra."],
    ["Mais do que uma lista de produtos","Faça do catálogo um lugar para descobrir possibilidades.","Comece pelo que você já gosta, conheça algo diferente e salve aquilo que der vontade de ver de novo."]
  ];
  const d=destaques[hashDoDia()%destaques.length];
  const k=document.querySelector("[data-editorial-kicker]");
  const h=document.querySelector("[data-editorial-titulo]");
  const p=document.querySelector("[data-editorial-texto]");
  if(k) k.textContent=d[0]; if(h) h.textContent=d[1]; if(p) p.textContent=d[2];
};

const renderCatalogo = (produtos=[]) => {
  const grid=document.querySelector("[data-descoberta-contextual-trilhas]");
  if (!grid) return;
  const params=new URLSearchParams(location.search);
  const contexto=(params.get("categoria")||params.get("busca")||"").toLowerCase();
  let ordem=trilhas.filter(x => !contexto || !x.href.toLowerCase().includes(encodeURIComponent(contexto)));
  ordem=rotacionar(ordem,hashDoDia()+contexto.length).slice(0,3);
  grid.replaceChildren(...ordem.map(criarTrilha));

  const titulo=document.querySelector("[data-descoberta-contextual-titulo]");
  const texto=document.querySelector("[data-descoberta-contextual-texto]");
  if(contexto && titulo && texto){
    titulo.textContent="Já que você chegou até aqui, que tal abrir uma trilha diferente?";
    texto.textContent="Uma boa descoberta costuma levar a outra. Estas sugestões mudam o ponto de partida sem apagar o caminho que você já explorou.";
  }

  // Seleção editorial determinística do dia usando somente produtos reais do catálogo.
  if(produtos.length){
    const candidatos=rotacionar(produtos,hashDoDia()).slice(0,3);
    const secao=document.querySelector("[data-descoberta-contextual]");
    if(secao && !secao.querySelector("[data-achados-dia]")){
      const wrap=document.createElement("div"); wrap.className="achados-dia"; wrap.dataset.achadosDia="";
      const h=document.createElement("h3"); h.textContent="Três achados para olhar sem pressa";
      const ul=document.createElement("ul");
      candidatos.forEach(prod=>{
        const li=document.createElement("li");
        const a=document.createElement("a");
        const slug=String(prod.slug||"");
        a.href=/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)?`products/${slug}.html`:"catalog.html";
        const strong=document.createElement("strong"); strong.textContent=prod.nome;
        const span=document.createElement("span"); span.textContent=prod.copy||prod.descricao||"Conheça esta opção.";
        a.append(strong,span); li.append(a); ul.append(li);
      });
      wrap.append(h,ul); secao.querySelector(".container")?.append(wrap);
    }
  }
};

document.addEventListener("DOMContentLoaded",renderHome);
document.addEventListener("qualimax:catalog-ready",(e)=>renderCatalogo(e.detail?.produtos||[]));
})();
