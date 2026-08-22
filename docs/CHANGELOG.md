# Changelog

O histórico segue uma adaptação de Keep a Changelog e versionamento semântico.

## [3.5.9] — 2026-08-22

### Correções sutis e documentação profissional

- conflito entre as camadas 3.5.7 e 3.5.8 corrigido para impedir duas instruções acessíveis na mesma tabela;
- tabelas sem conteúdo oculto removidas da ordem de tabulação, preservando foco apenas quando a rolagem é necessária;
- checkboxes, radios, controles de faixa e seletores de cor protegidos contra largura total em zoom extremo;
- regra genérica de botões em telas estreitas substituída por ações contextuais para não deformar controles compactos;
- entrada duplicada de `security.js` removida do cache offline;
- verificador 3.5.9 criado para detectar duplicação no cache, divergência de versão, regressões responsivas e links documentais quebrados;
- índice da documentação ampliado com início rápido, público, idioma e estado da versão;
- padrão editorial formal adicionado para manter consistência nas próximas entregas;
- guias de publicação, testes, PWA, acessibilidade, configuração, catálogo, animações e white-label revisados;
- comandos padronizados em blocos copiáveis e referências técnicas formatadas de modo consistente;
- referências obsoletas de cache e release atualizadas para 3.5.9.

## [3.5.8] — 2026-08-22

### Estabilização responsiva e conclusão das pendências técnicas

- tratamento específico para teclado virtual aberto em celulares;
- Max ajustado à altura visual disponível sem ficar encoberto pelo teclado;
- controles flutuantes ocultados temporariamente durante a digitação para liberar espaço;
- suporte reforçado a zoom extremo equivalente a viewports de 360 px ou menos;
- tabelas previamente envolvidas por componentes antigos agora também recebem nome, foco e instrução acessível;
- proporção visual de imagens de produto estabilizada para reduzir deslocamentos de layout;
- breadcrumbs e menus longos tornados roláveis sem ampliar a página inteira;
- componentes que ultrapassem a viewport recebem contenção automática e segura;
- modais, Max e navegação refinados para orientação horizontal com pouca altura;
- cache offline, gerador de produtos, Admin e White-label Studio atualizados para 3.5.8;
- tentativa de execução da matriz Chromium registrada como bloqueada pela indisponibilidade do binário no ambiente de desenvolvimento.

## [3.5.7] — 2026-08-22

### Responsividade consolidada em toda a plataforma

- nova camada responsiva final aplicada às 79 páginas, sem alterar o conteúdo da loja;
- grade de destaques corrigida para não comprimir dois produtos em celulares médios;
- comportamento refinado para celulares compactos, tablets, modo paisagem e telas com pouca altura;
- tabelas comuns convertidas em regiões roláveis, focáveis e identificadas para tecnologias assistivas;
- imagens não prioritárias configuradas para carregamento e decodificação progressivos;
- tamanhos de imagem orientados ao espaço disponível para reduzir tráfego em conexões móveis;
- Max, WhatsApp e carrinho reposicionados em telas estreitas para evitar colisões;
- componentes fixos do Admin, checkout e White-label Studio liberados em paisagem curta;
- menu móvel recolhido com segurança após mudança de orientação;
- suporte mantido a zoom, alvos de toque ampliados, redução de movimento e alto contraste forçado;
- gerador de páginas de produto atualizado para preservar a camada 3.5.7;
- cache offline versionado e testes automáticos de responsividade adicionados.

## [3.5.6] — 2026-08-22

### Voz humana, Max contextual e revisão integral

- textos das principais jornadas reescritos com voz próxima, calorosa e sem fórmulas artificiais;
- páginas de descoberta, comparação, orçamento, kits, receitas, conta, contato e atendimento humanizadas;
- copy individual dos 60 produtos revisada, com seis ritmos editoriais e chamadas variadas;
- linguagem técnica ou provisória removida da experiência do cliente;
- preços unificados como valores fixos do catálogo em dados, Admin, produtos, atendimento e Max;
- formatos de produto corrigidos para português natural nas 60 páginas individuais;
- nova camada `max-reasoning-v356.js` com memória curta e limitada;
- interpretação de intenções compostas, orçamento, preferências e continuação contextual;
- Max capaz de resumir o entendimento, explicar recomendações e aceitar correções;
- comparação contextual com alternativas mais econômicas e diferenças de preço;
- armazenamento do novo contexto limitado a 12 turnos e higienizado antes da persistência;
- testes específicos contra injeção de conteúdo, memória excessiva e regressões de raciocínio;
- auditorias funcional, estrutural, de leitores de tela e de segurança executadas novamente.

## [3.5.5] — 2026-08-22

### Página 404 com o Max e documentação corrigida

