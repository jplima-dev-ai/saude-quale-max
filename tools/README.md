# Ferramentas de manutenção

## `sincronizar_cliente.py`

```bash
python tools/sync-client.py --check
python tools/sync-client.py
```

Valida e sincroniza a camada estática com `data/config.json` e o catálogo. Revise o diff do Git após a execução.

## `auditar_cliente.py`

```bash
python tools/audit-client.py
```

Verifica catálogo, páginas, imagens, CSP, referências, sitemap, manifest e configuração. Para detectar resíduos de marca:

```bash
python tools/audit-client.py --proibir "Marca Antiga"
```

## `testar_max.cjs`

```bash
node tools/test-max.cjs
```

Executa regressão de intenções, entidades e similares do Max, incluindo “não sei o que escolher”. Requer Node.js.

## Ordem recomendada

Sincronizar com `--check` → sincronizar → auditar → testar Max → revisar `git diff` → publicar → smoke test.
