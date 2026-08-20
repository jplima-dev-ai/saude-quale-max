# Changelog

Histórico consolidado das principais evoluções da Saúde Qualimax. Relatórios antigos de rodada foram removidos da pasta `docs/` para evitar duplicação.

## 3.1.2 — consolidação da documentação

- documentação revisada para refletir 40 produtos e a arquitetura atual;
- relatórios de releases antigas removidos após consolidação no changelog;
- documentos de prompts de imagens removidos após integração das imagens definitivas;
- documentação duplicada de segurança consolidada em `SECURITY.md`;
- Conta, Admin Studio e pré-atendimento consolidados em `OPERACAO-LOCAL.md`;
- guias de arquitetura, Max, testes, publicação, white-label e ferramentas atualizados;
- política adotada: manter documentação temática viva e usar o changelog para histórico de releases.

## 3.1.1 — QA, correção do Max e descoberta dinâmica

- corrigido bug em “não sei o que escolher” que gerava dezenas de resultados por palavras irrelevantes;
- regra de detalhes de produto passa a usar limites de palavra;
- intenção de descoberta recebe prioridade explícita;
- detector de intenções normaliza acentos, pontuação e caixa;
- stopwords de busca livre foram reforçadas;
- “me recomenda algo”, “me sugere alguma coisa” e equivalentes entram na descoberta guiada;
- categorias da descoberta passam a vir de `categorias.json`;
- categorias são ordenadas pela quantidade real de produtos;
- incluído `tools/testar_max.cjs` para regressão automatizada do agente;
- revisão estrutural completa da plataforma com 40 produtos.

## 3.1 — expansão do catálogo

- catálogo ampliado de 32 para 35 produtos;
- adicionada Paçoca Integral de Amendoim;
- adicionado Chocolate sem Adição de Açúcares;
- adicionado Biscoito Integral de Aveia;
- novos produtos seguem a mesma estrutura orientada a dados, páginas individuais, busca, filtros, favoritos, lista e pré-atendimento;
- nomenclatura genérica, sem marcas comerciais;
- incluídos prompts profissionais para geração das três imagens definitivas.
- adicionados Mel, Açúcar Mascavo, Sal Rosa do Himalaia e Xarope Natural de Ervas, ampliando o catálogo para 39 itens.

## 3.0.8 — pré-atendimento inteligente para WhatsApp

- nova página `atendimento.html`;
- formulário progressivo de dados, recebimento, interesses e revisão;
- endereço aparece somente para entrega;
- produto de origem, lista e favoritos podem alimentar o atendimento;
- integração com perfil local de Minha Conta;
- Max envia contexto e preferências para o pré-atendimento;
- mensagem final pode ser revisada e copiada antes de abrir o WhatsApp;
- armazenamento opcional de dados neste dispositivo;
- origem comercial registrada na mensagem;
- CTAs de WhatsApp passam a preparar atendimento;
- novas copys convidam para pedido remoto ou visita presencial;
- PWA e auditoria passam a contemplar o novo fluxo.

## 3.0.7 — revisão e correção do roteamento do Max

- revisão completa de sintaxe, JSON, referências locais, IDs, CSP e páginas de produto;
- correção do roteamento centralizado de intenções do Max;
- intenções de similares, busca anterior, redes, atendimento, entrega, preço, quiz, café da manhã e lanche passam pelo dispatcher modular;
- remoção de blocos regex duplicados que ainda permaneciam em `processarEntrada`;
- busca anterior agora responde corretamente mesmo quando ainda não existe histórico suficiente;
- cache da PWA atualizado para `qualimax-v3.0.7`;
- regressão white-label e auditoria automatizada mantidas.

## 3.0.6 — arquitetura modular do Max

- `chatbot.js` deixa de concentrar sozinho estado, entidades, intenção e recomendação;
- novo `max-core.js` para estado e memória curta;
- novo `max-entidades.js` para produtos e referências contextuais;
- novo `max-intencoes.js` para classificação e prioridades;
- novo `max-recomendacao.js` para ranking de similares;
- guardrail médico passa a ter prioridade sobre explicação genérica de produto;
- auditoria valida presença e ordem dos módulos do Max;
- auditoria valida os módulos no shell da PWA;
- documentação viva do Max atualizada.

## 3.0.5 — estabilização e contexto do Max

- correção da exibição dos comandos `/adm` e `/conta` no histórico visual;
- comparação passa a aproveitar produto já em contexto;
- reconhecimento de “qual a diferença” como intenção de comparação;
- ranking de produtos semelhantes agora é ponderado;
- tags, benefícios e características cadastradas participam da similaridade;
- intenção explícita para listar categorias;
- produto contextual atualizado após comparações;
- revisão estrutural, PWA e auditoria completa.

## 3.0.4 — motor de intenções e contexto do Max

- início da arquitetura centralizada de intenções;
- separação entre detecção de intenção e execução de ação;
- contexto explícito do produto em conversa;
- referências como “esse produto” e “ele” podem continuar a interação;
- descoberta guiada quando o cliente não sabe o que escolher;
- correção de regressão na expressão regular de saudação;
- restauração do avatar no launcher público do Max.

## 3.0.3 — Max evolui de chatbot para agente de navegação

- memória curta da conversa durante a sessão;
- retomada da busca anterior;
- respostas sobre endereço, telefone e e-mail a partir da configuração;
- horário não cadastrado deixa de ser presumido;
- reconhecimento direto de produtos por nome;
- explicação de produto baseada nos dados reais do catálogo;
- busca de produtos semelhantes;
- comparação entre dois produtos;
- novos comandos `/ajuda`, `/conta` e `/adm`;
- CTAs dos cards do Max mais naturais.

## 3.0.2 — Max mais humano e nova identidade

- novo avatar visual do Max;
- launcher do chat passa a usar o personagem e chamada “Posso ajudar?”;
- cabeçalho do Max ganha avatar, status e subtítulo;
- tom de voz revisado para ficar informal, amigável e objetivo;
- respostas naturais para cumprimentos, agradecimentos e pedidos de ajuda;
- microcopy do campo de conversa incentiva linguagem livre;
- resultado das buscas usa linguagem menos mecânica;
- Admin Studio passa a permitir editar nome, subtítulo e saudação do Max;
- avatar adicionado ao cache PWA.

## 3.0.1 — QA e estabilidade da Conta/Admin

- proteção contra perda silenciosa de alterações no editor de produtos;
- produto novo só entra no rascunho após Salvar;
- upload de imagem fica pendente até o produto ser salvo;
- geração automática de miniatura para `img/thumbs/`;
- exportação separada de imagem principal e miniatura;
- backup passa a incluir imagens e miniaturas;
- importação restaura também os arquivos de imagem locais;
- Conta trata bloqueio de armazenamento local;
- exclusão de dados locais atualiza a interface imediatamente;
- Minha Conta respeita o módulo de coleções;
- correção do pareamento de histórico com produtos removidos.

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
