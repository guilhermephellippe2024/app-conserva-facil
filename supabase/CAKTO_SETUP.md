# Cakto + Supabase

## 1. Banco de dados

Execute `migrations/202609240001_cakto_access.sql` no SQL Editor do Supabase.

## 2. Segredos da Edge Function

Cadastre estes valores no Supabase:

- `CAKTO_WEBHOOK_SECRET`: segredo exibido ao criar o webhook na Cakto.
- `CAKTO_PRODUCT_IDS`: ID do produto da Cakto; use vírgula para mais de um.
- `APP_URL`: endereço público do app, sem barra no final.

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já são disponibilizados pelo ambiente das Edge Functions. Nunca exponha a chave administrativa no frontend.

## 3. Publicação

```sh
supabase link --project-ref SEU_PROJECT_REF
supabase db push
supabase secrets set CAKTO_WEBHOOK_SECRET=SEU_SEGREDO CAKTO_PRODUCT_IDS=ID_DO_PRODUTO APP_URL=https://seu-app.com
supabase functions deploy cakto-webhook --no-verify-jwt
```

Endpoint publicado:

```text
https://SEU_PROJECT_REF.supabase.co/functions/v1/cakto-webhook
```

## 4. Cakto

No produto, abra **Webhooks**, cole o endpoint e ative:

- `purchase_approved`
- `refund`
- `chargeback`

No canal de entrega, escolha **Área de membros Externa** e use o endereço público do app, não o endpoint do webhook.
