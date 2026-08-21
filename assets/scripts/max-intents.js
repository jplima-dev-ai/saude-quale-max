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
        ["medica", /\b(?:curar|cura|tratar|tratamento|doenca|diabetes|pressao alta|colesterol|ansiedade|depressao|remedio|medicamento|emagrecer|emagrecimento|contraindicacao|contraindicacoes|posologia|dose terapeutica)\b/],
        ["descoberta", /\b(?:nao sei(?: o)? que escolher|me ajuda a escolher|ajuda(?:r)? a escolher|o que escolher|por onde comeco|quero encontrar um produto|quero escolher|me ajuda a encontrar|me recomenda(?: algo)?|me sugere(?: algo| alguma coisa)?|quero uma sugestao|alguma sugestao|o que voce recomenda)\b/],
        ["preferencias", /\b(?:o que voce entendeu|minhas preferencias|o que eu pedi|como esta minha busca|resuma minha busca)\b/],
        ["explicacao", /\b(?:por que essa opcao|por que este produto|por que esse produto|por que recomendou|por que voce escolheu|explique sua escolha|como chegou nessa opcao|qual foi o criterio)\b/],
        ["loja", /\b(?:endereco|onde fica|localizacao|como chegar|telefone|email|e-mail|contato|horario|abre|fecha|funcionamento)\b/],
        ["categorias", /^(?:categorias|ver categorias|mostrar categorias|quais categorias)$/],
        ["comparar", /\b(?:comparar|comparacao|versus|vs|qual a diferenca|qual dos dois|qual deles|entre os dois|desses dois|qual e melhor entre)\b/],
        ["contexto-produto", /^(?:ele|ela|esse|essa|este|esta|isso)\b|\b(?:esse produto|este produto|essa opcao)\b/],
        ["produto", /^(?:o que e|me fala sobre|fale sobre|detalhes de|detalhes do|detalhes da|pra que serve|para que serve)\b/],
        ["similares", /\b(?:parecido|parecidos|semelhante|semelhantes|alternativa|alternativas|outra opcao|outras opcoes|algo parecido)\b/],
        ["anterior", /^(?:voltar|anterior|antes)$|\b(?:voltar.*busca|busca anterior)\b/],
        ["redes", /\b(?:instagram|facebook|tiktok|tik tok|youtube|pinterest|rede social|redes sociais)\b/],
        ["humano", /\b(?:whatsapp|pessoa|humano|atendimento|especialista)\b/],
        ["entrega", /\b(?:entrega|entregam|entregar|frete)\b/],
        ["preco", /\b(?:preco|valor|custa|custo|barato|baratos|barata|baratas|mais em conta|menor preco|orcamento|tenho(?: r\$)? \d+|posso gastar(?: r\$)? \d+|quero gastar(?: r\$)? \d+|no maximo(?: r\$)? \d+|ate(?: r\$)? \d+)\b/],
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