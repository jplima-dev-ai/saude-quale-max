# Configuração

As alterações comuns da loja devem ser feitas em `data/config.json`.

## Empresa

- `nome`
- `descricao`
- `cidade`
- `estado`
- `site`
- `cep`

## Contato

- `whatsapp`: somente números, com código do país e DDD
- `telefone`
- `email`
- `endereco`

## Marca

- `logo`
- `corPrincipal`
- `corSecundaria`
- `corAcento`
- `corFundo`

## Redes

Configure somente perfis reais.

## Chatbot

- `ativo`: `true` ou `false`
- `nome`: nome exibido no assistente

## SEO

- `title`
- `description`
- `canonical`

Depois de alterar os dados, revise o conteúdo e valide a publicação.


## Redes sociais — v1.8

Configure em `data/config.json`:

```json
"redes": {
  "instagram": "https://www.instagram.com/seu-perfil/",
  "facebook": "https://www.facebook.com/sua-pagina/",
  "tiktok": "https://www.tiktok.com/@seu-perfil",
  "youtube": "https://www.youtube.com/@seu-canal",
  "pinterest": "https://www.pinterest.com/seu-perfil/"
}
```

Também é aceito apenas o usuário/handle. Deixe uma rede como string vazia quando a empresa não possuir perfil oficial. O componente é ocultado automaticamente quando nenhuma rede está configurada. Não use perfis fictícios.
