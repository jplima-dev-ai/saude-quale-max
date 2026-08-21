global.window=global;
require("../js/max-core.js");
require("../js/max-nlu.js");
require("../js/max-intencoes.js");

const N=window.QualimaxMaxNLU;
const I=window.QualimaxMaxIntencoes;
const assert=(c,m)=>{if(!c) throw new Error(m);};

let x=N.extrair("quero algo sem glutem, vegano e até 40 reais");
assert(x.semGluten===true,"sem glúten com erro comum");
assert(x.vegana===true,"vegano");
assert(x.orcamento===40,"orçamento");

x=N.extrair("não quero em cápsulas, prefiro em pó");
assert(x.excluirTipos.includes("capsula"),"negação cápsula");
assert(x.tipo==="po","preferência pó");

x=N.extrair("quero o mais em conta");
assert(x.prioridade==="preco","prioridade preço");

assert(I.detectar("qual dos dois combina mais comigo")==="comparar","comparação contextual");
assert(I.detectar("me mostra outra opção parecida")==="similares","similar natural");
assert(I.detectar("tenho no máximo 35 reais")==="preco","orçamento natural");

console.log("MAX_NLU_TESTS_OK");