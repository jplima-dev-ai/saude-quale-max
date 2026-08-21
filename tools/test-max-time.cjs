function obterTempoLocal(agora){
 const hora=agora.getHours();
 const minuto=agora.getMinutes();
 const periodo=hora < 12 ? "manha" : hora < 18 ? "tarde" : "noite";
 const saudacao=periodo==="manha" ? "Bom dia" : periodo==="tarde" ? "Boa tarde" : "Boa noite";
 return {hora,minuto,periodo,saudacao};
}
const a=(h,m=0)=>obterTempoLocal(new Date(2026,7,20,h,m));
const assert=(c,m)=>{if(!c)throw new Error(m)};
assert(a(0).saudacao==="Bom dia","00h");
assert(a(11,59).saudacao==="Bom dia","11:59");
assert(a(12).saudacao==="Boa tarde","12h");
assert(a(17,59).saudacao==="Boa tarde","17:59");
assert(a(18).saudacao==="Boa noite","18h");
assert(a(23,59).saudacao==="Boa noite","23:59");
console.log("MAX_LOCAL_TIME_BOUNDARIES_OK");