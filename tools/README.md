# Ferramentas de manutenção

## sincronizar_cliente.py

Sincroniza a camada estática da plataforma com `data/config.json`.

### Validar configuração

```bash
python tools/sincronizar_cliente.py --check
```

### Aplicar configuração

```bash
python tools/sincronizar_cliente.py
```

A ferramenta não instala dependências e não acessa a internet.

Sempre revise o diff do Git depois de sincronizar um novo cliente.


## auditar_cliente.py

Valida catálogo, páginas, CSP, referências locais, sitemap, manifest e sincronização da marca.

```bash
python tools/auditar_cliente.py
```

Também aceita termos proibidos para detectar resíduos de um template anterior:

```bash
python tools/auditar_cliente.py --proibir "Marca Antiga"
```