- página 404 reconstruída com humor coerente com uma casa de produtos naturais;
- Max apresentado em uma cena visual leve, responsiva e acessível;
- cinco respostas bem-humoradas alternadas por controle com anúncio para leitores de tela;
- atalhos diretos para Início, Catálogo e atendimento humano;
- animação automaticamente desativada quando o sistema solicita redução de movimento;
- scripts não essenciais removidos da página de erro para acelerar o carregamento;
- documentação revisada contra as rotas técnicas reais em inglês;
- referência obsoleta da antiga rota portuguesa do catálogo removida;
- instruções de publicação, cache e versão atualizadas;
- versão histórica correta do White-label Studio restaurada para 3.5.2;
- tabela canônica de equivalência entre nomes visíveis em português e arquivos em inglês;
- teste automático para bloquear rotas portuguesas obsoletas e links Markdown quebrados.

## [3.5.4] — 2026-08-22

### Acessibilidade em computador, celular e tablet

- camada transversal aplicada às 79 páginas da plataforma;
- isolamento do conteúdo atrás de diálogos para impedir fuga da navegação por leitor de tela;
- foco reforçado e compatível com teclado, NVDA e modo de alto contraste do Windows;
- áreas de toque com pelo menos 48 pixels em dispositivos de ponteiro impreciso;
- adaptação específica para tablets entre 600 e 1024 pixels;
- suporte a celular e tablet nas orientações vertical e horizontal;
- altura dos diálogos sincronizada com o teclado virtual por `VisualViewport`;
- ocultação temporária dos atalhos flutuantes quando o teclado virtual ocupa a tela;
- campos de dados pessoais associados a tipos de preenchimento automático;
- avisos de validação anunciados por região viva;
- suporte adicional a contraste elevado, cores forçadas, redução de movimento, zoom e texto ampliado;
- testes preventivos para impedir bloqueio de zoom e regressões da matriz multitelas.

## [3.5.3] — 2026-08-22

### Compra simples e desempenho móvel

- ícone do carrinho substituído por SVG vetorial nítido em qualquer densidade de tela;
- checkout reorganizado em três etapas claras: revisar, informar entrega e confirmar no WhatsApp;
- controles grandes de quantidade, subtotais por item e confirmação antes de remover ou esvaziar;
- transferência automática dos produtos e quantidades do carrinho para o pré-atendimento;
- mensagens diretas sobre preço estimado, ausência de cobrança e próximo passo;
- imagens do carrinho otimizadas, carregamento tardio e decodificação assíncrona;
- modo leve automático para economia de dados em conexões 2G ou aparelhos com pouca memória;
- animações e recursos decorativos suspensos no modo leve;
- busca do catálogo temporizada para evitar travamentos durante a digitação;
- cache offline atualizado com os recursos da versão 3.5.3.

## [3.5.2] — 2026-08-22

### White-label Studio para revenda

- nova aba **Personalizar site** no Admin Studio;
- fluxo guiado em sete etapas para identidade, contato, textos, SEO, Max, recursos e revisão;
- quatro modelos visuais profissionais com cores totalmente editáveis;
- prévia instantânea de marca, logotipo, localização, título e descrição;
- personalização centralizada dos textos principais de Início, Catálogo, Sobre e Contato;
- gerador de SEO para cinco páginas com URLs canônicas;
- configuração de redes sociais, operação, formas de pagamento e atendimento;
- ativação individual dos 14 módulos comerciais;
- indicador de completude e checklist de entrega ao cliente;
- importação segura e exportação de `config.json` ou ficha completa do cliente;
- preparação e download do logotipo com caminho padronizado;
- conteúdo personalizado aplicado pelo frontend sem alterar manualmente as páginas HTML.

## [3.5.1] — 2026-08-22

### Revisão integral e hardening de segurança

- 79 páginas revisadas quanto a referências, títulos, CSP, IDs e links externos;
- correção das trilhas de descoberta após a migração de rotas para inglês;
- correção do carregamento white-label de logo e avatar em `assets/images`;
- eliminação de injeções HTML no comparador e nas cestas configuráveis;
- validação HTTPS das fontes externas de preços;
- importação da jornada limitada por tamanho, extensão, esquema e valores permitidos;
- proteção do fallback do banco local contra poluição de protótipo e stores arbitrárias;
- política de cabeçalhos reforçada com CSP completa, HSTS, isolamento de origem e bloqueio de cache do Admin;
- novos testes ofensivos e estruturais para impedir regressões.
- documentação profissionalizada: nove relatórios históricos redundantes foram consolidados nos guias permanentes e removidos;
- índice documental corrigido da versão 3.3.4 para 3.5.1 e links internos revalidados.

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

- catálogo, identidade e atendimento por WhatsApp.
