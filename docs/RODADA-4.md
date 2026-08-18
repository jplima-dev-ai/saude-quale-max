# Rodada 4 — arquitetura comercial, SEO e acessibilidade

## Implementado

- configuração central de identidade, contato, redes, chatbot e SEO;
- remoção de contato hardcoded do HTML;
- dados estruturados Organization atualizados a partir do `config.json`;
- `robots.txt` e `sitemap.xml` adicionados;
- documentação inicial de configuração, produtos, chatbot, privacidade e acessibilidade;
- fallback com `<noscript>`;
- estados `aria-pressed` nos controles adicionais de acessibilidade;
- refinamentos de foco, rolagem e redução de movimento;
- chatbot tratado como diálogo com foco controlado;
- manutenção da arquitetura baseada em JSON.

## Validação

- JavaScript: sintaxe validada com Node.js;
- JSON: todos os arquivos validados;
- HTML: um H1 principal;
- IDs: sem duplicidades;
- caminhos de assets referenciados diretamente no HTML: válidos;
- contatos hardcoded no HTML: removidos;
- ZIP: integridade validada com `unzip -t`.

## Próxima prioridade

Executar validação manual visual e com leitor de tela, seguida de revisão final de conteúdo, contraste, responsividade e conversão.
