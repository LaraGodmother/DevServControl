# ServControl

Sistema de gerenciamento de serviços com roles de admin e cliente — mobile app (Expo) + API backend.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — rodar o API server (porta 5000/8080)
- `pnpm run typecheck` — typecheck completo em todos os pacotes
- `pnpm run build` — typecheck + build todos os pacotes
- `pnpm --filter @workspace/db run push` — aplicar schema no banco de dados (dev)
- Env necessária: `DATABASE_URL` — string de conexão Postgres (Neon, Railway ou outro)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54 + Expo Router v6 (Stack navigation)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT via SESSION_SECRET
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/` — App Expo (React Native)
- `artifacts/mobile/app/` — Telas (Stack puro, sem tabs)
  - `index.tsx` — Landing/splash
  - `auth/` — login, register, forgot-password, request-budget
  - `admin/` — dashboard, clientes, serviços, orçamentos, ordens, chat, financeiro, calendário, agenda, perfil, loja
  - `client/` — dashboard, serviços, agendamentos, orçamentos, novo serviço, chat, loja
- `artifacts/mobile/context/` — AuthContext, DataContext, SettingsContext, StoreContext
- `artifacts/mobile/constants/theme.ts` — BRAND (cores, nome, logo)
- `artifacts/api-server/src/` — Express API
- `artifacts/api-server/src/routes/` — auth, services, budgets, orders, clients, appointments, calendarNotes, chat, companySettings, schedule, exports, seed
- `lib/db/src/schema/index.ts` — Schema do banco (users, services, budgets, serviceOrders, appointments, calendarNotes, chatMessages, products, appSettings)

## Architecture decisions

- Navegação é Stack puro (sem bottom tabs) — todas as rotas registradas em `_layout.tsx`
- Auth via JWT — token salvo em AsyncStorage, sem `@workspace/api-client-react`
- Seed automático no startup da API: cria admin + 5 serviços padrão se banco vazio
- Cores do app: azul claro (#1976D2) + laranja (#F57C00) + branco
- Admin padrão após seed: `admin@servcontrol.com` / `admin123`

## Product

- **Admin**: dashboard com métricas, CRUD de clientes/serviços/orçamentos/ordens, chat, financeiro, calendário, agenda, exportação CSV, loja
- **Cliente**: solicitar serviços, acompanhar orçamentos/agendamentos, chat com admin, loja

## User preferences

- Nome do app: ServControl (sem Angelmarc em lugar algum)
- Cores: azul claro (#1976D2) + laranja (#F57C00) + branco
- Logo: arquivo `artifacts/mobile/assets/images/logo.png`
- Hospedagem alvo: Neon (banco) + Railway (API) + Expo (mobile)

## Gotchas

- Sempre rodar `pnpm --filter @workspace/db run push` após criar/alterar schema
- O seed só insere dados se o banco estiver vazio — não duplica
- A API usa `SESSION_SECRET` do Replit Secrets para JWT
- `DATABASE_URL` deve ser configurado como secret antes de iniciar a API
- Para deploy externo, ver seção DEPLOY abaixo

## DEPLOY — Neon + Railway + Expo

### 1. Banco de Dados — Neon (gratuito)

1. Acesse https://neon.tech e crie uma conta
2. Crie um novo projeto — ex: `servcontrol-prod`
3. Copie a **Connection string** (formato: `postgresql://user:pass@host/dbname?sslmode=require`)
4. Guarde essa string — será o `DATABASE_URL`

### 2. API — Railway

1. Acesse https://railway.app e crie uma conta
2. Crie um novo projeto → **Deploy from GitHub repo** (ou faça upload do zip)
   - Raiz do serviço: `artifacts/api-server`
   - Comando de build: `pnpm install && pnpm --filter @workspace/db run push && pnpm --filter @workspace/api-server run build`
   - Comando de start: `node artifacts/api-server/dist/index.mjs`
3. Em **Variables** (Railway), adicione:
   - `DATABASE_URL` = string do Neon
   - `SESSION_SECRET` = uma string secreta longa (ex: 64 chars aleatórios)
   - `PORT` = `8080`
   - `NODE_ENV` = `production`
4. Anote a URL pública da Railway — ex: `https://servcontrol-api.railway.app`

### 3. Mobile — Expo (publicar)

1. No arquivo `artifacts/mobile/lib/api.ts`, troque a `BASE_URL` para a URL da Railway
2. Execute: `npx eas build --platform android` (ou ios) para gerar APK/IPA
3. Ou use `expo publish` para web

### 4. Pós-deploy checklist

- [ ] `DATABASE_URL` configurado no Railway
- [ ] `SESSION_SECRET` configurado no Railway
- [ ] Schema aplicado: `pnpm --filter @workspace/db run push`
- [ ] Seed executou na primeira inicialização (check nos logs do Railway)
- [ ] Login admin funciona: `admin@servcontrol.com` / `admin123`
- [ ] Trocar senha do admin após primeiro acesso

## Pointers

- Ver skill `pnpm-workspace` para estrutura do monorepo, TypeScript e detalhes de pacotes
