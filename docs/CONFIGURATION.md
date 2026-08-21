# Configuração

## Arquivo principal

data/config.json controla identidade, contato, redes, MAX, SEO, módulos e condições comerciais. Mantenha JSON válido e nunca armazene segredos.

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

## Recursos 3.3.3

Carrinho, variantes, estoque, campanhas, kits, comandos e inteligência comercial devem ser ativados somente quando dados e páginas estiverem publicados.

## Validação

    python tools/sync-client.py --check
    python tools/audit-client.py
    python tools/test-v333.py

Revise também com teclado e NVDA.\n