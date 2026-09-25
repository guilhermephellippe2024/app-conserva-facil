# Publicação manual pelo Dashboard

Estes arquivos são independentes e foram preparados para serem colados diretamente no editor de Edge Functions do Supabase.

## Reembolso

1. Abra **Edge Functions**.
2. Clique em **Deploy a new function** e escolha **Via Editor**.
3. Nome: `request-refund`.
4. Apague o exemplo e cole todo o conteúdo de `request-refund.ts`.
5. Publique a função.
6. Abra as configurações e desative **Verify JWT**.

## Cancelamento

1. Clique novamente em **Deploy a new function** e escolha **Via Editor**.
2. Nome: `request-subscription-cancellation`.
3. Apague o exemplo e cole todo o conteúdo de `request-subscription-cancellation.ts`.
4. Publique a função.
5. Abra as configurações e desative **Verify JWT**.

As funções continuam autenticadas: o código valida o token do usuário recebido no cabeçalho `Authorization`. Não é necessário cadastrar segredos novos; as chaves padrão do Supabase são disponibilizadas automaticamente às Edge Functions.
