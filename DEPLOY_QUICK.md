# ⚡ Deploy Rápido - 3 Passos

## 🚀 Passo 1: GitHub (2 min)

### Criar Repositório
1. **Vá para:** [github.com/new](https://github.com/new)
2. **Nome:** `miro-deliverables-app`
3. **Clique:** "Create repository"

### Push do Código
```bash
# Execute no terminal:
./deploy-to-github.sh SEU-USERNAME-GITHUB
```

## 🌐 Passo 2: Netlify Deploy (1 min)

### Deploy Automático
1. **Vá para:** [netlify.com](https://netlify.com)
2. **Clique:** "New site from Git"
3. **Conecte:** GitHub
4. **Selecione:** `miro-deliverables-app`
5. **Deploy!**

**URL gerada:** `https://amazing-name-123456.netlify.app`

## 🎯 Passo 3: Miro App (2 min)

### Configurar App
1. **Vá para:** [developers.miro.com](https://developers.miro.com)
2. **Create new app** ou edite existente
3. **App URL:** `https://SUA-URL.netlify.app/index.html`
4. **Permissions:** `boards:read`, `boards:write`
5. **Install app** no seu team

## ✅ Testar

1. **Abra qualquer board** no Miro
2. **Apps panel** → "Project Deliverables Dashboard"
3. **Clique "+ Add"** → Criar entregável
4. **Verificar** se salva no Supabase

---

**🎉 PRONTO! App online em 5 minutos!**

### 🔗 URLs Importantes:
- **Teste:** `https://SUA-URL.netlify.app/test.html`
- **App:** `https://SUA-URL.netlify.app/index.html`
- **Docs:** `https://SUA-URL.netlify.app/README.md`