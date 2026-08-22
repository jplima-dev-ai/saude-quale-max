# Responsividade — versão 3.4.3

A camada `responsive-v343.css` funciona como acabamento responsivo transversal, carregado depois dos estilos de cada módulo.

## Cobertura

- celulares a partir de 320 CSS pixels;
- tablets em retrato e paisagem;
- notebooks e desktops;
- orientação horizontal com pouca altura;
- zoom elevado e redimensionamento de texto;
- áreas seguras de aparelhos com recortes;
- alto contraste forçado e redução de movimento.

## Melhorias

- grades passam de quatro para duas e uma coluna conforme o espaço real;
- formulários e ações comerciais usam áreas de toque de pelo menos 44 pixels;
- tabelas mantêm rolagem horizontal localizada;
- imagens e conteúdos longos não ampliam a página;
- Max adapta altura ao viewport dinâmico e continua utilizável com teclado virtual;
- botões flutuantes deixam de se sobrepor em telas pequenas;
- cabeçalhos de Minha Jornada e Planejador receberam layout responsivo completo;
- páginas de produto e modais passam para uma coluna em tablets.

## Validação

O teste automatizado está preparado para abrir páginas críticas em 320×568, 375×667, 768×1024 e 1024×768 e verificar overflow horizontal quando o Chromium do Playwright estiver instalado. A auditoria estática obrigatória cobre todas as páginas HTML.
