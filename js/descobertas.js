(() => {
"use strict";

const trilhas = [
  { id:"pausa", titulo:"Para uma pausa tranquila", texto:"Chás aromáticos e escolhas que combinam com alguns minutos sem pressa.", href:"catalogo.html?categoria=chas#produtos", termos:["camomila","erva-cidreira","lavanda","chá"] },
  { id:"crocancia", titulo:"Para quem ama crocância", texto:"Castanhas, sementes e granola para explorar texturas que deixam o lanche mais interessante.", href:"catalogo.html?busca=castanha#produtos", termos:["castanha","granola","sementes","mix"] },
  { id:"cozinha", titulo:"Para experimentar na cozinha", texto:"Temperos e ingredientes que podem mudar cor, aroma, textura e personalidade das receitas.", href:"catalogo.html?categoria=temperos#produtos", termos:["cúrcuma","gengibre","canela","óleo","vinagre"] },
  { id:"manha", titulo:"Para reinventar a manhã", texto:"Aveia, granola, sementes e pastas para criar combinações diferentes logo no começo do dia.", href:"catalogo.html?busca=granola#produtos", termos:["aveia","granola","chia","linhaça","pasta"] },
  { id:"praticidade", titulo:"Para uma rotina mais prática", texto:"Opções para quem gosta de comparar formatos e deixar as escolhas do dia a dia mais organizadas.", href:"catalogo.html?categoria=vitaminas#produtos", termos:["vitamina","multivitamínico","complexo","magnésio"] },
  { id:"treino", titulo:"Para explorar o universo esportivo", texto:"Proteína, creatina e outras opções para conhecer composições e apresentações com calma.", href:"catalogo.html?categoria=suplementos#produtos", termos:["whey","creatina","colágeno"] },
  { id:"aromas", titulo:"Quando o aroma faz parte da experiência", texto:"Chás, especiarias e lavanda para quem escolhe também pelo perfume e pela sensação do momento.", href:"catalogo.html?busca=aroma#produtos", termos:["chá","canela","lavanda","gengibre"] },
  { id:"novidade", titulo:"Que tal sair do automático?", texto:"Uma seleção para quem quer abrir o catálogo sem procurar sempre as mesmas coisas.", href:"catalogo.html#produtos", termos:[] }
];

const seguroHref = (href) => /^(?:catalogo\.html)(?:[?#].*)?$/.test(href) ? href : "catalogo.html";

const criarTrilha = (item) => {
  const a=document.createElement("a");
  a.className="editorial-trilha";
  a.href=seguroHref(item.href);
  const strong=document.createElement("strong"); strong.textContent=item.titulo;
  const span=document.createElement("span"); span.textContent=item.texto;
  const small=document.createElement("small"); small.textContent="Explorar esta ideia →";
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
    ["Descubra por um novo ângulo","Hoje, deixe a curiosidade escolher o caminho.","Nem toda descoberta começa pelo nome de um produto. Às vezes começa por uma textura, um aroma, uma pausa ou uma nova ideia para a cozinha."],
    ["Uma visita, vários caminhos","O que combina com o seu momento agora?","Explore o catálogo por sensações e situações do cotidiano. Amanhã, outra trilha pode chamar mais a sua atenção."],
    ["Além da lista de produtos","Transforme o catálogo em uma coleção de ideias.","Comece por algo familiar, siga por uma categoria diferente e salve o que despertar vontade de conhecer melhor."]
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
        a.href=/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)?`produto/${slug}.html`:"catalogo.html";
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
