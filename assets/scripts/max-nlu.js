(() => {
    "use strict";

    const normalizar = window.QualimaxMaxCore?.normalizar || (t => String(t||"").toLowerCase().trim());

    const CORRECOES = Object.freeze({
        "glutem":"gluten","capsulas":"capsulas","capsula":"capsula",
        "cha":"cha","creatina":"creatina","granolla":"granola","camomilla":"camomila",
        "hibísco":"hibisco","himaláia":"himalaia","emalaia":"himalaia",
        "acucar":"acucar","cacau":"cacau","castanha":"castanha"
    });

    const corrigir = texto => normalizar(texto)
        .split(/\s+/)
        .map(p => {
            const limpo=p.replace(/[^a-z0-9-]/g,"");
            return CORRECOES[limpo] || p;
        })
        .join(" ");

    const extrair = texto => {
        const t=corrigir(texto);
        const dados={
            texto:t,
            vegana:null,
            semGluten:null,
            tipo:"",
            excluirTipos:[],
            prioridade:"",
            orcamento:null,
            comparativo:null
        };

        if(/\b(?:vegano|vegana|veganos|veganas)\b/.test(t) && !/\b(?:nao|sem)\s+(?:precisa\s+ser\s+)?vegan/.test(t)) dados.vegana=true;
        if(/\bsem\s+gluten\b/.test(t)) dados.semGluten=true;

        if(/\b(?:nao quero|sem|evitar|menos)\s+(?:em\s+)?capsulas?\b/.test(t)) dados.excluirTipos.push("capsula");
        else if(/\b(?:capsula|capsulas|em capsulas)\b/.test(t)) dados.tipo="capsula";

        if(/\b(?:nao quero|sem|evitar|menos)\s+(?:em\s+)?po\b/.test(t)) dados.excluirTipos.push("po");
        else if(/\b(?:em\s+po|formato\s+po)\b/.test(t)) dados.tipo="po";

        if(/\b(?:nao quero|sem|evitar|menos)\s+(?:em\s+)?liquido\b/.test(t)) dados.excluirTipos.push("liquido");
        else if(/\b(?:liquido|em liquido)\b/.test(t)) dados.tipo="liquido";

        const money=t.match(/\b(?:ate|tenho|orcamento(?: de)?|posso gastar|quero gastar|no maximo)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/);
        if(money) dados.orcamento=Number(money[1].replace(",","."));

        if(/\b(?:mais barato|menor preco|mais em conta|economizar|economico)\b/.test(t)) dados.prioridade="preco";
        if(/\b(?:mais caro|maior preco)\b/.test(t)) dados.prioridade="maior-preco";

        if(/\b(?:qual dos dois|qual deles|entre os dois|desses dois)\b/.test(t)) dados.comparativo="contextual";

        return dados;
    };

    const ehRespostaCurta = texto => /^(?:sim|nao|não|isso|esse|essa|este|esta|pode ser|prefiro|tanto faz|qualquer um|qualquer uma|o primeiro|o segundo|primeiro|segundo)$/i.test(String(texto||"").trim());

    window.QualimaxMaxNLU=Object.freeze({corrigir,extrair,ehRespostaCurta});
})();