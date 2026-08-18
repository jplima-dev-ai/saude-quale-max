(() => {
    "use strict";
    document.addEventListener("DOMContentLoaded", () => {
        const root = document.documentElement;
        const salvar = (chave, valor) => { try { localStorage.setItem(chave, valor); } catch {} };
        const aplicar = () => {
            try {
                const estados = {
                    texto: localStorage.getItem("qualemax-texto") === "grande",
                    contraste: localStorage.getItem("qualemax-contraste") === "alto",
                    leitura: localStorage.getItem("qualemax-leitura") === "sim",
                    movimento: localStorage.getItem("qualemax-movimento") === "sim"
                };
                root.classList.toggle("texto-grande", estados.texto);
                root.classList.toggle("alto-contraste", estados.contraste);
                root.classList.toggle("leitura-facil", estados.leitura);
                root.classList.toggle("movimento-reduzido", estados.movimento);
                document.querySelector("[data-texto-maior]")?.setAttribute("aria-pressed", String(estados.texto));
                document.querySelector("[data-alto-contraste]")?.setAttribute("aria-pressed", String(estados.contraste));
                document.querySelector("[data-reduzir-movimento]")?.setAttribute("aria-pressed", String(estados.movimento));
                document.querySelector("[data-leitura-facil]")?.setAttribute("aria-pressed", String(estados.leitura));
            } catch {}
        };
        const toggle = document.querySelector("[data-acessibilidade-toggle]");
        const painel = document.querySelector("[data-acessibilidade-painel]");
        const atualizarPainel = () => {
            if (toggle && painel) toggle.setAttribute("aria-expanded", String(!painel.hidden));
        };
        toggle?.addEventListener("click", () => {
            if (!painel) return;
            painel.hidden = !painel.hidden;
            atualizarPainel();
            if (!painel.hidden) painel.querySelector("button")?.focus();
        });
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && painel && !painel.hidden) {
                painel.hidden = true;
                atualizarPainel();
                toggle?.focus();
            }
        });
        document.querySelector("[data-texto-maior]")?.addEventListener("click", () => { salvar("qualemax-texto", "grande"); aplicar(); });
        document.querySelector("[data-texto-normal]")?.addEventListener("click", () => { salvar("qualemax-texto", "normal"); aplicar(); });
        document.querySelector("[data-alto-contraste]")?.addEventListener("click", () => {
            const ativo = root.classList.contains("alto-contraste");
            salvar("qualemax-contraste", ativo ? "normal" : "alto"); aplicar();
        });
        document.querySelector("[data-reduzir-movimento]")?.addEventListener("click", () => {
            const ativo = root.classList.contains("movimento-reduzido");
            salvar("qualemax-movimento", ativo ? "nao" : "sim"); aplicar();
        });
        document.querySelector("[data-leitura-facil]")?.addEventListener("click", () => {
            const ativo = root.classList.contains("leitura-facil");
            salvar("qualemax-leitura", ativo ? "nao" : "sim"); aplicar();
        });
        document.querySelector("[data-acessibilidade-reset]")?.addEventListener("click", () => { ["qualemax-texto","qualemax-contraste","qualemax-leitura","qualemax-movimento"].forEach((key) => { try { localStorage.removeItem(key); } catch {} }); aplicar(); });
        atualizarPainel();
        aplicar();
    });
})();
