global.window=global;
global.document={body:{dataset:{}}};
global.location={pathname:'/catalog.html',search:''};
require('../assets/scripts/max-core.js');
require('../assets/scripts/max-decision.js');

const D=window.QualimaxMaxDecision;
const assert=(c,m)=>{if(!c)throw new Error(m)};

const produtos=[
 {id:1,nome:'Chá A',categoria:'chas',preco:10,destaque:true},
 {id:2,nome:'Granola',categoria:'alimentos',preco:20},
 {id:3,nome:'Mel',categoria:'alimentos',preco:25},
 {id:4,nome:'Lavanda',categoria:'cuidados',preco:30},
 {id:5,nome:'Vitamina',categoria:'vitaminas',preco:40},
 {id:6,nome:'Item caro',categoria:'outros',preco:200}
];

let c=D.montarCestaPorOrcamento(produtos,70);
assert(c.itens.length>0,'cesta deve ter itens');
assert(c.total<=70,'cesta não pode ultrapassar orçamento');
assert(!c.itens.some(p=>p.id===6),'item acima do orçamento');

c=D.montarCestaPorOrcamento(produtos,60,{excluidos:['1']});
assert(!c.itens.some(p=>p.id===1),'produto excluído não pode entrar');

c=D.montarCestaPorOrcamento(produtos,60,{preferidos:['4']});
assert(c.itens.some(p=>p.id===4),'produto preferido deve ganhar prioridade quando couber');

const a=D.avaliarCesta(c.itens);
assert(a.total<=60,'avaliação da cesta');
assert(a.diversidade>=1,'diversidade');
console.log('MAX_GIFT_BASKET_TESTS_OK');