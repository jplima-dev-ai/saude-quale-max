# Acessibilidade — Saúde Qualemax v1.1

A arquitetura considera navegação por teclado, foco visível, semântica HTML, nomes acessíveis, estados ARIA quando necessários, redução de movimento e componentes dinâmicos com gerenciamento de foco.

## Áreas críticas

- menu responsivo;
- catálogo e filtros;
- modal de produto;
- quiz;
- FAQ;
- assistente;
- links de WhatsApp;
- controles de acessibilidade.

## NVDA

A validação manual deve conferir, no mínimo:

1. título da página;
2. landmarks;
3. headings;
4. links e botões;
5. imagens e textos alternativos;
6. formulários;
7. progresso e resultado do quiz;
8. abertura, leitura, fechamento e retorno de foco dos modais;
9. abertura, leitura, fechamento e retorno de foco do assistente;
10. acesso aos canais de contato.

Os controles adicionais de acessibilidade são complementares à acessibilidade estrutural e não substituem HTML semântico, teclado ou contraste adequado.

## Novos componentes da v2.0

Validar com teclado e NVDA: botões Favoritar e Adicionar à lista com `aria-pressed`, diálogo Minhas escolhas, retorno de foco, fechamento por Escape, navegação dos produtos relacionados, seção Vistos recentemente e compartilhamento nas páginas individuais. Favoritos e lista não dependem exclusivamente de cor ou ícone para indicar estado.
