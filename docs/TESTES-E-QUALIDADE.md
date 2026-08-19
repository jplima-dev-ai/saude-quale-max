# Testes e qualidade

Este checklist deve ser executado antes de uma nova publicação relevante.

## Integridade

- JavaScript sem erro de sintaxe;
- JSON e manifest válidos;
- nenhuma referência local quebrada;
- nenhum ID duplicado;
- um único H1 por página;
- páginas individuais correspondem ao catálogo;
- sitemap coerente com as páginas existentes.

## Acessibilidade

- imagens possuem `alt`;
- inputs possuem nome acessível;
- botões possuem comportamento previsível;
- diálogos gerenciam foco;
- navegação funciona apenas com teclado;
- `target="_blank"` não remove contexto sem aviso acessível;
- teste manual com NVDA.

## Catálogo

- busca;
- filtro por categoria;
- filtro por formato;
- filtro por característica;
- parâmetros de URL;
- estado sem resultados;
- modal;
- produtos relacionados;
- páginas individuais.

## Estado local

- favoritar/desfavoritar;
- adicionar/remover da lista;
- limpar favoritos;
- limpar lista;
- histórico;
- limpar somente histórico;
- jornada local;
- fallback quando IndexedDB falha.

## Max

Testar:

- nome de produto;
- categoria;
- vegano;
- sem glúten;
- formatos;
- “mostrar mais”;
- “nova conversa”;
- pergunta de preço;
- entrega;
- pergunta médica;
- WhatsApp;
- quiz;
- redes sociais.

## PWA

- primeira instalação;
- atualização a partir de cache anterior;
- botão “Atualizar agora”;
- modo offline;
- URL com query string offline;
- entrada direta por página de produto;
- retorno da conexão.

## Segurança

- CSP presente;
- hashes de scripts inline válidos;
- nenhum `eval`;
- nenhum `new Function`;
- nenhum `document.write`;
- nenhum `javascript:`;
- links externos com `noopener noreferrer`;
- nenhuma credencial versionada;
- caminhos derivados de dados passam por validação adequada.

## Publicação

Depois do deploy, repetir um smoke test diretamente na URL pública.


## Auditoria white-label

Antes de entregar uma cópia para outro cliente:

```bash
python tools/sincronizar_cliente.py --check
python tools/sincronizar_cliente.py
python tools/auditar_cliente.py
```

Quando estiver partindo do template Qualimax, também procure resíduos da marca anterior com `--proibir`.
