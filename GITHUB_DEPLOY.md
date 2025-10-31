# 🚀 GitHub Deploy Guide - Miro Deliverables App

## 📋 Passo 1: Criar Repositório no GitHub

### 1.1 Criar Repositório
1. **Acesse:** [github.com/new](https://github.com/new)
2. **Repository name:** `miro-deliverables-app`
3. **Description:** `Native Miro app for managing project deliverables with Supabase backend`
4. **Visibility:** Public (ou Private se preferir)
5. **NÃO marque:** "Add a README file" (já temos)
6. **Clique:** "Create repository"

### 1.2 Conectar Repositório Local
```bash
# No terminal, dentro da pasta miro-deliverables-app:
git remote add origin https://github.com/SEU-USERNAME/miro-deliverables-app.git
git branch -M main
git push -u origin main
```

## 🌐 Passo 2: Deploy Online (Netlify - Recomendado)

### Opção A: Deploy Automático via GitHub

1. **Acesse:** [netlify.com](https://netlify.com)
2. **Clique:** "New site from Git"
3. **Conecte:** GitHub account
4. **Selecione:** `miro-deliverables-app` repository
5. **Configure:**
   - **Branch:** `main`
   - **Build command:** (deixe vazio)
   - **Publish directory:** `.` (raiz)
6. **Clique:** "Deploy site"

### Opção B: Deploy Manual (Drag & Drop)

1. **Acesse:** [netlify.com](https://netlify.com)
2. **Arraste** a pasta `miro-deliverables-app` para a área de deploy
3. **Aguarde** o upload completar

### 2.1 Configurar Domínio Personalizado (Opcional)
1. **No Netlify Dashboard:** Site settings > Domain management
2. **Add custom domain:** `miro-app.seudominio.com`
3. **Configure DNS** conforme instruções

## 🎯 Passo 3: Configurar App no Miro

### 3.1 Obter URL do Deploy
Após o deploy no Netlify, você receberá uma URL como:
```
https://amazing-app-123456.netlify.app
```

### 3.2 Criar/Atualizar App no Miro
1. **Acesse:** [developers.miro.com](https://developers.miro.com)
2. **Clique:** "Create new app" (ou edite existente)
3. **Configure:**

```json
{
  "App name": "Project Deliverables Dashboard",
  "App URL": "https://SEU-DEPLOY.netlify.app/index.html",
  "Permissions": [
    "boards:read",
    "boards:write"
  ],
  "Redirect URLs": [
    "https://SEU-DEPLOY.netlify.app/auth/callback"
  ]
}
```

### 3.3 Instalar App no Team
1. **No Miro Developer Console:** Install app
2. **Selecione:** Seu team
3. **Autorize** as permissões

## ✅ Passo 4: Testar App em Produção

### 4.1 Verificar Deploy
```bash
# Testar se está online
curl -I https://SEU-DEPLOY.netlify.app/index.html
# Deve retornar: HTTP/2 200
```

### 4.2 Testar no Miro
1. **Abra qualquer board** no Miro
2. **Clique no ícone de apps** (sidebar esquerda)
3. **Encontre:** "Project Deliverables Dashboard"
4. **Clique para abrir** o sidebar
5. **Teste:** Criar um novo entregável

### 4.3 Verificar Funcionalidades
- [ ] **Dashboard carrega** sem erros
- [ ] **Botão "+ Add"** abre modal
- [ ] **Formulário salva** no Supabase
- [ ] **Sticky notes** são criados no board
- [ ] **Workload alerts** funcionam
- [ ] **Dados persistem** entre sessões

## 🔧 Troubleshooting

### Problema: App não carrega no Miro
**Soluções:**
1. Verificar se URL está acessível via HTTPS
2. Confirmar que manifest.json está correto
3. Verificar console do navegador para erros CORS

### Problema: Erro de CORS
**Soluções:**
1. Adicionar headers no Netlify:
   ```toml
   # _headers file na raiz
   /*
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: GET, POST, OPTIONS
     Access-Control-Allow-Headers: Content-Type, Authorization
   ```

### Problema: Supabase não conecta
**Soluções:**
1. Verificar se credenciais estão corretas no config.js
2. Testar conexão na página de teste: `/test.html`
3. Verificar CORS no Supabase Dashboard

## 📊 Monitoramento

### Netlify Analytics
- **Acesse:** Site dashboard > Analytics
- **Monitore:** Pageviews, unique visitors, bandwidth

### Logs de Deploy
- **Acesse:** Site dashboard > Deploys
- **Verifique:** Build logs para erros

### Performance
- **Teste:** [PageSpeed Insights](https://pagespeed.web.dev/)
- **URL:** Sua URL do Netlify

## 🔄 Atualizações Futuras

### Deploy Automático
Após configurar GitHub + Netlify:
```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push origin main
# Deploy automático será executado
```

### Rollback se Necessário
1. **No Netlify:** Site dashboard > Deploys
2. **Clique:** "Publish deploy" na versão anterior

---

## 📋 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub
- [ ] Deploy realizado no Netlify
- [ ] URL de produção obtida
- [ ] App configurado no Miro Developer Console
- [ ] App instalado no team
- [ ] Testes realizados em board real
- [ ] Funcionalidades verificadas

**🎉 App online e funcionando!**