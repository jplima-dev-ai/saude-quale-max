# Política de Segurança — Saúde Qualimax

## Escopo

Este projeto é uma aplicação estática compatível com GitHub Pages e Netlify. Não existe backend próprio, autenticação remota ou armazenamento central de dados pessoais.

## Princípios adotados

- nenhuma senha, token do GitHub, chave de API ou credencial privada deve ser incluída no frontend;
- dados de Minha Conta, favoritos, lista e rascunhos administrativos permanecem no navegador;
- o pré-atendimento não envia formulário para servidor;
- o WhatsApp só é aberto após ação explícita do usuário;
- páginas utilitárias como Admin Studio, Minha Conta e Pré-atendimento não devem ser tratadas como autenticação real;
- conteúdo inserido em interfaces dinâmicas deve usar APIs seguras do DOM, evitando HTML arbitrário;
- arquivos e slugs são validados antes de compor caminhos locais.

## Admin Studio

`admin.html` é um editor local e não uma área administrativa autenticada.

Qualquer pessoa que conheça a URL pode abrir a página, porém suas alterações afetam somente o armazenamento local daquele navegador até que os arquivos sejam exportados e publicados manualmente.

Nunca adicione credenciais de publicação ao Admin Studio.

## Dados locais

A plataforma pode utilizar:

- `localStorage`;
- `sessionStorage`;
- `IndexedDB`.

Esses dados pertencem ao navegador do visitante. O usuário pode remover os dados locais pelas interfaces disponíveis ou pelos controles do próprio navegador.

## Pré-atendimento e WhatsApp

`atendimento.html` prepara uma mensagem localmente. Nome, endereço, produtos e observações não são enviados para a loja por esta página.

Somente após revisão e ação explícita do cliente é aberto o endereço `wa.me` com o texto preenchido. O envio final continua dependendo da confirmação do usuário no WhatsApp.

## Content Security Policy

As páginas utilizam Content Security Policy compatível com a arquitetura estática. Novos scripts, fontes, imagens ou origens externas devem ser revisados antes de ampliar a política.

## Dependências e publicação

Antes de cada publicação:

1. execute `python tools/sincronizar_cliente.py`;
2. execute `python tools/auditar_cliente.py`;
3. execute `node tools/testar_max.cjs` quando Node.js estiver disponível;
4. confirme que nenhum segredo foi adicionado ao repositório;
5. revise alterações em `data/config.json`, `data/produtos.json` e arquivos de imagem.

## Relato de vulnerabilidade

Em uma implantação comercial, o responsável pelo repositório deve definir um canal privado para relatos de vulnerabilidade. Não publique detalhes de uma falha explorável em issues públicas antes de ela ser corrigida.
