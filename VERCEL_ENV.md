# 🚀 Environment Variables para Vercel

## 📋 Variáveis de Ambiente Necessárias

### 🔧 Miro Configuration
```
MIRO_APP_ID=3458764598765432109
MIRO_ACCESS_TOKEN=eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_g6COHpVOi573okYWzKGcOj3GeSI
MIRO_REGION=eu01
```

### 🗄️ Supabase Configuration
```
SUPABASE_URL=https://xcdnjsufldwmdfchrstx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZG5qc3VmbGR3bWRmY2hyc3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzIxNDMsImV4cCI6MjA3NzQ0ODE0M30.2mJPuhQehNSs-0vcxWSp7RToTJEFePiPl1a5nVUgJBE
```

### ⚙️ App Configuration
```
ENVIRONMENT=production
APP_VERSION=1.0.0
ANALYTICS_ENABLED=true
```

## 🌐 Como Configurar no Vercel

### Método 1: Via Dashboard Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Vá para seu projeto
3. **Settings** → **Environment Variables**
4. Adicione cada variável:

```
Name: MIRO_APP_ID
Value: 3458764598765432109
Environment: Production, Preview, Development

Name: MIRO_ACCESS_TOKEN
Value: eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_BH1OjqHpVAomwhAdCt14quaaHGsmelhore
Environment: Production, Preview, Development

Name: MIRO_REGION
Value: eu01
Environment: Production, Preview, Development

Name: SUPABASE_URL
Value: https://xcdnjsufldwmdfchrstx.supabase.co
Environment: Production, Preview, Development

Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZG5qc3VmbGR3bWRmY2hyc3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzIxNDMsImV4cCI6MjA3NzQ0ODE0M30.2mJPuhQehNSs-0vcxWSp7RToTJEFePiPl1a5nVUgJBE
Environment: Production, Preview, Development

Name: ENVIRONMENT
Value: production
Environment: Production, Preview, Development

Name: APP_VERSION
Value: 1.0.0
Environment: Production, Preview, Development

Name: ANALYTICS_ENABLED
Value: true
Environment: Production, Preview, Development
```

### Método 2: Via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Configurar variáveis
vercel env add MIRO_APP_ID
# Digite: 3458764598765432109

vercel env add MIRO_ACCESS_TOKEN
# Digite: eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_BH1OjqHpVAomwhAdCt14quaaHGsmelhore

vercel env add MIRO_REGION
# Digite: eu01

vercel env add SUPABASE_URL
# Digite: https://xcdnjsufldwmdfchrstx.supabase.co

vercel env add SUPABASE_ANON_KEY
# Digite: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZG5qc3VmbGR3bWRmY2hyc3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzIxNDMsImV4cCI6MjA3NzQ0ODE0M30.2mJPuhQehNSs-0vcxWSp7RToTJEFePiPl1a5nVUgJBE

vercel env add ENVIRONMENT
# Digite: production

vercel env add APP_VERSION
# Digite: 1.0.0

vercel env add ANALYTICS_ENABLED
# Digite: true
```

## 📄 Arquivo .env.local (Para Desenvolvimento)

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Miro Configuration
MIRO_APP_ID=3458764598765432109
MIRO_ACCESS_TOKEN=eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_BH1OjqHpVAomwhAdCt14quaaHGsmelhore
MIRO_REGION=eu01

# Supabase Configuration
SUPABASE_URL=https://xcdnjsufldwmdfchrstx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZG5qc3VmbGR3bWRmY2hyc3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzIxNDMsImV4cCI6MjA3NzQ0ODE0M30.2mJPuhQehNSs-0vcxWSp7RToTJEFePiPl1a5nVUgJBE

# App Configuration
ENVIRONMENT=production
APP_VERSION=1.0.0
ANALYTICS_ENABLED=true
```

## 🔧 Deploy no Vercel

### Opção 1: Deploy via GitHub
1. **Conectar repositório**:
   - Vercel Dashboard → New Project
   - Import from GitHub: `wendleyw/miro-deliverables-app`

2. **Configurar build**:
   - Framework Preset: Other
   - Build Command: (deixar vazio)
   - Output Directory: (deixar vazio)
   - Install Command: (deixar vazio)

3. **Adicionar environment variables** (como mostrado acima)

4. **Deploy**

### Opção 2: Deploy via CLI
```bash
# Na pasta do projeto
cd miro-deliverables-app

# Deploy
vercel --prod

# Seguir as instruções
```

## 🎯 URLs Importantes

Após o deploy, você receberá URLs como:
```
Production: https://miro-deliverables-app.vercel.app
Preview: https://miro-deliverables-app-git-main-wendleyw.vercel.app
```

## 🔗 Configurar no Miro Developer Console

Use a URL de produção do Vercel:
```
App URL: https://miro-deliverables-app.vercel.app/index.html
App ID: 3458764598765432109
Permissions: boards:read, boards:write
Redirect URI: https://miro-deliverables-app.vercel.app/auth/callback
```

## ⚠️ Notas Importantes

### Segurança
- ✅ **SUPABASE_ANON_KEY**: Seguro para frontend (público)
- ⚠️ **MIRO_ACCESS_TOKEN**: Sensível, mas necessário para funcionalidade
- ✅ **MIRO_APP_ID**: Público, pode ser exposto

### Fallbacks
O app funciona mesmo sem environment variables, usando valores padrão do `config.js`.

### Verificação
Após deploy, teste:
1. `https://sua-url.vercel.app/index.html` - App deve carregar
2. `https://sua-url.vercel.app/test.html` - Página de testes
3. Console do navegador - Verificar se variáveis foram carregadas

## 🚀 Comando Rápido para Deploy

```bash
# Clone do GitHub (se necessário)
git clone https://github.com/wendleyw/miro-deliverables-app.git
cd miro-deliverables-app

# Deploy no Vercel
npx vercel --prod

# Ou se já tem Vercel CLI
vercel --prod
```

---

**Todas as variáveis estão prontas para uso no Vercel!** 🎉