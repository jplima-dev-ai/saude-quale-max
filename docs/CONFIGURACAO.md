# Configuração da loja

As alterações comuns de cliente devem ser feitas principalmente em `data/config.json`.

## Empresa

```json
"empresa": {
  "nome": "Saúde Qualimax",
  "descricao": "...",
  "cidade": "Serra",
  "estado": "ES",
  "site": "https://...",
  "cep": "29165-130"
}
```

O campo `site` deve apontar para a URL pública final da implantação.

## Contato

```json
"contato": {
  "whatsapp": "5527992820798",
  "email": "contato@example.com",
  "telefone": "(27) 00000-0000",
  "endereco": "..."
}
```

Para `whatsapp`, use apenas dígitos, incluindo código do país e DDD.

## Marca

```json
"marca": {
  "logo": "🌿",
  "logoImagem": "img/logo-saude-qualimax.webp",
  "corPrincipal": "#176b4d",
  "corSecundaria": "#0d4532",
  "corAcento": "#c99a45",
  "corFundo": "#fbfaf6"
}
```

As cores configuráveis aceitas pelo frontend seguem o formato hexadecimal de seis dígitos.

## Redes sociais

Somente perfis oficiais devem ser configurados. Redes vazias são ocultadas automaticamente.

```json
"redes": {
  "instagram": "@saudequalimax",
  "facebook": "",
  "tiktok": "",
  "youtube": "",
  "pinterest": ""
}
```

Quando uma URL completa é utilizada, o frontend valida protocolo HTTPS e o domínio esperado da plataforma.

## Max

```json
"chatbot": {
  "ativo": true,
  "nome": "Max"
}
```

`ativo: false` remove os pontos de abertura do assistente.

## Analytics

```json
"analytics": {
  "enabled": false
}
```

A configuração atual não ativa rastreamento por conta própria.

## SEO

Existem metadados gerais e metadados específicos por página em `seo.paginas`.

Ao trocar domínio, nome de repositório ou cliente:

1. atualize `empresa.site`;
2. atualize `seo.canonical`;
3. revise todos os canonicals de `seo.paginas`;
4. atualize `sitemap.xml`;
5. atualize `robots.txt`;
6. revise `/.well-known/security.txt`;
7. valide as páginas de produto e seus dados estruturados.



## Recursos opcionais

A seção `recursos` permite simplificar o pacote entregue ao cliente:

```json
"recursos": {
  "quiz": true,
  "jornadaLocal": true,
  "colecoes": true,
  "pwa": true
}
```

- `quiz`: controla links de descoberta guiada e a presença no sitemap;
- `jornadaLocal`: controla a seção “Continue de onde você parou”;
- `colecoes`: controla favoritos, lista e recentes;
- `pwa`: controla registro/instalação da PWA.

Essas flags são de produto/apresentação, não mecanismos de autorização.

## Informações comerciais opcionais

```json
"comercial": {
  "horario": "",
  "entrega": "",
  "retirada": "",
  "observacoes": ""
}
```

Campos vazios não são exibidos. A plataforma não inventa horário, entrega ou retirada.
