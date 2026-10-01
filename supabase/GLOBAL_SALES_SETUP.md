# Ranking global de receitas

Execute no SQL Editor do Supabase:

- `migrations/202609300001_global_recipe_sales.sql`

A função retorna somente totais agrupados por receita. Ela não expõe nomes de clientes, valores, usuários ou vendas individuais.

A tabela `sales` continua protegida pelas políticas atuais: cada pessoa consegue consultar e remover somente as próprias vendas.
