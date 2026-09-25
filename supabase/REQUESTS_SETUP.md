# Reembolso e cancelamento

## Banco de dados

Execute, nesta ordem, no SQL Editor do Supabase:

1. `migrations/202609240002_refund_requests.sql`
2. `migrations/202609240003_subscription_cancellations.sql`
3. `migrations/202609240004_request_status_sync.sql`

## Edge Functions

Publique as duas funções:

```sh
supabase functions deploy request-refund --no-verify-jwt
supabase functions deploy request-subscription-cancellation --no-verify-jwt
```

O gateway não valida JWT nessas duas funções porque elas próprias validam o token do usuário antes de qualquer operação.

## O que cada função faz

### `request-refund`

- exige usuário autenticado;
- localiza a assinatura pelo e-mail autenticado;
- confirma que a assinatura está ativa;
- calcula os sete dias no servidor;
- exige um motivo entre 3 e 1000 caracteres;
- bloqueia pedidos duplicados;
- registra o pedido em `refund_requests`.

### `request-subscription-cancellation`

- exige usuário autenticado;
- localiza a assinatura ativa pelo e-mail autenticado;
- bloqueia pedidos duplicados;
- registra o pedido em `subscription_cancellation_requests`.

## Processamento na Cakto

Os pedidos ficam com status `requested`. Processe o reembolso ou o cancelamento no painel da Cakto. Quando o webhook atualizar `entitlements` para `refunded` ou `canceled`, a migration de sincronização conclui automaticamente o pedido correspondente.
