# Saúde Qualemax v2.0

Template institucional/comercial responsivo para loja de produtos naturais.

## Recursos

- catálogo baseado em JSON;
- busca e filtros;
- detalhes de produto;
- quiz;
- categorias e FAQ carregados por dados;
- Assistente Qualemax local;
- WhatsApp configurável;
- redes sociais configuráveis (Instagram, Facebook, TikTok, YouTube e Pinterest);
- controles complementares de acessibilidade;
- SEO configurável;
- estrutura preparada para reutilização comercial.

## Configuração rápida

1. Edite `data/config.json`.
2. Edite `data/produtos.json`.
3. Edite `data/categorias.json`.
4. Revise `data/quiz.json`.
5. Revise `data/faq.json`.
6. Substitua imagens mantendo caminhos válidos.
7. Valide conteúdo e acessibilidade.
8. Publique em um servidor estático ou GitHub Pages.

## Importante

Não adicione dados fictícios, avaliações inventadas, preços ou estoque sem fonte real, promessas médicas ou chaves secretas no frontend.


## v1.3.1
O Assistente Qualemax ganhou um ponto de entrada destacado no Hero, com múltiplos gatilhos acessíveis para o mesmo diálogo.


## v2.0 — estabilização, confiança e recuperação de jornada

A v2.0 corrige inconsistências de template, melhora o comportamento do Assistente Qualemax, torna o estado de catálogo vazio acionável e adiciona uma camada de confiança comercial baseada em transparência, sem prova social ou dados fabricados. Também torna mais elementos da marca configuráveis via `data/config.json`, incluindo nomes e rótulos acessíveis.

## v1.8 — experiência social e integração comercial

A v1.8 adiciona uma camada configurável de redes sociais e refina a experiência comercial sem inventar perfis. Instagram, Facebook, TikTok, YouTube e Pinterest podem ser informados em `data/config.json`; redes vazias não aparecem no site. O WhatsApp permanece separado como canal de atendimento e conversão.


## Novidades da v2.0

A v2.0 adiciona IndexedDB como banco local, favoritos, lista de interesse, vistos recentemente, produtos relacionados, páginas individuais de produto, compartilhamento e PWA leve. O JSON permanece como fonte configurável do catálogo.
