# Acessibilidade

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

Nenhum fluxo essencial pode depender apenas de mouse, animação ou percepção visual.\n
## Movimento

O sistema em animations.css e assets/scripts/animations.js deve funcionar com intensidade desligada e prefers-reduced-motion ativo.
