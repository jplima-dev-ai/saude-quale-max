const fs = require("fs");
const vm = require("vm");
const storage = new Map();
const context = {
  window: {},
  localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
  console
};
vm.createContext(context);
vm.runInContext(fs.readFileSync("assets/scripts/security.js", "utf8"), context);
const s = context.window.QualimaxSecurity;
const assert = (ok, message) => { if (!ok) throw new Error(message); };
assert(s.parseJSON('{"__proto__":{"polluted":true}}', null) === null, "prototype pollution aceita");
assert(s.parseJSON("[" + "0,".repeat(1100000) + "0]", null) === null, "JSON excessivo aceito");
storage.set("qualimax-carrinho-v333", JSON.stringify([{key:"x",nome:"Produto",preco:-100,qtd:999999}]));
const cart = s.readStorage("qualimax-carrinho-v333", []);
assert(cart[0].preco === 0 && cart[0].qtd === 99, "valores adulterados não foram limitados");
const many = Array.from({length: 700}, (_, i) => ({tipo:"busca",dados:{termo:"x"},em:new Date().toISOString()}));
assert(s.events(many).length === 500, "eventos sem limite");
console.log("SECURITY_RUNTIME_V336_OK");
