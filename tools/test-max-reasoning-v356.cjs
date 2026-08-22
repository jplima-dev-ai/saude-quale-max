const fs=require("fs"),vm=require("vm"),assert=require("assert");let store={};
const context={window:{QualimaxSecurity:{readStorage:(k,d)=>store[k]??d,writeStorage:(k,v)=>(store[k]=v,true)},QualimaxMaxCore:{normalizar:v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()}},Intl,console,setTimeout};
vm.createContext(context);vm.runInContext(fs.readFileSync("assets/scripts/max-reasoning-v356.js","utf8"),context);const R=context.window.QualimaxMaxReasoning;
let out=R.respond("você entendeu errado <img src=x onerror=alert(1)>",{});assert(out.message.includes("Obrigado por me corrigir"));assert(!out.message.includes("<"));
R.respond("quero gastar até 80 reais e prefiro sem glúten",{});out=R.respond("o que você entendeu?",{});assert(out.message.includes("R$ 80,00")||out.message.includes("R$ 80,00"));assert(out.message.includes("sem glúten"));
const products=[{id:1,nome:"Opção A",categoria:"chas",preco:30},{id:2,nome:"Opção B",categoria:"chas",preco:20}];out=R.respond("e uma mais barata?",{products,lastResults:[products[0]]});assert(out.message.includes("Opção B"));
out=R.respond("qual o endereço e horário?",{config:{contato:{endereco:"Rua Teste, 10"},comercial:{horario:"segunda a sexta"}}});assert(out.message.includes("Rua Teste, 10")&&out.message.includes("segunda a sexta"));
assert(R.state().turns.length<=12);console.log("MAX_REASONING_V356_OK");
