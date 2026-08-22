# Changelog

O histórico segue uma adaptação de Keep a Changelog e versionamento semântico.

## [3.5.0] — 2026-08-21

### Admin Studio — central profissional de catálogo

- painel de produtos reconstruído para uso por pessoas não técnicas;
- visão executiva com total, preço médio, destaques e cadastros pendentes;
- busca ampliada por nome, categoria, tag e endereço, com filtros e ordenação;
- seleção múltipla e reajuste de preços por percentual ou valor fixo;
- destaque em lote, exportação CSV e reversão da última ação coletiva;
- editor guiado em quatro etapas, com indicador de qualidade do cadastro;
- histórico local das ações em lote para apoio à auditoria;
- responsividade, foco visível, anúncios de estado e rótulos para leitores de tela;
- cache e documentação atualizados para a versão 3.5.0.

## [3.4.7] — 2026-08-21

### Expansão do catálogo

- 13 produtos de alto giro adicionados, elevando o catálogo para 60 itens;
- três novas categorias: Farinhas Funcionais, Frutas Secas e Snacks Naturais;
- imagens próprias e consistentes para todos os novos itens;
- páginas individuais, SEO, dados estruturados e sitemap atualizados;
- preços fixos e administráveis, sem alegação de atualização automática;
- Max, busca, filtros, kits, comparador e carrinho integrados aos novos produtos;
- gerador de páginas corrigido para preservar as camadas das versões 3.3.3 a 3.4.6;
- sitemap corrigido para não perder rotas públicas durante a sincronização.

## [3.4.6] — 2026-08-21

### Transferência para atendimento humano

- detecção de problemas que exigem confirmação da equipe;
- transferência para fluxo revisável antes do WhatsApp;
- resumo contextual para evitar que o cliente recomece do zero;
- tratamento de pedidos, estoque real, entrega, pós-venda e dúvidas não resolvidas;
- proteção de dados no resumo automático;
- fallback para a página de contato quando o WhatsApp não estiver configurado;
- telemetria local do motivo da transferência.

## [3.4.5] — 2026-08-21

### Max mais humano e inteligente

- nova camada de personalidade acolhedora, carismática e atenciosa;
- reconhecimento de confusão, insegurança, pressa e navegação sem compromisso;
- memória de nome e preferência de resposta durante a sessão;
- modos curto, equilibrado e detalhado;
- respostas mais naturais e menos mecânicas;
- transparência sobre ser um assistente virtual;
- condução por uma pergunta de cada vez quando necessário;
- testes unitários específicos da inteligência relacional.

### Correções

- removidas duas chamadas duplicadas do motor de inteligência v3.3.7;
- memória de personalidade agora é apagada ao iniciar uma nova conversa;
- ampliada a tolerância a abreviações e erros comuns de digitação.

## [3.4.4] — 2026-08-21

### Leitores de tela

- camada transversal para NVDA, JAWS, Narrador e VoiceOver;
- foco consistente no conteúdo principal, fluxos guiados e resultados;
- nomes contextuais para controles repetidos;
- anúncios de alterações em carrinho, kits, comparações, lembretes e orçamento;
- legenda e escopos corretos na tabela comparativa;
- identificação de links que abrem nova janela;
- auditoria estática especializada em todas as páginas;
- roteiro manual de validação com NVDA documentado.

## [3.4.3] — 2026-08-21

### Responsividade

- nova camada transversal para celulares, tablets, desktops e zoom elevado;
- grades, formulários, modais, páginas de produto e ferramentas de decisão adaptáveis;
- áreas de toque de pelo menos 44 pixels;
- Max ajustado ao viewport dinâmico e a telas horizontais de pouca altura;
- tratamento de áreas seguras e posicionamento dos botões flutuantes;
- cabeçalho responsivo nas páginas Minha Jornada e Planejador de orçamento;
- matriz automatizada de overflow preparada para quatro dimensões de viewport.

### Correções

- removida a largura mínima global que causava overflow sob zoom elevado;
- corrigidas colisões entre Max, carrinho, notificações e WhatsApp;
- corrigida a perda de descrições nos cards em celulares estreitos;
- tabelas largas agora rolam dentro do componente, sem ampliar a página.

## [3.4.2] — 2026-08-21

### Inovações para clientes

- central Minha Jornada com visão consolidada e privada;
- planejador de orçamento em níveis Essencial, Equilibrado e Completo;
- lembretes locais de reposição em páginas de produto;
- compartilhamento e exportação da seleção do carrinho;
- descoberta surpresa alinhada às preferências locais;
- checkpoints para retomar a jornada de compra;
- histórico das comparações realizadas.

