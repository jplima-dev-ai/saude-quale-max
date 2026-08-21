(() => {
  "use strict";

  const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);
  const plain = value => value !== null && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const text = (value, max = 160) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
  const number = (value, min = 0, max = 1e6) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min;
  };
  const safeClone = (value, depth = 0) => {
    if (depth > 12) throw new Error("Estrutura profunda demais");
    if (Array.isArray(value)) return value.slice(0, 1000).map(item => safeClone(item, depth + 1));
    if (!plain(value)) {
      if (["string", "number", "boolean"].includes(typeof value) || value === null) return value;
      throw new Error("Tipo não permitido");
    }
    const out = Object.create(null);
    for (const [key, item] of Object.entries(value)) {
      if (BLOCKED_KEYS.has(key)) throw new Error("Chave insegura");
      out[text(key, 100)] = safeClone(item, depth + 1);
    }
    return out;
  };
  const parseJSON = (source, fallback = null, maxBytes = 2 * 1024 * 1024) => {
    if (typeof source !== "string" || source.length > maxBytes) return fallback;
    try { return safeClone(JSON.parse(source)); } catch { return fallback; }
  };
  const cart = value => (Array.isArray(value) ? value : []).slice(0, 100).map(item => ({
    key: text(item?.key, 100), id: text(item?.id, 80), slug: text(item?.slug, 100),
    nome: text(item?.nome, 120), imagem: text(item?.imagem, 300), preco: number(item?.preco),
    variante: text(item?.variante || "Padrão", 80), qtd: Math.round(number(item?.qtd, 1, 99))
  })).filter(item => item.key && item.nome);
  const events = value => (Array.isArray(value) ? value : []).slice(-500).map(item => ({
    tipo: text(item?.tipo, 50), dados: plain(item?.dados) ? safeClone(item.dados) : Object.create(null),
    em: /^\d{4}-\d{2}-\d{2}T/.test(String(item?.em || "")) ? String(item.em) : new Date().toISOString()
  })).filter(item => item.tipo);
  const orders = value => (Array.isArray(value) ? value : []).slice(0, 20).map(item => ({
    id: text(item?.id, 80), em: text(item?.em, 40), itens: cart(item?.itens), total: number(item?.total)
  }));
  const readStorage = (key, fallback) => {
    const parsed = parseJSON(localStorage.getItem(key), fallback);
    if (key.includes("carrinho")) return cart(parsed);
    if (key.includes("eventos")) return events(parsed);
    if (key.includes("pedidos")) return orders(parsed);
    return parsed ?? fallback;
  };
  const writeStorage = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };

  window.QualimaxSecurity = Object.freeze({ text, number, safeClone, parseJSON, cart, events, orders, readStorage, writeStorage });
})();
