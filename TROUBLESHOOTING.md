# 🔧 Troubleshooting - App não aparece no Miro

## 🚨 Problema: "Não consigo ver o app no Miro quando allow o app"

### ✅ Checklist de Diagnóstico

#### 1. **Verificar se o app foi instalado corretamente**

**No Miro Developer Console:**
- Acesse [developers.miro.com](https://developers.miro.com)
- Vá em "Your apps"
- Verifique se o app "Project Deliverables Dashboard" está listado
- Status deve estar "Published" ou "Installed"

#### 2. **Verificar permissões do usuário**

**No Miro:**
- Você precisa ser **Admin** ou **Editor** do team
- Usuários com permissão "Viewer" não conseguem instalar apps
- Verifique em: Team Settings → Members → Sua permissão

#### 3. **Verificar se o app está visível no board**

**Onde encontrar o app:**
1. **Sidebar esquerdo** → Ícone de Apps (puzzle piece)
2. **Procurar por:** "Project Deliverables Dashboard"
3. **Ou procurar por:** "Deliverables"

#### 4. **Verificar se o app está habilitado para o team**

**No Miro:**
- Team Settings → Apps & Integrations
- Procurar por "Project Deliverables Dashboard"
- Deve estar com status "Enabled"

## 🔍 Soluções Passo a Passo

### Solução 1: Reinstalar o App

```bash
# 1. No Miro Developer Console
- Your apps → Project Deliverables Dashboard
- Settings → Uninstall app
- Install app → Select team → Authorize

# 2. Aguardar 2-3 minutos para propagação
# 3. Refresh do browser no Miro
# 4. Abrir um board → Apps panel
```

### Solução 2: Verificar URL do App

**Problema comum:** URL incorreta no manifest

```json
// ❌ Errado
"startApp": {
  "url": "https://localhost:8000/index.html"
}

// ✅ Correto  
"startApp": {
  "url": "https://sua-url-deploy.netlify.app/index.html"
}
```

### Solução 3: Testar Localmente Primeiro

```bash
# 1. Navegar para a pasta do app
cd miro-deliverables-app

# 2. Iniciar servidor local
python3 -m http.server 8000
# ou
npx serve .

# 3. Abrir no browser
http://localhost:8000/test.html

# 4. Verificar se tudo carrega sem erros
```

### Solução 4: Verificar Console de Erros

**No Miro:**
1. Abrir Developer Tools (F12)
2. Ir na aba Console
3. Tentar abrir o app
4. Verificar se há erros em vermelho

**Erros comuns:**
- `CORS error` → Problema de configuração do servidor
- `404 Not Found` → URL incorreta no manifest
- `Permission denied` → Problema de permissões

### Solução 5: Usar App ID Correto

**Verificar se o App ID está correto:**

```json
// No manifest.json
{
  "appId": "3458764598765432109",  // ← Este deve ser único
  "name": "Project Deliverables Dashboard"
}
```

## 🚀 Deploy Correto

### Passo 1: Deploy no Netlify

```bash
# 1. Fazer deploy dos arquivos
# Arrastar pasta para netlify.com

# 2. Anotar a URL gerada
# Exemplo: https://amazing-app-123.netlify.app
```

### Passo 2: Atualizar Manifest

```json
{
  "name": "Project Deliverables Dashboard",
  "appId": "3458764598765432109",
  "sdkVersion": "2.0",
  "permissions": ["boards:read", "boards:write"],
  "startApp": {
    "url": "https://amazing-app-123.netlify.app/index.html",
    "height": 650,
    "width": 380
  }
}
```

### Passo 3: Atualizar no Miro Developer Console

```bash
# 1. developers.miro.com → Your apps
# 2. Project Deliverables Dashboard → Settings
# 3. App URL: https://amazing-app-123.netlify.app/index.html
# 4. Save changes
# 5. Reinstall app
```

## 🔧 Comandos de Teste

### Testar App Localmente

```bash
# Iniciar servidor
cd miro-deliverables-app
python3 -m http.server 8000

# Abrir teste
open http://localhost:8000/test.html
```

### Verificar Configuração

```javascript
// No console do browser (F12)
console.log(window.AppConfig);
console.log(window.AppConfig.get('supabase.url'));
```

### Testar Supabase

```javascript
// No console do browser
const supabase = window.AppConfig.getSupabaseClient();
supabase.from('deliverables').select('*').limit(1).then(console.log);
```

## 📱 Onde Encontrar o App no Miro

### Localização 1: Apps Panel (Principal)
```
Board → Sidebar esquerdo → Ícone Apps (🧩) → "Project Deliverables Dashboard"
```

### Localização 2: Search
```
Board → Apps panel → Search: "deliverables"
```

### Localização 3: Recently Used
```
Board → Apps panel → Recently used (se já foi usado antes)
```

## ⚠️ Problemas Conhecidos

### 1. **App não aparece na lista**
- **Causa:** Não foi instalado ou permissões insuficientes
- **Solução:** Reinstalar como Admin do team

### 2. **App aparece mas não abre**
- **Causa:** URL incorreta ou servidor offline
- **Solução:** Verificar URL no manifest e status do deploy

### 3. **App abre mas está em branco**
- **Causa:** Erro de JavaScript ou CORS
- **Solução:** Verificar console de erros (F12)

### 4. **App funciona local mas não no Miro**
- **Causa:** Diferenças entre ambiente local e produção
- **Solução:** Testar com HTTPS e verificar CORS

## 🆘 Suporte Rápido

### Verificação Rápida (2 minutos)

```bash
# 1. App instalado?
developers.miro.com → Your apps → Status

# 2. URL correta?
manifest.json → startApp.url

# 3. Deploy funcionando?
curl -I https://sua-url.netlify.app/index.html

# 4. Permissões OK?
Miro → Team Settings → Members → Sua role
```

### Se nada funcionar:

1. **Criar novo app** no Miro Developer Console
2. **Usar App ID diferente** no manifest.json
3. **Fazer novo deploy** com configurações limpas
4. **Instalar do zero** no team

---

## 📞 Contato

Se o problema persistir:
1. Compartilhe a URL do seu deploy
2. Compartilhe screenshot do erro no console (F12)
3. Confirme suas permissões no team Miro

**Status esperado:** App visível no Apps panel em 2-3 minutos após instalação.