# Publicação manual da ativação

1. Execute no **SQL Editor** todo o conteúdo de `../migrations/202609250001_access_activation.sql`.
2. Abra **Edge Functions** e crie uma função **Via Editor**.
3. Use exatamente o nome `activate-access`.
4. Apague o exemplo e cole todo o conteúdo de `activate-access.ts`.
5. Publique a função.
6. Abra as configurações e desative **Verify JWT**, pois a cliente ainda não estará autenticada.
7. Em **Edge Functions > Secrets**, crie `ACTIVATION_PEPPER` com uma sequência longa e aleatória.

A função limita tentativas, valida uma compra ativa ainda não ativada, compara o e-mail e os quatro últimos números do telefone, define a senha escolhida e devolve uma sessão para o app abrir o painel.

O webhook `cakto-webhook` também precisa ser republicado com a versão atualizada de `../functions/cakto-webhook/index.ts`, que grava `customer_phone_last4` em `entitlements`.
