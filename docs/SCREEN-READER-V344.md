# Experiência com leitores de tela — versão 3.4.4

## Escopo

A versão foi revisada para NVDA, JAWS, Narrador e VoiceOver, com prioridade para navegação sem visão, teclado e conteúdo anunciado dinamicamente.

## Melhorias implementadas

- foco explícito no conteúdo principal ao usar “Pular para o conteúdo”;
- nomes contextuais para botões repetidos de produto, carrinho e lembretes;
- aviso textual em links que abrem nova janela;
- regiões de status educadas e atômicas para ações dinâmicas;
- foco conduzido entre etapas da Compra guiada;
- comparação com legenda, cabeçalhos de coluna e região identificada;
- resultados do Planejador anunciados e foco movido para o primeiro plano;
- rótulos programáticos para lembretes, planos e resultados;
- preservação de foco nos diálogos do Max e comandos rápidos;
- auditoria automática de idioma, título, landmarks, H1, IDs, textos alternativos, nomes de links, nomes de botões e rótulos de campos.

## Roteiro manual recomendado com NVDA

1. Pressione `H` e confirme um único título principal por página.
2. Pressione `D` e confirme as regiões principal, navegação e rodapé quando disponível.
3. Use `Tab` a partir do topo e teste o link “Pular para o conteúdo”.
4. Abra o menu, o Max e os modais; confirme contenção e devolução do foco com `Esc`.
5. Preencha filtros, Compra guiada, comparador, kit e orçamento; confirme anúncios após cada ação.
6. No carrinho, altere quantidade, remova itens e confirme nomes contextuais e atualização do total.
7. Teste em modo de foco e navegação, com Firefox e Chrome.

## Critério de qualidade

Automação reduz falhas objetivas, mas não comprova experiência perfeita de um leitor de tela. A aprovação final deve combinar a suíte automática com este percurso manual em NVDA.
