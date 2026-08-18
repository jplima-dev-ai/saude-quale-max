(() => {
    "use strict";

    const DB_NAME = "qualimax-db";
    const DB_VERSION = 2;
    const fallbackKey = "qualimax-db-fallback-v2";
    let dbPromise = null;

    const abrirDB = () => {
        if (!('indexedDB' in window)) return Promise.resolve(null);
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains("produtos")) db.createObjectStore("produtos", { keyPath: "id" });
                if (!db.objectStoreNames.contains("favoritos")) db.createObjectStore("favoritos", { keyPath: "produtoId" });
                if (!db.objectStoreNames.contains("interesse")) db.createObjectStore("interesse", { keyPath: "produtoId" });
                if (!db.objectStoreNames.contains("historico")) db.createObjectStore("historico", { keyPath: "produtoId" });
                if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "chave" });
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
            req.onblocked = () => resolve(null);
        });
        return dbPromise;
    };

    const fallbackLer = () => {
        try { return JSON.parse(localStorage.getItem(fallbackKey) || "{}"); }
        catch { return {}; }
    };
    const fallbackSalvar = (dados) => {
        try { localStorage.setItem(fallbackKey, JSON.stringify(dados)); } catch {}
    };

    const getAll = async (store) => {
        const db = await abrirDB();
        if (!db) return Object.values(fallbackLer()[store] || {});
        return new Promise((resolve) => {
            const tx = db.transaction(store, "readonly");
            const req = tx.objectStore(store).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });
    };

    const get = async (store, key) => {
        const db = await abrirDB();
        if (!db) return fallbackLer()[store]?.[String(key)] || null;
        return new Promise((resolve) => {
            const tx = db.transaction(store, "readonly");
            const req = tx.objectStore(store).get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    };

    const put = async (store, value) => {
        const db = await abrirDB();
        if (!db) {
            const dados = fallbackLer();
            dados[store] ||= {};
            const key = value.id ?? value.produtoId ?? value.chave;
            dados[store][String(key)] = value;
            fallbackSalvar(dados);
            return value;
        }
        return new Promise((resolve) => {
            const tx = db.transaction(store, "readwrite");
            tx.objectStore(store).put(value);
            tx.oncomplete = () => resolve(value);
            tx.onerror = () => resolve(value);
        });
    };

    const remove = async (store, key) => {
        const db = await abrirDB();
        if (!db) {
            const dados = fallbackLer();
            if (dados[store]) delete dados[store][String(key)];
            fallbackSalvar(dados);
            return;
        }
        return new Promise((resolve) => {
            const tx = db.transaction(store, "readwrite");
            tx.objectStore(store).delete(key);
            tx.oncomplete = resolve;
            tx.onerror = resolve;
        });
    };

    const clear = async (store) => {
        const db = await abrirDB();
        if (!db) {
            const dados = fallbackLer();
            dados[store] = {};
            fallbackSalvar(dados);
            return;
        }
        return new Promise((resolve) => {
            const tx = db.transaction(store, "readwrite");
            tx.objectStore(store).clear();
            tx.oncomplete = resolve;
            tx.onerror = resolve;
        });
    };

    const seedProdutos = async (produtos) => {
        if (!Array.isArray(produtos)) return;
        const db = await abrirDB();
        if (!db) {
            const dados = fallbackLer();
            dados.produtos = Object.fromEntries(produtos.map(p => [String(p.id), p]));
            fallbackSalvar(dados);
            return;
        }
        await new Promise((resolve) => {
            const tx = db.transaction("produtos", "readwrite");
            const store = tx.objectStore("produtos");
            store.clear();
            produtos.forEach(p => store.put(p));
            tx.oncomplete = resolve;
            tx.onerror = resolve;
        });
        await put("meta", { chave: "catalogoAtualizadoEm", valor: Date.now() });
    };

    const toggle = async (store, produtoId) => {
        const atual = await get(store, produtoId);
        if (atual) {
            await remove(store, produtoId);
            return false;
        }
        await put(store, { produtoId, atualizadoEm: Date.now() });
        return true;
    };

    const addHistorico = async (produtoId) => {
        await put("historico", { produtoId, vistoEm: Date.now() });
    };

    window.QualimaxDB = {
        init: abrirDB,
        seedProdutos,
        getProdutos: () => getAll("produtos"),
        getFavoritos: () => getAll("favoritos"),
        getInteresse: () => getAll("interesse"),
        getHistorico: () => getAll("historico"),
        isFavorito: async (id) => !!(await get("favoritos", id)),
        isInteresse: async (id) => !!(await get("interesse", id)),
        toggleFavorito: (id) => toggle("favoritos", id),
        toggleInteresse: (id) => toggle("interesse", id),
        addHistorico,
        limparInteresse: () => clear("interesse"),
        limparFavoritos: () => clear("favoritos"),
        modo: () => ('indexedDB' in window ? "IndexedDB" : "localStorage-fallback")
    };
})();
