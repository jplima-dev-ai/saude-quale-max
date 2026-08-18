# Privacidade — Saúde Qualemax v1.1

A versão estática do template não deve armazenar conversas do assistente, credenciais, tokens ou chaves secretas no navegador.

Qualquer coleta de dados, analytics, formulário ou integração externa deve ser adicionada de forma explícita, configurável e compatível com a legislação aplicável.

O arquivo `data/config.json` mantém `analytics.enabled` como controle de configuração. A implementação atual não ativa rastreamento oculto.

## Dados locais da v2.0

A v2.0 pode armazenar localmente no navegador favoritos, lista de interesse e histórico de produtos visualizados. Esses registros utilizam IndexedDB (ou fallback local quando necessário) e permanecem no dispositivo do visitante. Eles não são transmitidos automaticamente para a loja. Quando o visitante decide enviar sua lista pelo WhatsApp, somente os nomes dos produtos selecionados são incluídos na mensagem preparada para o atendimento.
