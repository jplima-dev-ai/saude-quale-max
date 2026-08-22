const fs=require("fs"),vm=require("vm"),assert=require("assert");
const memory=new Map();
const context={
  console,setTimeout,clearTimeout,JSON,Date,Object,Array,String,Number,Math,Set,Promise,
  localStorage:{getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)},
  document:{dispatchEvent(){}},CustomEvent:function(type,init){this.type=type;this.detail=init?.detail},
};
context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync("assets/scripts/security.js","utf8"),context);
vm.runInContext(fs.readFileSync("assets/scripts/db.js","utf8"),context);
(async()=>{
  assert.strictEqual(await context.QualimaxDB.toggleFavorito("__proto__"),false);
  assert.strictEqual(await context.QualimaxDB.toggleInteresse("constructor"),false);
  await context.QualimaxDB.seedProdutos([{id:"__proto__",nome:"ataque"},{id:1,nome:"Seguro"}]);
  const products=await context.QualimaxDB.getProdutos();
  assert.strictEqual(products.length,1);assert.strictEqual(products[0].nome,"Seguro");
  memory.set("qualimax-db-fallback-v2",'{"__proto__":{"polluted":true}}');
  assert.deepStrictEqual(await context.QualimaxDB.getFavoritos(),[]);
  assert.strictEqual({}.polluted,undefined);
  console.log("security v3.5.1: prototype pollution blocked");
})().catch(e=>{console.error(e);process.exit(1)});
