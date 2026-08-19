# Changelog

Histórico consolidado das principais evoluções da Saúde Qualimax. Relatórios antigos de rodada foram removidos da pasta `docs/` para evitar duplicação.

## 3.0 — Conta local e Admin Studio

- nova página Minha Conta com perfil local, favoritos, lista e histórico;
- consulta da lista pelo WhatsApp;
- exportação e exclusão de dados locais;
- Admin Studio local compatível com hospedagem estática;
- CRUD local de produtos;
- editor de copy, CTA, descrição, tags e características;
- upload e pré-visualização de imagens via IndexedDB;
- edição local de dados da loja e módulos;
- auditoria do rascunho;
- exportação de produtos, configuração, backup e imagens;
- atalhos `/conta` e `/adm` no Max;
- novas áreas mantêm o projeto sem backend e sem credenciais no frontend.

## 2.9.2 — Copywriting de produto e experiência

- reescrita das 32 copys de produto com identidade própria e CTAs contextuais;
- home reposicionada para descoberta, clareza e conversão sem promessas médicas;
- catálogo com microcopy mais orientada a busca, comparação e salvamento;
- páginas Sobre, Contato e Quiz com mensagens mais objetivas e humanas;
- SEO descriptions refinadas para intenção local e termos reais do catálogo;
- redução de repetição entre seções e melhor progressão narrativa da jornada.

## 2.9.1 — QA, correções e estabilidade modular

- Max deixa de sugerir Quiz em fluxos de fallback quando o módulo está desativado;
- Max e cards deixam de expor lista/favoritos quando coleções estão desativadas;
- bloco “Suas escolhas” do catálogo passa a respeitar corretamente `recursos.colecoes`;
- Quiz em acesso direto exibe estado indisponível quando o módulo está desligado;
- cards do catálogo deixam de criar controles de coleção quando o recurso está desativado;
- JSONs dinâmicos da PWA passam a usar network-first com fallback offline;
- imagens inválidas deixam de gerar requisições para diretórios;
- sincronizador e auditoria validam slugs e nomes de arquivo;
- auditoria passa a testar coerência de módulos opcionais.

## 2.9 — Módulos e auditoria comercial

- recursos passam a ser ativáveis por cliente via `data/config.json`;
- Quiz pode sair da navegação e do sitemap;
- jornada local e coleções podem ser ocultadas;
- PWA pode ser desativada e usa o nome real da empresa nos textos;
- página Contato ganha informações comerciais opcionais;
- sincronizador passa a refletir módulos e informações comerciais;
- nova ferramenta `tools/auditar_cliente.py` valida a entrega white-label.

## 2.8.1 — White-label e configuração comercial

- Instagram da página de contato deixa de ser hardcoded;
- mensagens de WhatsApp usam placeholders de empresa;
- localização e marca ganham hooks configuráveis em conteúdo visível;
- páginas individuais recebem hooks de marca consistentes;
- ferramenta `tools/sincronizar_cliente.py` sincroniza SEO, manifest, sitemap, security.txt e páginas de produto;
- fallback estático acompanha `config.json`, mesmo antes da execução do JavaScript;
- teste white-label realizado com uma segunda marca fictícia sem resíduos públicos da Qualimax.

## 2.7.2 — QA e correções

- revisão da jornada local;
- textos diferentes para histórico, favoritos e lista;
- re-render completo após limpar histórico;
- atualização do Service Worker realmente controlada;
- fallback offline para URLs com query;
- ações PWA em páginas de produto;
- validação adicional de caminhos de miniaturas.

## 2.7.1 — Jornada local

- seção “Continue de onde você parou”;
- retomada por favoritos, lista e histórico;
- inferência local de categoria de interesse;
- limpeza independente do histórico.

## 2.0.7 — Discovery Experience

- trilhas editoriais;
- rotação diária determinística;
- “Continue descobrindo” no catálogo;
- achados editoriais baseados somente em produtos reais.

## 2.0.6 — Copy Experience

- revisão editorial da Home, Catálogo, Quiz, Sobre e Contato;
- 32 copys individuais de produto;
- novas descrições de categorias;
- CTAs e microcopy mais variados.

## 2.0.5 — Max, SEO e produto

- Max contextual;
- refinamento progressivo;
- “Mostrar mais” e “Nova conversa”;
- guardrails médicos e comerciais;
- breadcrumbs;
- relacionados;
- navegação anterior/próximo;
- Product + BreadcrumbList;
- WebSite + SearchAction.

## 2.0.4 — Resiliência e PWA

- página offline;
- estado de conectividade;
- instalação da PWA;
- aviso de nova versão;
- `aria-current`;
- PWA nas páginas de produto.

## 2.0.3 — Segurança

- CSP;
- sanitização de conteúdo dinâmico;
- validação de URLs e caminhos;
- hardening do Service Worker;
- limites de entrada;
- política de referrer;
- `SECURITY.md` e `security.txt`.

## 2.0.2 — Repositório e estabilidade

- correção das URLs após renomeação do repositório;
- robots/sitemap;
- correção do CTA da lista de interesse;
- redes configuráveis no rodapé;
- `.gitattributes`.

## 2.0.1 — Revisão multipágina

- filtros por query string;
- correções de SEO por página;
- correções de filtros;
- dados estruturados das páginas individuais;
- invalidação do cache anterior.

## 2.0 — Plataforma

- migração de landing única para arquitetura multipágina;
- catálogo dedicado;
- Quiz dedicado;
- Sobre e Contato;
- 32 páginas individuais;
- IndexedDB;
- favoritos;
- lista de interesse;
- histórico;
- produtos relacionados;
- busca;
- compartilhamento;
- PWA inicial.

## 1.3–1.9 — Evolução comercial

Período de evolução da landing original com:

- vitrine premium;
- Assistente no Hero;
- copy de produto;
- melhorias de chatbot;
- performance de imagens;
- quiz e WhatsApp contextual;
- redes sociais;
- confiança comercial;
- revisões de acessibilidade e mobile.

## 1.0–1.2 — Fundação

- estrutura inicial da landing;
- configuração por JSON;
- catálogo inicial;
- integração de imagens;
- primeiras rodadas de acessibilidade, SEO e conversão.
