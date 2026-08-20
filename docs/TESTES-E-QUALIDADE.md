# Testes e qualidade

## Automação mínima

```bash
python tools/sincronizar_cliente.py --check
python tools/sincronizar_cliente.py
python tools/auditar_cliente.py
node tools/testar_max.cjs
python tools/testar_seguranca.py
```

## Integridade

- JavaScript, JSON e manifest válidos;
- referências locais sem quebra;
- IDs únicos e um H1 por página;
- 40 produtos correspondendo às páginas, imagens e miniaturas;
- sitemap, robots, canonicals e documentação coerentes.

## Acessibilidade

- imagens com `alt`;
- inputs com nome acessível;
- foco previsível em diálogos;
- navegação completa por teclado;
- mensagens dinâmicas anunciadas quando necessário;
- teste manual com NVDA;
- movimento reduzido respeitado.

## Catálogo e jornada

Testar busca, filtros, ordenação, parâmetros de URL, estado sem resultados, modal, páginas individuais, relacionados, favoritos, lista, recentes e retomada.

## Max

Validar “não sei o que escolher”, sugestões vagas, produto, categoria, formato, vegano, sem glúten, comparação, similares, mostrar mais, nova busca, preço, entrega, pergunta médica, redes e pré-atendimento.

## Conta, Admin e atendimento

Testar perfil local, exportação/exclusão de dados, edição e exportação no Admin, imagens/miniaturas, origem e produtos no pré-atendimento, revisão da mensagem e `wa.me` somente no passo final.

## PWA e segurança

Testar instalação, atualização, offline e retorno da conexão. Confirmar CSP, ausência de `eval`, `new Function`, `document.write`, `javascript:` e segredos versionados.

## White-label e pós-deploy

Use `--proibir` para procurar resíduos da marca anterior. Depois do deploy, faça smoke test em janela anônima e confirme a versão do Service Worker.
