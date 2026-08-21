(()=>{"use strict";
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();
const moeda=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const subtotal=itens=>(itens||[]).reduce((s,i)=>{const base=Number(i.quantidade_base||1);const qtd=Number(i.quantidade||base);return s+Number(i.subtotal ?? (Number(i.preco||0)*(qtd/base)));},0);
const cupomPorCodigo=(config,codigo)=>(config?.promocoes?.cupons||[]).find(c=>c.ativo!==false&&norm(c.codigo)===norm(codigo))||null;
const baseCupom=(cupom,itens)=>{
 if(cupom?.produtos?.length){const ids=new Set(cupom.produtos.map(String));return subtotal(itens.filter(i=>ids.has(String(i.id))));}
 if(cupom?.categorias?.length){const cs=new Set(cupom.categorias);return subtotal(itens.filter(i=>cs.has(i.categoria)));}
 return subtotal(itens);
};
const avaliarCupom=(config,codigo,itens=[])=>{
 const cupom=cupomPorCodigo(config,codigo), bruto=subtotal(itens);
 if(!cupom)return {valido:false,codigo:norm(codigo),desconto:0,motivo:"Cupom não encontrado ou inativo."};
 if(bruto<Number(cupom.pedidoMinimo||0))return {valido:false,codigo:cupom.codigo,desconto:0,motivo:`Pedido mínimo de ${moeda(cupom.pedidoMinimo)}.`};
 const base=baseCupom(cupom,itens);
 if(base<=0)return {valido:false,codigo:cupom.codigo,desconto:0,motivo:"O cupom não se aplica aos produtos selecionados."};
 const desconto=cupom.tipo==="percentual"?base*(Number(cupom.valor||0)/100):Math.min(base,Number(cupom.valor||0));
 return {valido:true,codigo:cupom.codigo,desconto:Math.max(0,desconto),freteGratis:!!cupom.freteGratis,descricao:cupom.descricao||""};
};
const melhorCupom=(config,itens,codigos=[])=>codigos.map(c=>avaliarCupom(config,c,itens)).filter(x=>x.valido).sort((a,b)=>(Number(b.freteGratis)-Number(a.freteGratis))||b.desconto-a.desconto)[0]||null;
const calcularPontosGerados=(config,valor)=>{
 const p=config?.promocoes?.pontos||{}; if(p.ativo===false)return 0;
 return Math.floor(Number(valor||0)*Number(p.pontosPorReal||1)/Number(p.reaisPorPonto||1));
};
const calcularResgate=(config,pontos,subtotalPedido)=>{
 const p=config?.promocoes?.pontos||{}, qtd=Math.max(0,Math.floor(Number(pontos||0)));
 if(p.ativo===false||qtd<Number(p.resgateMinimo||0))return {pontosUsados:0,desconto:0};
 const valor=qtd/Number(p.pontosPorRealDesconto||20);
 const teto=Number(subtotalPedido||0)*(Number(p.maximoPercentualPedido||30)/100);
 const desconto=Math.min(valor,teto);
 const usados=Math.floor(desconto*Number(p.pontosPorRealDesconto||20));
 return {pontosUsados:usados,desconto:usados/Number(p.pontosPorRealDesconto||20)};
};
const calcular=(config,itens=[],opts={})=>{
 const bruto=subtotal(itens), cupom=opts.cupom?avaliarCupom(config,opts.cupom,itens):null;
 const descontoCupom=cupom?.valido?cupom.desconto:0;
 const pontos=calcularResgate(config,opts.pontosUsar||0,Math.max(0,bruto-descontoCupom));
 const total=Math.max(0,bruto-descontoCupom-pontos.desconto);
 const fg=config?.promocoes?.freteGratis||{};
 const freteGratis=!!(cupom?.valido&&cupom.freteGratis)||(fg.ativo!==false&&bruto>=Number(fg.valorMinimo||Infinity));
 const faltaFrete=freteGratis?0:Math.max(0,Number(fg.valorMinimo||0)-bruto);
 return {subtotal:bruto,cupom,descontoCupom,pontosUsados:pontos.pontosUsados,descontoPontos:pontos.desconto,total,freteGratis,faltaFrete,pontosGerados:calcularPontosGerados(config,total)};
};
window.QualimaxPromocoes={normalizarCodigo:norm,subtotal,avaliarCupom,melhorCupom,calcularPontosGerados,calcularResgate,calcular,moeda};
})();
