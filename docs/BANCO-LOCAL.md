# Persistência local

## Tecnologia

A plataforma utiliza IndexedDB para manter estado no navegador e possui fallback local para evitar a quebra de recursos principais.

O banco é **local ao navegador** e não equivale a um banco central da empresa.

## Estruturas

- `produtos` — cópia local sincronizada do catálogo;
- `favoritos` — produtos favoritados;
- `interesse` — lista de interesse;
- `historico` — produtos visualizados;
- `meta` — metadados de sincronização.

## Fonte de verdade

`data/produtos.json` continua sendo a fonte editável do catálogo. IndexedDB é uma camada de execução e persistência da experiência.

## Jornada local

A Home pode usar sinais de:

- favoritos;
- lista de interesse;
- histórico recente.

Esses sinais servem somente para retomar a navegação local e não são apresentados como recomendação clínica ou comercial.

## Limpeza

A interface permite limpar o histórico de navegação sem apagar favoritos ou lista de interesse.

## Privacidade

Os registros permanecem no dispositivo. Eles não são transmitidos à loja automaticamente.

Quando o visitante escolhe consultar a lista pelo WhatsApp, a mensagem preparada inclui apenas os nomes dos produtos selecionados.

## O que exige backend

São necessários servidor/API e banco remoto para:

- login;
- pedidos;
- estoque;
- pagamentos;
- painel administrativo remoto;
- sincronização entre dispositivos;
- histórico ligado a uma conta;
- analytics server-side.
