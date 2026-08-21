#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOCS=ROOT/"docs"

files={
"README.md":"""# Documentação da Saúde Qualimax

Documentação técnica e operacional da versão **3.3.3**.

## Mapa

| Documento | Finalidade |
|---|---|
| [Arquitetura](ARCHITECTURE.md) | Estrutura, módulos, dados e limites |
| [Configuração](CONFIGURATION.md) | Marca, contato, recursos e operação |
| [Catálogo](CATALOG-AND-CONTENT.md) | Produtos, preços, imagens e campanhas |
| [MAX](MAX.md) | Capacidades e arquitetura do assistente |
| [Operação local](LOCAL-OPERATIONS.md) | Conta, carrinho e Admin Studio |
| [White-label](WHITE-LABEL.md) | Adaptação para outras lojas |
| [Acessibilidade](ACCESSIBILITY.md) | Critérios para teclado e leitores de tela |
| [Privacidade](PRIVACY.md) | Dados locais e limites |
| [PWA](PWA-E-OFFLINE.md) | Instalação, cache e modo offline |
| [SEO](SEO.md) | Metadados, páginas e sitemap |
| [Testes](TESTING-AND-QUALITY.md) | Suíte e revisão manual |
| [Publicação](DEPLOYMENT.md) | GitHub Pages e Netlify |
| [Changelog](CHANGELOG.md) | Histórico consolidado |

## Regras

1. Guias descrevem somente a versão publicada.
2. Decisões históricas ficam no changelog.
3. Comandos partem da raiz do projeto.
4. Mudanças de dados, rotas, cache ou comportamento exigem atualização documental.
5. Acessibilidade, privacidade e segurança integram o critério de conclusão.
""",
"ARCHITECTURE.md":"""# Arquitetura

## Visão geral

A Saúde Qualimax é uma aplicação web estática, multipágina e white-label em HTML, CSS e JavaScript. Funciona em GitHub Pages e Netlify sem compilação ou backend obrigatório.

## Camadas

- Interface: páginas HTML, assets/styles/main.css e assets/styles/commerce.css.
- Aplicação: módulos em assets/scripts/.
- Dados publicados: JSON em data/.
- Persistência local: localStorage e IndexedDB.
- Offline: service-worker.js e manifest.webmanifest.
- Operação: scripts Python e Node em tools/.

## Páginas

| Página | Responsabilidade |
|---|---|
| index.html | Entrada e descoberta |
| catalog.html | Busca, filtros, comparação e carrinho |
| products/ | Conteúdo individual |
| cart.html | Quantidades, orçamento e pedido preparado |
| campaigns.html | Campanhas, kits e combos |
| account.html | Perfil, jornada e recompra |
| support.html | Revisão antes do WhatsApp |
| admin.html | Edição e inteligência comercial local |

## Dados

- data/config.json: identidade, contato, SEO, MAX e recursos.
- data/products.json: catálogo e preços fixos.
- data/categories.json: taxonomia.
- data/v333.json: estoque, variantes, kits, campanhas e notificações.
- data/quiz.json, data/faq.json e data/baskets.json: conteúdos auxiliares.

## Persistência

Perfil, carrinho, pedidos preparados e eventos permanecem no dispositivo. Não há sincronização central. O WhatsApp só abre após ação explícita.

## Limites

Sem backend, não existem autenticação real, estoque central, pagamento online, pedidos transacionais ou sincronização entre dispositivos. O Admin Studio é um editor local, não uma área protegida.
""",
"ACCESSIBILITY.md":"""# Acessibilidade

## Compromisso

A plataforma prioriza teclado, NVDA e leitores de tela, tendo WCAG 2.2 nível AA como referência para fluxos essenciais.

## Requisitos

- HTML semântico e hierarquia coerente de títulos;
- foco visível e ordem previsível;
- nomes acessíveis para controles e diálogos;
- mensagens dinâmicas moderadas em aria-live;
- contraste suficiente e informação independente de cor;
- texto alternativo correto;
- diálogos fecháveis por Escape com devolução de foco;
- suporte a prefers-reduced-motion.

## Teclado

- Tab e Shift+Tab: navegar.
- Enter ou Espaço: ativar.
- Escape: fechar diálogos.
- Alt+Q: abrir a paleta de comandos.

## Teste com NVDA

1. Navegar por títulos, regiões, links e formulários.
2. Testar catálogo, variantes, carrinho, orçamento, MAX e Admin.
3. Confirmar anúncios únicos e oportunos.
4. Verificar zoom de 200% e tela estreita.

Nenhum fluxo essencial pode depender apenas de mouse, animação ou percepção visual.
""",
"CATALOG-AND-CONTENT.md":"""# Catálogo e conteúdo

## Fonte de verdade

Produtos ficam em data/products.json. Variantes, estoque demonstrativo, campanhas, kits e notificações ficam em data/v333.json.

## Produto

Cada item deve possuir id, nome, slug, categoria, preço, apresentação, imagem, descrição e benefícios. IDs e slugs são únicos e estáveis.

## Preços

Os preços são valores fixos do catálogo. O administrador pode alterá-los e exportar o JSON atualizado. Pesquisa externa não é exibida ao visitante.

## Estoque e variantes

O estoque é demonstrativo e local; não substitui um sistema transacional. Variantes precisam de identificador estável, nome legível e eventual acréscimo.

## Imagens

- nomes seguros, sem espaços;
- miniaturas em assets/images/thumbs/ quando usadas nos cards;
- proporção consistente e tamanho otimizado;
- texto alternativo informativo.

## Campanhas e kits

Campanhas precisam de período válido e critério de seleção. Kits devem referenciar slugs existentes e informar composição e desconto.

## Novo produto

1. Adicionar o registro.
2. Incluir imagens.
3. Criar a página individual.
4. Revisar categoria, sitemap e busca.
5. Executar a suíte de testes.
""",
"CONFIGURATION.md":"""# Configuração

## Arquivo principal

data/config.json controla identidade, contato, redes, MAX, SEO, módulos e condições comerciais. Mantenha JSON válido e nunca armazene segredos.

## Seções

- empresa: nome, descrição, localidade, site e CEP.
- contato: WhatsApp internacional, e-mail, telefone e endereço.
- marca: logo e cores.
- redes: perfis públicos.
- chatbot: identidade e tom do MAX.
- seo: títulos, descrições e URLs canônicas.
- recursos: módulos ativos.
- comercial: horário, entrega, retirada e pagamento.
- promocoes: regras demonstrativas.

## Recursos 3.3.3

Carrinho, variantes, estoque, campanhas, kits, comandos e inteligência comercial devem ser ativados somente quando dados e páginas estiverem publicados.

## Validação

    python tools/sync-client.py --check
    python tools/audit-client.py
    python tools/test-v333.py

Revise também com teclado e NVDA.
""",
"MAX.md":"""# MAX — assistente local

## Papel

O MAX ajuda a descobrir, comparar e organizar produtos. Não realiza diagnóstico, prescrição, pagamento ou confirmação de estoque.

## Módulos

- max-core.js: estado e utilitários.
- max-entidades.js: critérios.
- max-nlu.js: linguagem natural.
- max-decision.js: decisão e confiança.
- max-recomendacao.js: ranking.
- max-intencoes.js: respostas.
- chatbot.js: diálogo e interface.

## Capacidades

- busca por nome, categoria, característica e orçamento;
- comparação contextual e correções;
- memória curta de preferências;
- cestas e seleções comerciais;
- explicação de critérios;
- encaminhamento explícito para atendimento humano.

## Privacidade e acessibilidade

O processamento é local. O visitante decide quando abrir o WhatsApp. O diálogo é operável por teclado, usa anúncios moderados e mantém identidade e estado do MAX em texto; o avatar é decorativo.

## Regressão

    node tools/test-max.cjs
    node tools/test-max-nlu.cjs
    node tools/test-max-decision.cjs
    node tools/test-max-basket.cjs
""",
"LOCAL-OPERATIONS.md":"""# Operação local

## Minha Conta

Perfil, preferências, jornada e pedidos preparados ficam no navegador. Exportação e importação oferecem portabilidade manual; não há conta remota.

## Carrinho

O carrinho reúne produtos, variantes e quantidades, calcula total e compara com orçamento. Preparar pedido registra uma cópia local; não conclui compra.

## Admin Studio

admin.html edita catálogo e configuração, mantém imagens locais, executa auditorias, exporta dados e mostra inteligência comercial. Não possui autenticação real.

## Publicação

1. Salvar o rascunho.
2. Exportar dados.
3. Substituir arquivos no repositório.
4. Executar testes.
5. Revisar o diff.
6. Publicar.

Não coloque credenciais no frontend. Operação multiusuário exige backend com autenticação, autorização e logs.
""",
"PRIVACY.md":"""# Privacidade

## Modelo

A plataforma é estática, sem banco remoto próprio ou autenticação.

## Dados locais

Perfil, preferências, favoritos, carrinho, pedidos preparados, acessibilidade e eventos comerciais podem permanecer no dispositivo. A limpeza do navegador pode removê-los.

## WhatsApp

Dados só deixam a plataforma após ação de atendimento. A mensagem deve ser revisável antes da abertura.

## MAX

Conversas são processadas no navegador. O MAX não deve ser apresentado como profissional de saúde ou sistema de diagnóstico.

## Analytics

Desativado por padrão. Integrações futuras devem documentar finalidade, base legal, retenção e opção de recusa.

## Segurança

Nunca publique tokens, senhas, chaves privadas, credenciais ou dados pessoais reais. Contas e pedidos reais exigem política revisada, controle de acesso, exclusão de dados e conformidade com a LGPD.
""",
"PWA-E-OFFLINE.md":"""# PWA e modo offline

## Componentes

- manifest.webmanifest: instalação.
- service-worker.js: cache e atualização.
- offline.html: fallback.
- assets/scripts/pwa.js e assets/scripts/offline.js: interface.

## Estratégia

O shell essencial é pré-armazenado. Navegações usam o conteúdo disponível e recorrem ao fallback sem rede.

## Atualização

Cada versão deve renovar o identificador do cache e listar novos recursos essenciais. A v3.3.3 usa qualimax-v3.3.3.

## Verificação

1. Publicar em HTTPS.
2. Abrir uma vez online.
3. Ativar modo offline.
4. Testar início, catálogo, carrinho e fallback.
5. Restaurar a rede e confirmar atualização.

O modo offline não confirma disponibilidade, envia WhatsApp ou cria pedido real.
""",
"SEO.md":"""# SEO

## Requisitos

- título e descrição únicos;
- URL canônica correta;
- um único H1;
- hierarquia coerente;
- links com texto significativo;
- dados estruturados válidos.

## Produtos

Páginas individuais devem refletir nome, descrição, imagem, apresentação e preço publicado. Evite alegações terapêuticas não comprovadas e duplicação.

## Arquivos globais

sitemap.xml inclui páginas canônicas. robots.txt aponta para o sitemap e não bloqueia recursos necessários.

## Mudança de domínio

Atualize empresa.site, URLs canônicas, dados estruturados, sitemap e robots; execute o sincronizador e revise links absolutos.

SEO não substitui clareza: conteúdo deve ser útil, acessível e coerente com o catálogo.
""",
"TESTING-AND-QUALITY.md":"""# Testes e qualidade

## Suíte

    python tools/test-v333.py
    python tools/test-fixes-v331.py
    python tools/test-v332.py
    python tools/test-security.py
    python tools/audit-structure-v331.py
    python tools/audit-client.py
    node tools/test-max.cjs
    node tools/test-max-nlu.cjs
    node tools/test-max-basket.cjs
    node tools/test-max-decision.cjs
    python tools/test-commerce.py
    python tools/test-promotions-v33.py

## Revisão manual

- teclado, NVDA, zoom e tela estreita;
- catálogo, variantes, estoque, carrinho e orçamento;
- campanhas, kits, recompra, Alt+Q e notificações;
- MAX, Admin, exportações, PWA e offline.

## Integridade

Valide JSON, JavaScript, links, slugs, imagens, CSP, sitemap, cache e ZIP. Não publique erro conhecido em fluxo essencial. Avisos aceitos precisam de impacto e plano de correção.
""",
"DEPLOYMENT.md":"""# Publicação

## Antes do commit

- testes e auditorias aprovados;
- dados e URLs revisados;
- nenhuma credencial;
- cache PWA atualizado;
- diff revisado.

## Git

    git status
    git diff --check
    git add .
    git commit -m "release: Saúde Qualimax v3.3.3"
    git push

## GitHub Pages

Em Settings > Pages, publique a branch e a pasta que contêm index.html. Teste a URL em navegação normal e privada.

## Netlify

Publique a raiz sem comando de build e preserve _headers.

## Pós-deploy

Teste início, catálogo, produto, carrinho, campanhas, conta, atendimento, MAX, Admin, sitemap, manifest e service worker. Confirme HTTPS e console sem erros.
""",
"WHITE-LABEL.md":"""# White-label

## Objetivo

Gerar lojas derivadas sem misturar identidade, conteúdo ou dados.

## Fluxo

1. Criar cópia de trabalho.
2. Editar data/config.json.
3. Substituir catálogo, categorias, imagens, FAQ e quiz.
4. Revisar data/v333.json.
5. Sincronizar.
6. Testar e auditar.
7. Empacotar separadamente.

## Revisão obrigatória

- domínio, contato e endereço;
- logo, cores e textos alternativos;
- catálogo, preços, estoque e variantes;
- SEO, sitemap e robots;
- campanhas, kits e notificações;
- MAX e atendimento;
- documentos legais aplicáveis.

## Isolamento

Nunca reutilize credenciais, dados pessoais, analytics ou IDs privados. Um pacote por cliente.

    python tools/generate-store.py
    python tools/sync-client.py --check
    python tools/audit-client.py
    python tools/package-release.py

Autenticação, pedidos reais, estoque central, pagamento e equipe multiusuário exigem backend.
""",
"CHANGELOG.md":"""# Changelog

O histórico segue uma adaptação de Keep a Changelog e versionamento semântico.

## [3.3.3] — 2026-08-21

### Adicionado

- carrinho, variantes e estoque demonstrativo;
- orçamento, pedido preparado e recompra;
- campanhas, kits e combos;
- paleta acessível Alt+Q e notificações;
- busca e inteligência comercial;
- avatar vetorial do MAX e animações reduzíveis.

### Alterado

- preços fixos editáveis pelo administrador;
- documentação reorganizada para GitHub;
- cache offline atualizado.

### Corrigido

- carregamento de recursos herdados da v3.3.2;
- coerência entre versão, backup e testes.

## [3.3.2] — 2026-08-20

- central de qualidade, comparação e jornada portátil;
- temas, white-label e empacotamento;
- pesquisa interna de referências comerciais.

## [3.3.1] — 2026-08-20

- estabilidade, segurança, acessibilidade e consistência.

## [3.3.0]

- promoções, cupons, pontos e frete demonstrativo;
- afinidade, modo presente e decisão do MAX.

## [3.2.0]

- preços, pedido assistido e evolução comercial.

## [3.1.0]

- 47 produtos, páginas individuais, contexto e testes.

## [3.0.0]

- Minha Conta, Admin Studio e MAX modular.

## [2.0.0]

- plataforma multipágina, PWA e white-label.

## [1.0.0]

- catálogo, identidade e atendimento por WhatsApp.
"""
}

for name,content in files.items():
    (DOCS/name).write_text(content.strip()+"\\n",encoding="utf-8")

for obsolete in ("PRECOS-332.md","PRECOS-E-PEDIDOS.md","BANCO-LOCAL.md"):
    path=DOCS/obsolete
    if path.exists():
        path.unlink()

readme=(ROOT/"README.md").read_text(encoding="utf-8")
if "python tools/test-v333.py" not in readme:
    readme=readme.replace("python tools/audit-client.py\\n","python tools/audit-client.py\\npython tools/test-v333.py\\n")
(ROOT/"README.md").write_text(readme,encoding="utf-8")
print(f"Documentação atualizada: {len(files)} arquivos; 3 obsoletos removidos.")
