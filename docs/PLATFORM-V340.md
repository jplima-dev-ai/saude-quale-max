# Plataforma comercial v3.4.0

## Visão geral

A v3.4.0 transforma a base white-label em uma jornada comercial completa. Os recursos funcionam sem backend e usam apenas dados publicados ou armazenamento local do navegador.

## Novas rotas

| Rota | Função |
|---|---|
| `guided-shopping.html` | Compra Guiada por ocasião, orçamento e preferências |
| `kit-builder.html` | Montagem de kits dentro de um teto |
| `compare.html` | Comparação acessível de até quatro produtos |
| `discover.html` | Exploração editorial por ocasião |
| `recipes.html` | Receitas e ingredientes relacionados ao catálogo |

## Recursos integrados

- `account.html` recebe o perfil local de preferências;
- início e carrinho recebem recuperação não intrusiva da seleção;
- `admin.html` recebe o editor de comportamento do MAX;
- eventos agregados alimentam a inteligência comercial local;
- `data/v340.json` centraliza trilhas, receitas e padrões do MAX.

## White-label

Para adaptar a outra loja, revise `data/v340.json`, os produtos, as categorias e a configuração. Nenhuma origem externa ou serviço pago é necessário.

## Privacidade

Perfil, carrinho, eventos e preferências administrativas ficam no navegador. O editor do MAX não constitui autenticação e não deve armazenar segredos.
