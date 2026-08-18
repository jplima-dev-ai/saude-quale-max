# Auditoria e evolução — Saúde Qualemax v1.1

## Rodada 2 — Catálogo, dados, SEO e acessibilidade

Data: 2026-08-17

### Implementado

- Catálogo renderizado a partir de `data/produtos.json`.
- Categorias renderizadas a partir de `data/categorias.json`.
- FAQ renderizado a partir de `data/faq.json`.
- Busca por nome, categoria, descrição e tags.
- Filtros por categoria, formato e características cadastradas.
- Modal de detalhes de produto com retorno de foco e fechamento por Escape.
- Configuração central para identidade visual, contato, chatbot e SEO.
- Links de WhatsApp preparados para usar o número configurado.
- Meta canonical e metadados Open Graph básicos.
- JSON-LD reduzido a dados institucionais não promocionais.
- Controles de acessibilidade com estado ARIA atualizado e Escape.
- Revisão da linguagem do quiz para priorizar preferências e exploração do catálogo.
- Revisão de descrições de produtos para evitar promessas de tratamento ou resultado.
- Campo de disponibilidade preparado nos produtos para futuras integrações.

### Validações realizadas

- JavaScript: `node --check` sem erros em todos os arquivos.
- JSON: todos os arquivos de `data/` válidos.
- HTML: 1 H1 principal.
- HTML: nenhum ID duplicado.
- Assets locais referenciados pelo HTML existentes.
- Imagens referenciadas pelos JSON existentes.
- Âncoras internas verificadas.
- Prova social fictícia removida.

### Próxima rodada

1. Melhorar foco e trap de teclado do chatbot.
2. Centralizar completamente textos institucionais dependentes de configuração.
3. Revisar CSS para contraste, alvos de toque e estados de foco.
4. Otimizar carregamento das imagens e reduzir layout shift.
5. Revisar quiz em conjunto com o catálogo e tratamento de resultados vazios.
6. Criar documentação de instalação, configuração e personalização.
7. Executar testes manuais com teclado e NVDA.
8. Preparar checklist de publicação no GitHub Pages.
