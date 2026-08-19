# Max — assistente de descoberta

## Papel

Max é um assistente local baseado nos dados do catálogo. Ele não depende de uma API externa de IA e não deve receber credenciais ou chaves secretas no frontend.

## Capacidades atuais

Max pode:

- localizar produtos;
- reconhecer categorias;
- combinar preferências durante a conversa;
- refinar por formato;
- identificar atributos cadastrados como vegano e sem glúten;
- apresentar até alguns resultados por vez;
- continuar com “Mostrar mais”;
- lembrar o último produto aberto durante a sessão;
- encaminhar para catálogo, quiz, redes sociais e WhatsApp;
- abrir as escolhas salvas quando o recurso estiver disponível.

## Contexto de curto prazo

Durante a conversa, Max pode combinar critérios sucessivos.

Exemplo:

```text
"quero algo vegano"
"em pó"
"sem glúten"
```

O resultado é filtrado pelo cruzamento dos critérios que realmente existem no catálogo.

## Limites

Max não deve:

- inventar preço;
- inventar estoque;
- afirmar disponibilidade;
- diagnosticar;
- recomendar produto para tratar doença;
- afirmar contraindicação sem fonte do produto;
- prometer resultado clínico.

Perguntas médicas são direcionadas para leitura do rótulo e orientação profissional adequada.

## Dados e privacidade

As mensagens do Max não são armazenadas em banco remoto pela implementação atual. A memória contextual existe apenas durante a sessão da página.

## Manutenção

Ao alterar a taxonomia ou campos de produto, revisar:

- reconhecimento de categorias;
- mapeamento de formatos;
- regras de atributos;
- stop words e busca textual;
- caminhos de navegação;
- guardrails médicos e comerciais.
