# ServControl — Guia Completo de Deploy
## Neon (banco de dados) + Railway (API) + Expo (app mobile)

---

## Credenciais padrão após o primeiro boot

| Campo  | Valor                   |
|--------|-------------------------|
| Email  | `admin@servcontrol.com` |
| Senha  | `admin123`              |
| Perfil | Administrador           |

> ⚠️ **Troque a senha do admin imediatamente após o primeiro login!**

---

## PARTE 1 — Banco de Dados no Neon (gratuito)

### Passo 1 — Criar conta no Neon

1. Abra o navegador e acesse: **https://neon.tech**
2. Clique em **"Sign Up"** (canto superior direito)
3. Faça login com Google ou crie uma conta com e-mail
4. Confirme o e-mail se solicitado

### Passo 2 — Criar o projeto no Neon

1. Após login, clique em **"New Project"**
2. Preencha:
   - **Project Name**: `servcontrol`
   - **Database Name**: `servcontroldb` (ou deixe o padrão `neondb`)
   - **Region**: escolha a mais próxima do Brasil — `AWS us-east-1` ou `AWS sa-east-1`
3. Clique em **"Create Project"**

### Passo 3 — Copiar a Connection String

1. Na página do projeto, clique na aba **"Connection Details"** (ou "Dashboard")
2. Em **"Connection string"**, clique no ícone de cópia 📋
3. A string tem este formato:
   ```
   postgresql://usuario:senha@ep-nome-do-projeto.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Guarde essa string** — você vai precisar dela na Parte 2

> **Dica**: Marque a opção "Pooled connection" se aparecer — melhora performance.

---

## PARTE 2 — API no Railway

### Passo 1 — Preparar os arquivos

Após baixar o ZIP do Replit e extrair:

1. Abra a pasta extraída no seu computador
2. **Você NÃO precisa alterar nenhum arquivo de código** para o deploy básico funcionar
3. O único arquivo que você precisará criar é o `.env` na raiz do projeto (explicado abaixo)

### Passo 2 — Criar conta no Railway

1. Acesse: **https://railway.app**
2. Clique em **"Start a New Project"** ou **"Login"**
3. Faça login com **GitHub** (recomendado) ou e-mail

### Passo 3 — Fazer upload do projeto

**Opção A — Via GitHub (recomendado):**

1. Faça upload da pasta extraída para um repositório GitHub privado:
   - Acesse **https://github.com/new**
   - Crie um repositório privado chamado `servcontrol`
   - Na pasta do projeto no seu computador, execute:
     ```bash
     git init
     git add .
     git commit -m "ServControl initial commit"
     git remote add origin https://github.com/SEU_USUARIO/servcontrol.git
     git push -u origin main
     ```
2. No Railway: **"New Project"** → **"Deploy from GitHub repo"** → selecione `servcontrol`

**Opção B — Via CLI do Railway:**

1. Instale o Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
2. Na pasta do projeto:
   ```bash
   railway login
   railway init
   railway up
   ```

### Passo 4 — Configurar o serviço no Railway

No painel do Railway, clique no serviço criado e vá em **"Settings"**:

1. **Root Directory**: deixe como `/` (raiz)
2. **Build Command** (clique em "Edit"):
   ```
   npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter @workspace/db run push
   ```
3. **Start Command**:
   ```
   pnpm --filter @workspace/api-server run build && node artifacts/api-server/dist/index.mjs
   ```

### Passo 5 — Configurar as variáveis de ambiente (OBRIGATÓRIO)

No Railway, clique em **"Variables"** e adicione uma por uma:

| Nome da variável | Valor |
|-----------------|-------|
| `DATABASE_URL` | A connection string do Neon (copiada na Parte 1) |
| `SESSION_SECRET` | Uma string longa e aleatória — use o gerador abaixo |
| `PORT` | `8080` |
| `NODE_ENV` | `production` |

**Como gerar o SESSION_SECRET:**
- Abra um terminal e execute: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Ou use: https://generate-secret.vercel.app/64
- Cole o resultado como valor do `SESSION_SECRET`

### Passo 6 — Verificar o deploy

1. Clique em **"Deploy"** (ou ele inicia automaticamente)
2. Aguarde o build completar (3–5 minutos na primeira vez)
3. Clique em **"View Logs"** e procure por:
   ```
   Server listening  port: 8080
   ✅ Serviços inseridos com seed.
   ✅ Admin inserido com seed.
   ```
4. Anote a URL pública gerada, ex:
   ```
   https://servcontrol-production.up.railway.app
   ```

---

## PARTE 3 — Conectar o App Mobile à API do Railway

### Arquivo a alterar: `artifacts/mobile/lib/api.ts`

Abra o arquivo `artifacts/mobile/lib/api.ts` e localize as primeiras linhas:

```typescript
const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? window.location.origin + "/api"
    : "http://localhost:80/api");
