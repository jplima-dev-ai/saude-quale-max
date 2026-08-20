(() => {
    "use strict";

    const REGRAS = Object.freeze([
        ["medica", /curar|cura|tratar|tratamento|doenca|doença|diabetes|pressao alta|pressão alta|colesterol|ansiedade|depressao|depressão|remedio|remédio|medicamento|emagrecer|emagrecimento/],
        ["loja", /endereco|endereço|onde fica|localizacao|localização|como chegar|telefone|email|e-mail|contato|horario|horário|abre|fecha|funcionamento/],
        ["categorias", /^(categorias|ver categorias|mostrar categorias)$/],
        ["comparar", /comparar|comparacao|comparação|versus| vs |qual a diferenca|qual a diferença/],
        ["contexto-produto", /^(ele|ela|esse|essa|este|esta|isso)\b|esse produto|essa opcao|essa opção/],
        ["produto", /o que e|o que é|me fala sobre|fale sobre|detalhes de|detalhes do|detalhes da|pra que serve|para que serve/],
        ["descoberta", /nao sei|não sei|me ajuda a escolher|ajuda escolher|o que escolher|por onde comeco|por onde começo/],
        ["similares", /parecido|parecidos|semelhante|semelhantes|alternativa|alternativas/],
        ["anterior", /^(voltar|anterior|antes)$|voltar.*busca|busca anterior/],
        ["redes", /instagram|facebook|tiktok|tik tok|youtube|pinterest|rede social|redes sociais/],
        ["humano", /whatsapp|pessoa|humano|atendimento|especialista/],
        ["entrega", /entrega|entregam|entregar|frete/],
        ["preco", /preco|preço|valor|custa|custo/],
        ["quiz", /\bquiz\b/],
        ["cafe-manha", /cafe da manha|café da manhã/],
        ["lanche", /\blanche\b/]
    ]);

    const detectar = (termo) => {
        const texto = String(termo || "");
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