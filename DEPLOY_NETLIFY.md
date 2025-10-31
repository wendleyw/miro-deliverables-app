# 🚀 Deploy no Netlify - Passo a Passo

## 📦 Arquivos Prontos para Deploy

O script de deploy criou a pasta: `deploy-20251031-132457`

Esta pasta contém todos os arquivos necessários para o Miro App.

## 🌐 Deploy no Netlify (5 minutos)

### Passo 1: Acessar Netlify
1. Vá para [netlify.com](https://netlify.com)
2. Faça login ou crie uma conta gratuita

### Passo 2: Deploy por Drag & Drop
1. **Na página inicial do Netlify**, procure por:
   ```
   "Want to deploy a new site without connecting to Git?
   Drag and drop your site output folder here"
   ```

2. **Arraste a pasta** `deploy-20251031-132457` para essa área

3. **Aguarde o upload** (30-60 segundos)

4. **Anote a URL gerada**, exemplo:
   ```
   https://amazing-app-123456.netlify.app
   ```

### Passo 3: Testar o Deploy
1. **Abra a URL** no navegador
2. **Adicione `/index.html`** no final:
   ```
   https://amazing-app-123456.netlify.app/index.html
   ```
3. **Verifique se o app carrega** sem erros

## 🎯 Configurar no Miro Developer Console

### Passo 1: Acessar Developer Console
1. Vá para [developers.miro.com](https://developers.miro.com)
2. Faça login com sua conta Miro
3. Clique em **"Your apps"**

### Passo 2: Criar ou Editar App
Se ainda não tem app:
1. **"Create new app"**
2. **App name**: `Project Deliverables Dashboard`
3. **Description**: `Manage project deliverables and team workload`

Se já tem app:
1. **Clique no app existente**
2. **Vá em "Settings"**

### Passo 3: Configurar URLs
1. **App URL**: Cole sua URL do Netlify + `/index.html`
   ```
   https://amazing-app-123456.netlify.app/index.html
   ```

2. **Permissions**: Selecione:
   - ✅ `boards:read`
   - ✅ `boards:write`

3. **Redirect URLs**: Adicione:
   ```
   https://amazing-app-123456.netlify.app/auth/callback
   ```

4. **Clique "Save"**

### Passo 4: Instalar o App
1. **"Install app"**
2. **Selecione seu team**
3. **Autorize as permissões**
4. **Aguarde 2-3 minutos** para propagação

## 🔍 Encontrar o App no Miro

### Onde Procurar:
1. **Abra um board** no Miro
2. **Sidebar esquerdo** → Ícone de Apps (🧩)
3. **Procure por**: "Project Deliverables Dashboard"
4. **Ou busque**: "deliverables"

### Se não aparecer:
1. **Aguarde 2-3 minutos** após instalação
2. **Refresh da página** (F5)
3. **Verifique se você é Admin/Editor** do team
4. **Tente em outro board**

## ✅ Teste Final

### No Miro:
1. **Abrir o app** → Deve aparecer o dashboard
2. **Clicar "+ Add"** → Deve abrir o modal
3. **Ver seção "CEO Dashboard"** → Deve mostrar métricas
4. **Clicar "Generate Report"** → Deve criar sticky note

### Se der erro:
1. **Abrir Developer Tools** (F12)
2. **Ver aba Console** → Verificar erros
3. **Verificar se a URL está correta**

## 🔧 URLs de Exemplo

Substitua `amazing-app-123456` pela sua URL real:

```bash
# App URL (para Miro Developer Console)
https://amazing-app-123456.netlify.app/index.html

# Redirect URI
https://amazing-app-123456.netlify.app/auth/callback

# Teste direto no navegador
https://amazing-app-123456.netlify.app/test.html
```

## 🆘 Se Não Funcionar

### Checklist Rápido:
- [ ] URL do Netlify está acessível
- [ ] App URL no Miro Developer Console está correta
- [ ] App foi instalado no team correto
- [ ] Você tem permissões de Admin/Editor
- [ ] Aguardou 2-3 minutos após instalação
- [ ] Fez refresh da página do Miro

### Próximos Passos:
1. **Compartilhe a URL** do seu deploy
2. **Screenshot** do erro (se houver)
3. **Confirme suas permissões** no team Miro

---

**Tempo estimado:** 5-10 minutos para deploy completo
**Status esperado:** App visível no Miro Apps panel