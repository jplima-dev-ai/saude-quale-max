# White-label

## Objetivo

Gerar lojas derivadas sem misturar identidade, conteúdo ou dados.

## Fluxo

1. Criar cópia de trabalho.
2. Editar data/config.json.
3. Substituir catálogo, categorias, imagens, FAQ e quiz.
4. Revisar data/v333.json.
5. Sincronizar.
6. Testar e auditar.
7. Empacotar separadamente.

## Revisão obrigatória

- domínio, contato e endereço;
- logo, cores e textos alternativos;
- catálogo, preços, estoque e variantes;
- SEO, sitemap e robots;
- campanhas, kits e notificações;
- MAX e atendimento;
- documentos legais aplicáveis.

## Isolamento

Nunca reutilize credenciais, dados pessoais, analytics ou IDs privados. Um pacote por cliente.

    python tools/generate-store.py
    python tools/sync-client.py --check
    python tools/audit-client.py
    python tools/package-release.py

Autenticação, pedidos reais, estoque central, pagamento e equipe multiusuário exigem backend.
