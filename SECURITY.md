# Política de Segurança — Saúde Qualimax

## Relato responsável

Se você identificar uma vulnerabilidade, envie uma descrição técnica para:

**contato.sqm@gmail.com**

Inclua, quando possível:

- versão afetada;
- página ou componente;
- passos para reproduzir;
- impacto observado;
- navegador e sistema operacional.

Não inclua dados pessoais de terceiros no relato.

## Escopo atual

A versão **3.0** é uma aplicação frontend estática. Não possui autenticação, checkout, armazenamento de cartões ou backend próprio.

Favoritos, lista de interesse e histórico ficam no navegador do visitante por meio de IndexedDB, com fallback local.

## Medidas existentes

A aplicação utiliza, entre outras medidas:

- Content Security Policy fornecida por meta;
- validação de caminhos e destinos externos em fluxos críticos;
- política de referrer;
- limites de entrada;
- isolamento de cache same-origin;
- `noopener noreferrer` em links externos que abrem nova aba;
- defesa complementar contra framing.

Algumas proteções de segurança dependem de cabeçalhos HTTP e precisam ser avaliadas na hospedagem utilizada.

## Segredos

Nenhuma chave de API privada, token, senha ou credencial deve ser armazenada no frontend ou versionada no repositório.

## Mudanças de arquitetura

Adicionar backend, autenticação, formulários persistentes, pagamentos, APIs ou banco remoto exige nova modelagem de ameaças e nova auditoria de segurança.
