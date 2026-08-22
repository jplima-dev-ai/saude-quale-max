const fs=require("fs"),vm=require("vm");
const ctx={window:{QualimaxMaxCore:{normalizar:t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()}},console};
vm.createContext(ctx);vm.runInContext(fs.readFileSync("assets/scripts/max-intelligence.js","utf8"),ctx);
const M=ctx.window.QualimaxMaxIntelligence,ok=(x,m)=>{if(!x)throw Error(m)};
const produtos=[
 {id:1,nome:"Chá Sereno",categoria:"chas",tipo:"cha",preco:20,vegana:true,sem_gluten:true,tags:["relaxamento","sono"],beneficios:["Calma"]},
 {id:2,nome:"Cápsula Energia",categoria:"vitaminas",tipo:"capsula",preco:40,vegana:true,sem_gluten:true,tags:["energia"]},
 {id:3,nome:"Chá Premium",categoria:"chas",tipo:"cha",preco:80,vegana:true,sem_gluten:true,tags:["relaxamento"]}
];
const a=M.analisar("quero relaxar, vegano e sem glúten até R$ 30");
ok(a.objetivos.includes("relaxamento")&&a.restricoes.vegana&&a.restricoes.semGluten&&a.orcamento===30,"NLU composto falhou");
const r=M.recomendar(produtos,a,{});ok(r.length===1&&r[0].produto.id===1,"ranking com restrições falhou");
ok(r[0].motivos.length>=3,"explicação do ranking ausente");
ok(M.encontrarAproximados("cha sereno",produtos)[0].produto.id===1,"busca aproximada falhou");
ok(M.comparar(produtos).length===3,"comparação falhou");
console.log("MAX_INTELLIGENCE_V337_OK");
