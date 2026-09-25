# Conserva Fácil

Aplicação React/Vite para receitas, cálculo de custos e controle de vendas de geleias.

## Tecnologias

- React + TypeScript + Vite
- Tailwind CSS v4
- Zustand
- Zod
- React Router DOM
- Supabase Auth + PostgreSQL

## Configuração do Supabase

1. Copie `.env.example` para `.env.local`.
2. Informe `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Execute `supabase/schema.sql` no SQL Editor do Supabase.
4. Execute `pnpm dev`.

Sem as variáveis, o aplicativo funciona em modo demonstração e salva vendas no navegador.

Use somente a chave pública `anon` no frontend. Nunca coloque a chave `service_role` no Vite. A tabela `sales` usa Row Level Security para que cada pessoa acesse apenas os próprios registros.

Para publicar, execute `pnpm build` e use a pasta `dist`.
