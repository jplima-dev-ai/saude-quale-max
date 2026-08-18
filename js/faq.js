(() => {
    "use strict";
    document.addEventListener("DOMContentLoaded", async () => {
        const lista = document.querySelector("[data-faq-list]");
        if (!lista) return;
        try {
            const resposta = await fetch("./data/faq.json");
            if (!resposta.ok) throw new Error("Falha ao carregar FAQ.");
            const dados = await resposta.json();
            const itens = Array.isArray(dados.faq) ? dados.faq : [];
            lista.replaceChildren(...itens.map((item) => {
                const details=document.createElement("details");
                const summary=document.createElement("summary");
                const p=document.createElement("p");
                summary.textContent=item.pergunta || "Pergunta";
                p.textContent=item.resposta || "Consulte a equipe para mais informações.";
                details.append(summary,p);
                return details;
            }));
            const perguntas = [...lista.querySelectorAll("details")];
            perguntas.forEach((pergunta) => pergunta.addEventListener("toggle", () => {
                if (!pergunta.open) return;
                perguntas.forEach((outra) => { if (outra !== pergunta) outra.open = false; });
            }));
        } catch (erro) {
            console.error(erro);
            lista.innerHTML = "<p role=\"alert\">Não foi possível carregar as perguntas frequentes agora.</p>";
        }
    });
})();
