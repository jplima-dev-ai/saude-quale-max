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
- suporte a `prefers-reduced-motion`;
- layout utilizável a partir de 320 CSS pixels, em orientação horizontal e com zoom elevado;
- tabelas com rolagem localizada e cabeçalhos de linha e coluna;
- áreas interativas com alvo mínimo de 44 CSS pixels nos fluxos essenciais.

## Teclado

- Tab e Shift+Tab: navegar.
- Enter ou Espaço: ativar.
- Escape: fechar diálogos.
- Alt+Q: abrir a paleta de comandos.

## Teste com NVDA

1. Navegar por títulos, regiões, links e formulários.
2. Testar catálogo, variantes, carrinho, orçamento, MAX e Admin.
3. Confirmar anúncios únicos e oportunos.
4. Verificar zoom de 200%, viewport de 320×568 e orientação horizontal.
5. Confirmar contenção e devolução de foco no Max, modais e paleta de comandos.
6. Alterar quantidade, filtros, comparações e orçamento, verificando cada anúncio de estado.

Nenhum fluxo essencial pode depender apenas de mouse, animação ou percepção visual.

## Movimento

O sistema em `assets/styles/animations.css` e `assets/scripts/animations.js` deve funcionar com intensidade desligada e `prefers-reduced-motion` ativo.

Automação encontra falhas objetivas, mas não comprova uma experiência perfeita. A aprovação final exige percurso manual com NVDA em modo de navegação e de foco, preferencialmente em Firefox e Chrome.
## Acessibilidade responsiva

A camada `responsive-v357.css` preserva zoom do navegador, alvos de toque de pelo menos 48 px em telas sensíveis ao toque e leitura sem rolagem lateral do documento. Tabelas largas recebem uma região focável com nome acessível e instrução de rolagem somente quando houver conteúdo oculto horizontalmente.

Em celulares, tablets e orientação horizontal curta, controles fixos deixam de ocupar áreas críticas. O Max continua utilizável com teclado e leitor de tela, e as preferências de redução de movimento e cores forçadas permanecem respeitadas.

Na versão 3.5.9, a altura efetivamente visível acompanha o teclado virtual. Em zoom extremo, ações são reorganizadas em coluna. Regiões tabulares recebem uma única instrução acessível e entram na ordem do teclado somente quando existe rolagem horizontal.