```

**Substitua por:**

```typescript
const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://SUA-URL-DO-RAILWAY.up.railway.app/api";
```

> Substitua `SUA-URL-DO-RAILWAY.up.railway.app` pela URL real do Railway.

**Ou melhor ainda**, crie o arquivo `artifacts/mobile/.env` com:

```env
EXPO_PUBLIC_API_URL=https://SUA-URL-DO-RAILWAY.up.railway.app/api
```

---

## PARTE 4 — Publicar o App Mobile

### Opção A — Versão Web (mais fácil)

1. Na pasta do projeto, execute:
   ```bash
   pnpm install
   pnpm --filter @workspace/mobile run build
   ```
2. A pasta `artifacts/mobile/dist` será gerada
3. Faça upload no **Netlify**: arraste a pasta `dist` em https://app.netlify.com/drop
4. Ou no **Vercel**: `npx vercel --prod artifacts/mobile/dist`

### Opção B — APK Android (via Expo EAS)

1. Instale o EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Faça login na Expo:
   ```bash
   eas login
   ```
3. Na pasta `artifacts/mobile`, execute:
   ```bash
   eas build --platform android --profile preview
   ```
4. Baixe o APK gerado e instale no celular

---

## PARTE 5 — Checklist Final

```
[ ] Neon: projeto criado e connection string copiada
[ ] Railway: variável DATABASE_URL configurada com a string do Neon
[ ] Railway: variável SESSION_SECRET configurada (string aleatória de 64 chars)
[ ] Railway: variável PORT=8080 configurada
[ ] Railway: variável NODE_ENV=production configurada
[ ] Build do Railway passou sem erros (verificar logs)
[ ] Seed executou: logs mostram "✅ Admin inserido com seed."
[ ] Login admin funciona: admin@servcontrol.com / admin123
[ ] TROCAR A SENHA DO ADMIN em: Menu → Perfil → Alterar Senha
[ ] URL da Railway configurada no arquivo api.ts do mobile
[ ] App mobile acessando a API corretamente
```

---

## Arquitetura de Produção

```
[App Mobile / Web]          ← Expo (web ou APK)
        ↕ HTTPS
[API Railway]               ← Express + JWT
  URL: seu-app.railway.app
        ↕ SSL/TLS
[Banco Neon]                ← PostgreSQL gerenciado
  Região: AWS us-east-1
```

---

## Problemas Comuns

### "relation does not exist" nos logs do Railway
→ O comando `pnpm --filter @workspace/db run push` não executou.
→ Solução: Re-execute o build ou adicione manualmente nas variáveis e redeploy.

### "Invalid token" no login do app
→ O `SESSION_SECRET` no Railway está incorreto ou vazio.
→ Solução: Verifique as variáveis no Railway e redeploy.

### App mobile não conecta na API
→ A URL no `api.ts` está incorreta.
→ Solução: Confirme a URL exata no painel do Railway (aba "Settings" → "Domains").

### Seed não executou (admin não criado)
→ O banco estava vazio mas o seed falhou.
→ Solução: Verifique o `DATABASE_URL` e aguarde o próximo restart automático.

---

## Suporte e Contato

- App: **ServControl**
- Admin padrão: `admin@servcontrol.com` / `admin123`
- Lembre-se de trocar a senha e o e-mail do admin após o primeiro acesso!
