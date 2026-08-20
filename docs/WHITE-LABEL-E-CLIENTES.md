# White-label e adaptação para clientes

## Objetivo

A Saúde Qualimax também funciona como base comercial reutilizável para outras casas de produtos naturais. A arquitetura atual reduz dados hardcoded e usa `data/config.json` como base da sincronização white-label.

## Fluxo recomendado para um novo cliente

1. duplique o projeto;
2. substitua a logo e imagens específicas da marca;
3. edite `data/config.json`;
4. revise `data/produtos.json`, `data/categorias.json`, `data/faq.json` e `data/quiz.json`;
5. execute:

```bash
python tools/sincronizar_cliente.py --check
python tools/sincronizar_cliente.py
```

6. execute os testes do projeto;
7. publique no domínio ou GitHub Pages do cliente.

## O que o sincronizador atualiza

A ferramenta usa apenas a biblioteca padrão do Python e atualiza:

- metadados das páginas principais;
- title/description/canonical das páginas de produto existentes;
- Open Graph e Twitter Cards dos produtos;
- marca nos dados estruturados;
- URLs dos breadcrumbs estruturados;
- fallback estático de nome, telefone, e-mail, endereço e localidade;
- fallback de Instagram;
- `manifest.webmanifest`;
- `sitemap.xml`;
- `robots.txt`;
- `/.well-known/security.txt`;
- hashes CSP de scripts inline.

## O que permanece editável manualmente

### Marca

- arquivo de logo;
- cores em `data/config.json`;
- textos editoriais que não dependem de localização.

### Catálogo

- produtos;
- categorias;
- imagens;
- miniaturas;
- quiz;
- FAQ.

### SEO

Os textos de SEO de cada página continuam em `data/config.json`. O sincronizador não inventa descrições comerciais para um cliente.

## Teste white-label

Antes de cada entrega, adapte uma cópia de teste e use `--proibir` para confirmar que nome, e-mail, telefone e URL da marca anterior não permaneceram nos arquivos públicos. A auditoria também deve confirmar que todas as páginas individuais correspondem ao catálogo atual.

## Limite importante

O sincronizador prepara a camada estática do projeto. Ele não transforma automaticamente catálogo, copy e identidade visual de um cliente em outro sem revisão humana. A adaptação comercial deve incluir curadoria de conteúdo e teste final.


## Pacotes diferentes por cliente

O mesmo código-base pode ser entregue com módulos diferentes usando `recursos` em `data/config.json`.

Exemplo de uma loja que não deseja quiz nem favoritos:

```json
"recursos": {
  "quiz": false,
  "jornadaLocal": true,
  "colecoes": false,
  "pwa": true
}
```

A sincronização também retira o Quiz do sitemap quando ele está desativado.

## Informações comerciais

Horário, regras de entrega, retirada e observações são opcionais. A seção só aparece se existir conteúdo fornecido pelo cliente.

## Auditoria antes da entrega

Execute:

```bash
python tools/auditar_cliente.py
```

Ao adaptar a base Qualimax para outro cliente, você pode proibir resíduos da marca original:

```bash
python tools/auditar_cliente.py   --proibir "Saúde Qualimax"   --proibir "contato.sqm@gmail.com"
```


## Admin Studio

O Admin Studio oferece uma camada visual para preparar `produtos.json` e `config.json`.

Após exportar:

1. copie os JSONs para `data/`;
2. copie imagens exportadas para `img/` e gere/adicione as miniaturas em `img/thumbs/`;
3. execute `python tools/sincronizar_cliente.py`;
4. execute `python tools/auditar_cliente.py`;
5. publique.

O sincronizador cria e remove páginas individuais conforme o catálogo.
