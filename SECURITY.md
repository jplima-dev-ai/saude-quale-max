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

`support.html` prepara uma mensagem localmente. Nome, endereço, produtos e observações não são enviados para a loja por esta página.

Somente após revisão e ação explícita do cliente é aberto o endereço `wa.me` com o texto preenchido. O envio final continua dependendo da confirmação do usuário no WhatsApp.

## Content Security Policy

As páginas utilizam Content Security Policy compatível com a arquitetura estática. Novos scripts, fontes, imagens ou origens externas devem ser revisados antes de ampliar a política.

## Dependências e publicação

Antes de cada publicação:

1. execute `python tools/sync-client.py`;
2. execute `python tools/audit-client.py`;
3. execute `node tools/test-max.cjs` quando Node.js estiver disponível;
4. confirme que nenhum segredo foi adicionado ao repositório;
5. revise alterações em `data/config.json`, `data/products.json` e arquivos de imagem.

## Relato de vulnerabilidade

Em uma implantação comercial, o responsável pelo repositório deve definir um canal privado para relatos de vulnerabilidade. Não publique detalhes de uma falha explorável em issues públicas antes de ela ser corrigida.

## Hardening da v3.1.7

A auditoria ofensiva da v3.1.7 corrigiu quatro classes de problema:

1. **Submissão nativa do pré-atendimento** — o botão final deixou de ser `submit`. Assim, se JavaScript falhar ou estiver desativado, dados pessoais não são serializados automaticamente em uma URL GET.
2. **URL de retorno do catálogo** — o valor salvo em `sessionStorage` agora é sempre relativo e validado estritamente antes de virar `href`.
3. **Clickjacking** — Netlify recebe proteção HTTP por `_headers` com `frame-ancestors 'none'` e `X-Frame-Options: DENY`. No GitHub Pages, que não permite controlar esses cabeçalhos pelo repositório, `frame-guard.js` permanece como defesa client-side e carrega cedo nas páginas utilitárias.
4. **Backup malicioso/DoS local** — importações do Admin Studio têm limites de tamanho, quantidade de produtos/imagens e tamanho dos data URLs antes da decodificação.

Execute também:

```bash
python tools/test-security.py
python tools/test-security-v336.py
node tools/test-security-runtime-v336.cjs
```

Esse teste é complementar à auditoria funcional e ao teste do Max.

## Hardening da v3.4.7

A v3.4.7 acrescenta validação de esquema para armazenamento local, bloqueio de chaves usadas em poluição de protótipo, limites de profundidade/tamanho, normalização de valores comerciais, validação do canal entre abas e política restritiva de cache. O relatório técnico está em `docs/SECURITY-AUDIT-V336.md`.
