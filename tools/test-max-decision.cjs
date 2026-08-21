global.window=global;
global.document={body:{dataset:{}},location:{}};
global.location={pathname:'/catalog.html',search:'?categoria=alimentos&busca=cacau'};
require('../assets/scripts/max-core.js');
require('../assets/scripts/max-decision.js');
const D=window.QualimaxMaxDecision;
const produtos=[
 {id:1,nome:'Óleo de Coco Extravirgem',tipo:'oleo',categoria:'alimentos',tags:['oleo']},
 {id:2,nome:'Óleo Essencial de Lavanda',tipo:'oleo',categoria:'cuidados',tags:['oleo essencial']},
 {id:3,nome:'Cacau em Pó',tipo:'po',categoria:'alimentos',tags:['cacau']}
];
const assert=(c,m)=>{if(!c)throw new Error(m)};
assert(D.detectarAmbiguidade('quero óleo',produtos).ambigua===true,'óleo deve ser ambíguo');
assert(D.detectarAmbiguidade('quero óleo de coco extravirgem',produtos).ambigua===false,'produto específico não deve ser ambíguo');
assert(D.calcularConfianca({texto:'cacau',intencao:'produto',candidatos:[produtos[2]],preferencias:{}}).nivel==='alta','produto único deve ter alta confiança');
assert(D.conflitos({tipo:'po',excluirTipos:['po'],excluirCategorias:[]}).length===1,'conflito de tipo');
assert(D.sugestaoConflito({tipo:'po',excluirTipos:['po'],excluirCategorias:[]}).tipo==='formato','sugestão de conflito de formato');
const ctx=D.contextoPagina(produtos);
assert(ctx.tipo==='catalogo' && ctx.temFiltros===true,'contexto de catálogo deve reconhecer filtros');
assert(ctx.filtros.categoria==='alimentos','categoria do catálogo');
const conf=D.avaliarConfianca({texto:'oleo',intencao:'busca',candidatos:[produtos[0],produtos[1]],preferencias:{}});
assert(['baixa','media'].includes(conf.nivel),'ambiguidade não deve ter alta confiança');
assert(typeof conf.motivo==='string' && conf.motivo.length>0,'confiança deve explicar motivo');
console.log('MAX_DECISION_ENGINE_TESTS_OK');
