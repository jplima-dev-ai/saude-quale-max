(() => {
    "use strict";

    const normalizar = window.QualimaxMaxCore?.normalizar || ((texto) => String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim());

    /*
     * A ordem é intencional.
     * Intenções de segurança e conversa guiada vêm antes das regras
     * comerciais mais genéricas para evitar falsos positivos.
     */
    const REGRAS = Object.freeze([
        ["medica", /\b(?:curar|cura|tratar|tratamento|doenca|diabetes|pressao alta|colesterol|ansiedade|depressao|remedio|medicamento|emagrecer|emagrecimento)\b/],
        ["descoberta", /\b(?:nao sei(?: o)? que escolher|me ajuda a escolher|ajuda(?:r)? a escolher|o que escolher|por onde comeco|quero encontrar um produto|quero escolher|me ajuda a encontrar|me recomenda(?: algo)?|me sugere(?: algo| alguma coisa)?|quero uma sugestao|alguma sugestao|o que voce recomenda)\b/],
        ["preferencias", /\b(?:o que voce entendeu|minhas preferencias|o que eu pedi|como esta minha busca|resuma minha busca)\b/],
        ["loja", /\b(?:endereco|onde fica|localizacao|como chegar|telefone|email|e-mail|contato|horario|abre|fecha|funcionamento)\b/],
        ["categorias", /^(?:categorias|ver categorias|mostrar categorias|quais categorias)$/],
        ["comparar", /\b(?:comparar|comparacao|versus|vs|qual a diferenca)\b/],
        ["contexto-produto", /^(?:ele|ela|esse|essa|este|esta|isso)\b|\b(?:esse produto|este produto|essa opcao)\b/],
        ["produto", /^(?:o que e|me fala sobre|fale sobre|detalhes de|detalhes do|detalhes da|pra que serve|para que serve)\b/],
        ["similares", /\b(?:parecido|parecidos|semelhante|semelhantes|alternativa|alternativas)\b/],
        ["anterior", /^(?:voltar|anterior|antes)$|\b(?:voltar.*busca|busca anterior)\b/],
        ["redes", /\b(?:instagram|facebook|tiktok|tik tok|youtube|pinterest|rede social|redes sociais)\b/],
        ["humano", /\b(?:whatsapp|pessoa|humano|atendimento|especialista)\b/],
        ["entrega", /\b(?:entrega|entregam|entregar|frete)\b/],
        ["preco", /\b(?:preco|valor|custa|custo)\b/],
        ["quiz", /\bquiz\b/],
        ["cafe-manha", /\bcafe da manha\b/],
        ["lanche", /\blanche\b/]
    ]);

    const detectar = (termo) => {
        const texto = normalizar(termo)
            .replace(/[!?.,;:()[\]{}"']/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        for (const [id, regex] of REGRAS) {
            if (regex.test(texto)) return id;
        }
        return "busca";
    };

    const ehPerguntaMedica = (termo) => detectar(termo) === "medica";

    window.QualimaxMaxIntencoes = Object.freeze({
        detectar,
        ehPerguntaMedica,
        regras: REGRAS.map(([id]) => id)
    });
})();