### Correções e qualidade

- parâmetros `produto` agora são respeitados no comparador e no construtor de kits;
- produto de origem preservado ao montar um kit;
- duplicações no Service Worker removidas;
- cache, rotas, sitemap, documentação e testes atualizados.

## [3.4.1] — 2026-08-21

### Evolução transversal

- início personalizado com atalhos de jornada;
- catálogo conectado às ferramentas de decisão;
- painel de decisão em todas as páginas de produto;
- índice de prontidão e análise do carrinho pelo MAX;
- resumo local da jornada em Minha Conta;
- rascunho privado no pré-atendimento;
- planejamento de visita e cópia de endereço;
- compromissos verificáveis na página Sobre;
- recuperação inteligente em páginas de erro e offline;
- correção semântica da tabela de comparação.

## [3.4.0] — 2026-08-21

### Plataforma comercial

- Compra Guiada acessível em quatro etapas;
- construtor de kits por orçamento e categoria;
- comparador profissional de até quatro produtos;
- central Descobrir por ocasiões;
- receitas e combinações com ingredientes compráveis;
- perfil local de preferências;
- recuperação de carrinho com descarte explícito;
- editor local do comportamento comercial do MAX;
- base para métricas e oportunidades comerciais;
- cinco novas rotas públicas, cache offline e sitemap atualizados.

## [3.3.9] — 2026-08-21

### MAX Dialogue Intelligence

- gestão do estágio da jornada e retomada contextual;
- perguntas progressivas sem repetição;
- explicações simplificadas e glossário comercial;
- reação construtiva a recomendações que não ajudaram;
- orientação passo a passo e resumo da conversa;
- correção da prioridade de produto mencionado;
- correção da preservação do item-base em kits.

## [3.3.8] — 2026-08-21

### MAX Sales Intelligence II

- numeração consolidada corretamente como 3.3.8 em toda a arquitetura;
- diagnóstico de carrinho, total, variedade e pontos de revisão;
- plano de economia com substituições semelhantes;
- análise de lacunas sem induzir itens desnecessários;
- recuperação de pedido preparado anteriormente;
- cálculo responsável da meta de frete grátis;
- comparação de custo por unidade;
- indicador explicável de confiança da recomendação;
- próximo melhor passo conforme o estágio da jornada.

### MAX Sales Skills

- montador de kits e rotinas dentro do orçamento;
- consultor de custo-benefício e alternativas econômicas;
- tratamento respeitoso de objeções e indecisão;
- combinação inteligente e venda complementar coerente;
- escolha em níveis Essencial, Equilibrada e Completa;
- condução explícita para carrinho ou atendimento;
- curadoria de presentes e seleções personalizadas;
- urgência somente quando houver estoque real informado;
- bloqueio conceitual de pressão, escassez falsa e recomendação sem fundamento.

## [3.3.7] — 2026-08-21

### MAX Intelligence

- compreensão simultânea de objetivo, orçamento e restrições;
- tolerância a erros de digitação e confirmação de produto;
- ranking explicável, diversificado e sensível às afinidades;
- comparação objetiva de até três produtos;
- resumo e correção seletiva da memória da conversa;
- perguntas de esclarecimento orientadas pela incerteza;
- linguagem responsável para orientação de catálogo.

### Plataforma

- nova camada de inteligência modular, offline e white-label;
- cache e documentação atualizados;
- testes unitários e regressivos específicos da v3.3.7.

## [3.3.6] — 2026-08-21

### Segurança

- validação central de dados provenientes do armazenamento local;
- proteção contra poluição de protótipo, JSON profundo e importações excessivas;
- limites de carrinho, pedidos, eventos, textos, preços e quantidades;
- validação de mensagens entre abas;
- cache offline restrito a recursos seguros e URLs sem consulta;
- isolamento adicional por COOP e CORP.

### Corrigido

- integridade do total e da quantidade após adulteração manual do navegador;
- possibilidade de consumo excessivo de memória por listas locais infladas;
- compatibilidade de categorias de presente após a arquitetura internacional.

## [3.3.5] — 2026-08-21

### Alterado

- arquitetura técnica, páginas, pastas e rotas migradas para inglês;
- conteúdo visível da loja preservado em português;
- manifesto de rotas adicionado para evolução internacional.

## [3.3.4] — 2026-08-21

### Adicionado

- sistema profissional de animações white-label;
- intensidades desligada, suave e expressiva;
- atmosfera botânica, revelações e feedback de conversão;
- painel de prévia e exportação;
- suporte integral à redução de movimento.

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

- catálogo, identidade e atendimento por WhatsApp.\n
