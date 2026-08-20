# Operação local — Conta, Admin Studio e pré-atendimento

## Minha Conta

`conta.html` organiza perfil local, favoritos, lista de interesse, vistos recentemente, exportação e exclusão dos dados locais. Não existe cadastro remoto nem autenticação de cliente.

## Admin Studio

`admin.html` é um editor local para o empreendedor preparar catálogo e configuração sem transformar a hospedagem estática em backend. Pode preparar adição, edição, duplicação e remoção de produtos do rascunho, copy, imagens e configuração da loja.

**Não é uma área administrativa protegida.** Conhecer a URL não concede acesso ao repositório nem permite alterar o site publicado. Mudanças ficam no navegador até serem exportadas e publicadas manualmente.

### Fluxo de publicação

1. exporte os dados;
2. substitua os JSONs em `data/`;
3. copie imagens para `img/` e miniaturas para `img/thumbs/`;
4. execute `python tools/sincronizar_cliente.py`;
5. execute `python tools/auditar_cliente.py`;
6. execute `node tools/testar_max.cjs` se catálogo, categorias ou Max mudaram;
7. revise o diff e publique.

## Pré-atendimento

`atendimento.html` centraliza CTAs comerciais e pode receber contexto de Home, catálogo, produto, Minha Conta, Quiz e Max. O cliente revisa a mensagem completa antes da abertura do WhatsApp.

Nenhum formulário é enviado a servidor pela implementação atual. `wa.me` é usado somente no passo final, após ação explícita.

## Privacidade

Dados lembrados no dispositivo usam armazenamento local. Consulte `PRIVACIDADE.md` para regras de retenção e exclusão.
