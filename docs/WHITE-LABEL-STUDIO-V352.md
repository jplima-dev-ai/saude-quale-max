# White-label Studio — versão 3.5.4

## Objetivo

O White-label Studio transforma a personalização de uma nova loja em um processo guiado. Ele fica na aba **Personalizar site** do Admin Studio e elimina a necessidade de procurar campos em arquivos JSON ou páginas HTML.

## Fluxo recomendado para cada cliente

1. Duplique a pasta-base e preserve uma cópia sem alterações.
2. Abra `admin.html` por um servidor local.
3. Escolha um modelo visual e revise as quatro cores.
4. Preencha identidade, localização, contato, redes e operação.
5. Personalize os textos principais das páginas.
6. Gere o SEO-base e revise títulos, descrições e domínio.
7. Ajuste nome, avatar, saudação, tom e público do Max.
8. Ative somente os módulos contratados pelo cliente.
9. Revise o checklist, salve e exporte `config.json`.
10. Substitua `data/config.json`, adicione o logotipo e execute a suíte de testes.

## Arquivos exportados

- `config.json`: configuração pronta para substituir `data/config.json`;
- `cliente-nome-da-loja.json`: ficha de personalização para arquivo interno ou futura reedição;
- `logo-nome-da-loja.ext`: imagem selecionada, renomeada com padrão seguro.

## O que permanece separado

Produtos e preços são administrados na aba **Produtos**. Imagens de produto também devem ser baixadas e colocadas nas pastas indicadas. Promoções possuem aba própria. Essa separação reduz o risco de alterar o catálogo por engano durante uma troca de marca.

## Limite de segurança

O Studio salva rascunhos neste navegador e não publica sozinho. Ele não é autenticação e não deve receber senhas, tokens ou credenciais. A publicação continua sendo feita pelo responsável pelo repositório ou hospedagem.
