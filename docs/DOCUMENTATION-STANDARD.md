# Padrão de documentação

Este guia mantém a documentação da Saúde Qualimax clara, verificável e pronta para colaboração no GitHub.

## Princípios editoriais

- descrever o comportamento que existe na versão publicada;
- separar instruções operacionais de decisões históricas;
- usar nomes técnicos de arquivos entre crases;
- fornecer comandos copiáveis em blocos com linguagem identificada;
- registrar limitações com impacto e alternativa disponível;
- evitar promessas absolutas de acessibilidade, segurança ou compatibilidade;
- atualizar versão, cache, testes e changelog na mesma entrega.

## Estrutura recomendada

Cada guia deve começar com um único título de nível 1 e uma introdução curta. Use títulos de nível 2 para grandes assuntos e nível 3 somente quando necessário. Procedimentos devem indicar pré-requisitos, sequência e resultado esperado.

## Nomenclatura

Rotas e arquivos técnicos permanecem em inglês. A interface e a documentação operacional podem usar português. Exemplos: `about.html`, `catalog.html`, `assets/scripts/` e `data/products.json`.

## Critério de atualização

Uma alteração está documentalmente concluída quando:

1. o guia afetado descreve o estado atual;
2. links e comandos apontam para arquivos existentes;
3. exemplos não contêm credenciais ou dados pessoais;
4. o changelog registra a mudança relevante;
5. a suíte descrita em `TESTING-AND-QUALITY.md` foi executada.

## Revisão para GitHub

Antes de publicar, confirme títulos, links relativos, blocos de código, ortografia, versão atual e ausência de relatórios temporários. O diretório `docs/` deve funcionar como manual vivo; o histórico pertence a `CHANGELOG.md`.
