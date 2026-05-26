# ServControl — Guia de Deploy Externo

## Credenciais padrão (após seed)

| Campo  | Valor                     |
|--------|---------------------------|
| Email  | `admin@servcontrol.com`   |
| Senha  | `admin123`                |
| Role   | Administrador             |

> **Troque a senha do admin imediatamente após o primeiro acesso!**

---

## Passo 1 — Banco de Dados no Neon (gratuito)

1. Acesse **https://neon.tech** → crie conta → novo projeto `servcontrol`
2. Copie a **Connection string**:
   ```
   postgresql://usuario:senha@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Guarde essa string — será usada como `DATABASE_URL`

---

## Passo 2 — API no Railway

1. Acesse **https://railway.app** → novo projeto
2. Clique em **Deploy from GitHub** (conecte seu repositório) **OU** use o zip extraído
3. Configure o serviço:
   - **Root Directory**: `/` (raiz do monorepo)
   - **Build Command**:
     ```bash
     npm install -g pnpm && pnpm install --frozen-lockfile
     ```
   - **Start Command**:
     ```bash
     pnpm --filter @workspace/db run push && pnpm --filter @workspace/api-server run build && node artifacts/api-server/dist/index.mjs
     ```
4. Em **Variables**, adicione:

   | Variável         | Valor                                        |
   |-----------------|----------------------------------------------|
   | `DATABASE_URL`  | String de conexão do Neon                    |
   | `SESSION_SECRET`| String longa e aleatória (min. 32 chars)     |
   | `PORT`          | `8080`                                       |
   | `NODE_ENV`      | `production`                                 |

5. Anote a URL pública gerada, ex: `https://servcontrol-api-production.up.railway.app`

---

## Passo 3 — App Mobile (Expo)

### Para web (publicar online)

1. Edite `artifacts/mobile/lib/api.ts` e substitua a `BASE_URL`:
   ```typescript
   const BASE_URL = "https://SUA-URL-RAILWAY.railway.app/api";
   ```
2. Execute: `pnpm --filter @workspace/mobile run build`
3. Faça o upload da pasta `dist` no Netlify, Vercel ou Railway Static

### Para APK Android (via Expo EAS)

1. Instale: `npm install -g eas-cli`
2. Login: `eas login`
3. Na pasta `artifacts/mobile`: `eas build --platform android --profile preview`

---

## Passo 4 — Checklist pós-deploy

```
[ ] DATABASE_URL configurado e conectando no Neon
[ ] SESSION_SECRET configurado no Railway
[ ] Build passou sem erros nos logs do Railway
[ ] Seed executou: "✅ Admin inserido com seed." nos logs
[ ] Login admin funciona: admin@servcontrol.com / admin123
[ ] TROCAR SENHA DO ADMIN no Perfil
[ ] Criar primeiros serviços ou verificar os 5 padrões criados pelo seed
```

---

## Arquitetura de produção

```
[Expo App (mobile/web)]
        ↕ HTTPS
[Railway — API Express]
        ↕ PostgreSQL
[Neon — Banco de dados]
```

---

## Estrutura do ZIP / Monorepo

```
/
├── artifacts/
│   ├── api-server/      ← Backend Express + JWT
│   └── mobile/          ← App Expo (admin + cliente)
├── lib/
│   ├── db/              ← Schema Drizzle + migrations
│   └── api-spec/        ← Contrato OpenAPI
├── pnpm-workspace.yaml
└── package.json
```

---

## Variável de ambiente no app mobile

Se hospedar a API fora do Replit, defina no `.env` do mobile:

```env
EXPO_PUBLIC_API_URL=https://SUA-URL-RAILWAY.railway.app/api
```

E atualize `artifacts/mobile/lib/api.ts`:
```typescript
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "/api";
```
