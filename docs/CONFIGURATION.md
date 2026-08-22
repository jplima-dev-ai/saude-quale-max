# Configuração

## Arquivo principal

`data/config.json` controla identidade, contato, redes, MAX, SEO, módulos e condições comerciais. Mantenha o JSON válido e nunca armazene segredos.

## Seções

- empresa: nome, descrição, localidade, site e CEP.
- contato: WhatsApp internacional, e-mail, telefone e endereço.
- marca: logo e cores.
- redes: perfis públicos.
- chatbot: identidade e tom do MAX.
- seo: títulos, descrições e URLs canônicas.
- recursos: módulos ativos.
- comercial: horário, entrega, retirada e pagamento.
- promocoes: regras demonstrativas.

## Módulos comerciais

Carrinho, variantes, estoque, campanhas, kits, comandos e inteligência comercial devem ser ativados somente quando dados e páginas estiverem publicados.

## Validação

```bash
python3 tools/sync-client.py --check
python3 tools/audit-client.py
python3 tools/test-v359.py
```

Revise também com teclado e NVDA.
