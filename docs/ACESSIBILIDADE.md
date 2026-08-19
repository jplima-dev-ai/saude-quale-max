# Acessibilidade

A acessibilidade é requisito estrutural da Saúde Qualimax, não um complemento visual.

## Fundamentos

A plataforma deve preservar:

- HTML semântico;
- landmarks;
- hierarquia consistente de headings;
- navegação completa por teclado;
- foco visível;
- nomes acessíveis;
- labels associados a campos;
- estado de controles dinâmicos;
- gerenciamento de foco em diálogos;
- mensagens de status quando necessário;
- suporte a `prefers-reduced-motion`;
- contraste adequado.

## Componentes críticos

Testar sempre:

- menu responsivo;
- busca e filtros;
- cards e CTAs;
- modal de produto;
- favoritos;
- lista de interesse;
- vistos recentemente;
- jornada local;
- quiz;
- Max;
- FAQ;
- ações PWA;
- página offline;
- páginas individuais;
- compartilhamento.

## Roteiro com teclado

Validar pelo menos:

1. `Tab` percorre controles em ordem lógica;
2. `Shift+Tab` retorna corretamente;
3. `Enter`/`Espaço` ativam botões e links;
4. `Escape` fecha diálogos;
5. o foco retorna ao elemento que abriu o diálogo;
6. não existe armadilha de teclado;
7. o menu móvel pode ser aberto e fechado sem mouse.

## Roteiro com NVDA

Verificar:

1. título da página;
2. landmarks;
3. lista de headings;
4. links;
5. botões e estados;
6. imagens e textos alternativos;
7. labels e instruções dos formulários;
8. progresso e resultados do quiz;
9. anúncio de mudanças relevantes;
10. abertura/fechamento de modal e Max;
11. `aria-pressed` de favoritos/lista;
12. `aria-current="page"` na navegação;
13. avisos de conexão e atualização da PWA.

## Controles adicionais

Alto contraste, tamanho de texto, redução de movimento e leitura fácil são complementares. Eles não substituem semântica, contraste base, teclado ou compatibilidade com leitores de tela.

## Antes de publicar

Não considerar a acessibilidade concluída apenas com validação automática. Fazer teste manual em navegador real e, sempre que possível, com NVDA.
