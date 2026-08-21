global.window=global;
require("../assets/scripts/max-core.js");
require("../assets/scripts/max-entities.js");
require("../assets/scripts/max-recommendation.js");
require("../assets/scripts/max-intents.js");

const I=window.QualimaxMaxIntencoes;
const E=window.QualimaxMaxEntidades;
const R=window.QualimaxMaxRecomendacao;

const assert=(cond,msg)=>{if(!cond) throw new Error(msg);};

const intents=[
 ["não sei o que escolher","descoberta"],
 ["nao sei o que escolher","descoberta"],
 ["eu não sei o que escolher","descoberta"],
 ["não, sei, o que escolher","descoberta"],
 ["me ajuda a escolher","descoberta"],
 ["me recomenda algo","descoberta"],
 ["me sugere alguma coisa","descoberta"],
 ["quero uma sugestão","descoberta"],
 ["o que você recomenda","descoberta"],
 ["o que é creatina","produto"],
 ["para que serve creatina","produto"],
 ["qual a diferença entre creatina e whey","comparar"],
 ["creatina para ansiedade","medica"],
 ["qual o preço","preco"],
 ["tenho 50 reais","preco"],
 ["posso gastar 80","preco"],
 ["quero gastar R$ 100","preco"],
 ["tem entrega","entrega"],
 ["instagram","redes"],
 ["quero falar com uma pessoa","humano"],
 ["o que você entendeu","preferencias"],
 ["por que essa opção","explicacao"],
 ["por que você escolheu esse produto","explicacao"],
 ["explique sua escolha","explicacao"],
 ["qual foi o critério","explicacao"],
 ["qual dos dois combina mais comigo","comparar"],
 ["me mostra outra opção parecida","similares"],
 ["tenho no máximo 35 reais","preco"]
];

for(const [entrada,esperada] of intents){
    const obtida=I.detectar(entrada);
    assert(obtida===esperada,`${entrada}: ${obtida} != ${esperada}`);
}

const produtos=[
 {id:1,nome:"Creatina Monohidratada",slug:"creatine-monohydrate",categoria:"suplementos",tipo:"po",vegana:true,sem_gluten:true,tags:["treino"],beneficios:["praticidade"]},
 {id:2,nome:"Whey Protein",slug:"whey-protein",categoria:"suplementos",tipo:"po",vegana:false,sem_gluten:true,tags:["treino"],beneficios:["praticidade"]},
 {id:3,nome:"Chá de Hibisco",slug:"hibiscus-tea",categoria:"chas",tipo:"cha",vegana:true,sem_gluten:true,tags:["cha"],beneficios:["aroma"]}
];

assert(E.produtoPorNome(produtos,"me fala da creatina monohidratada")?.id===1,"produto por nome");
assert(E.produtosMencionados(produtos,"comparar creatina monohidratada com whey protein").length===2,"entidades comparação");
assert(E.resolverReferenciaProduto("comparar esse produto com whey protein",produtos[0]).includes("Creatina Monohidratada"),"referência contextual");
assert(R.similaresAoProduto(produtos,produtos[0],2)[0]?.id===2,"ranking de sehoneyhantes");

console.log("MAX_REGRESSION_TESTS_OK");
