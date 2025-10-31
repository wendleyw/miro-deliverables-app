# 🚀 Miro Deliverables App - Installation Guide

Este guia mostra como instalar e configurar o app desde o hosting até a integração com o Miro.

## 📋 Pré-requisitos

- Conta no Miro (Team plan ou superior para apps customizados)
- Conta no Supabase (para backend)
- Servidor web para hosting (Netlify, Vercel, ou servidor próprio)
- Conhecimentos básicos de HTML/JavaScript

## 🏗️ Estrutura do Projeto

```
miro-deliverables-app/
├── manifest.json          # Configuração do app Miro
├── index.html            # Dashboard principal (sidebar)
├── modal.html            # Modal para adicionar/editar
├── app.js               # Lógica principal do dashboard
├── modal.js             # Lógica do modal
├── styles.css           # Estilos do app
└── INSTALLATION.md      # Este guia
```

## 🔧 Passo 1: Usar Backend Existente (Supabase via MCP)

### 1.1 Verificar Configuração MCP

Este projeto usa o Supabase já configurado via MCP (Model Context Protocol). Verifique se você tem:

1. **MCP Supabase configurado** em `~/.kiro/settings/mcp.json`
2. **Projeto Supabase ativo**: `https://xcdnjsufldwmdfchrstx.supabase.co`
3. **Tabelas existentes**: projects, users, tasks, etc.

### 1.2 Adicionar Tabelas do Miro App

As tabelas específicas para o Miro App já foram criadas automaticamente:
- `deliverables` - Entregáveis principais
- `deliverable_assets` - Arquivos anexados
- `deliverable_revisions` - Comentários e feedback  
- `board_workload` - Métricas de carga de trabalho

### 1.3 Schema Adicional (Já Aplicado)

Se precisar recriar as tabelas manualmente, execute no SQL Editor:

```sql
-- Tipos enumerados
CREATE TYPE deliverable_status AS ENUM ('in_progress', 'complete', 'revision_needed', 'blocked');
CREATE TYPE revision_status AS ENUM ('pending', 'approved', 'rejected');

-- Entregáveis principais
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status deliverable_status DEFAULT 'in_progress',
    owner_id VARCHAR(255),
    owner_name VARCHAR(255),
    due_date TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium',
    tags TEXT[],
    miro_item_ids TEXT[],
    position JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets e arquivos
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
    board_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by VARCHAR(255),
    miro_attachment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Revisões e feedback
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255),
    reviewer_name VARCHAR(255),
    comment TEXT NOT NULL,
    status revision_status DEFAULT 'pending',
    miro_comment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Colaboradores e carga de trabalho
CREATE TABLE collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(100),
    workload_count INTEGER DEFAULT 0,
    is_overloaded BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_deliverables_board_id ON deliverables(board_id);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_collaborators_board_id ON collaborators(board_id);
```

### 1.3 Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir acesso público por enquanto)
CREATE POLICY "Allow all operations" ON deliverables FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON assets FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON revisions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON collaborators FOR ALL USING (true);
```

### 1.4 Credenciais (Já Configuradas)

As credenciais do Supabase já estão configuradas no app:
- **URL**: `https://xcdnjsufldwmdfchrstx.supabase.co`
- **Anon Key**: Já incluída no `config.js`

✅ **Backend pronto para uso!**

## 🌐 Passo 2: Fazer Deploy do App

### Opção A: Netlify (Recomendado)

1. **Preparar arquivos:**
   ```bash
   # Criar pasta do projeto
   mkdir miro-deliverables-app
   cd miro-deliverables-app
   
   # Copiar todos os arquivos (manifest.json, index.html, etc.)
   ```

2. **Configurações já prontas:**
   
   ✅ As configurações do Supabase já estão no `config.js`
   ✅ Integração com projetos existentes configurada
   ✅ Dados de exemplo já inseridos no banco

3. **Deploy no Netlify:**
   - Acesse [netlify.com](https://netlify.com)
   - Arraste a pasta do projeto para o deploy
   - Anote a URL gerada: `https://[random-name].netlify.app`

### Opção B: Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd miro-deliverables-app
   vercel --prod
   ```

### Opção C: Servidor Próprio

1. **Upload via FTP/SSH:**
   - Faça upload de todos os arquivos para seu servidor
   - Certifique-se que está acessível via HTTPS
   - Anote a URL: `https://seudominio.com/miro-app/`

## 🎯 Passo 3: Registrar App no Miro

### 3.1 Criar App no Miro Developer Console

1. Acesse [developers.miro.com](https://developers.miro.com)
2. Faça login com sua conta Miro
3. Clique em **"Create new app"**
4. Preencha:
   - **App name**: `Project Deliverables Dashboard`
   - **Description**: `Manage project deliverables and team workload`
   - **Developer team**: Selecione seu team

### 3.2 Configurar App Settings

1. **App URL**: Cole a URL do seu deploy
   ```
   https://[seu-deploy].netlify.app/index.html
   ```

2. **Permissions**: Selecione:
   - ✅ `boards:read`
   - ✅ `boards:write`

3. **Redirect URLs**: Adicione:
   ```
   https://[seu-deploy].netlify.app/auth/callback
   ```

4. **Clique em "Save"**

### 3.3 Atualizar manifest.json

Edite o arquivo `manifest.json` com as informações do seu app:

```json
{
  "name": "Project Deliverables Dashboard",
  "appId": "SEU-APP-ID-AQUI",
  "sdkVersion": "2.0",
  "permissions": [
    "boards:read",
    "boards:write"
  ],
  "startApp": {
    "url": "index.html",
    "height": 600,
    "width": 350
  },
  "scopes": [
    "boards:read",
    "boards:write"
  ],
  "redirectUris": [
    "https://[seu-deploy].netlify.app/auth/callback"
  ]
}
```

### 3.4 Fazer Redeploy

Após atualizar o manifest.json, faça um novo deploy com as configurações atualizadas.

## 🔌 Passo 4: Instalar no Miro

### 4.1 Instalar via Developer Console

1. No Miro Developer Console, vá para seu app
2. Clique em **"Install app"**
3. Selecione o team onde quer instalar
4. Autorize as permissões

### 4.2 Usar o App

1. **Abrir um board no Miro**
2. **Encontrar o app:**
   - Clique no ícone de apps (lado esquerdo)
   - Procure por "Project Deliverables Dashboard"
   - Clique para abrir

3. **Testar funcionalidades:**
   - O sidebar deve aparecer à direita
   - Clique em "+ Add" para abrir o modal
   - Teste criar um entregável

## 🔧 Passo 5: Configurações Avançadas

### 5.1 Configurar Webhooks (Opcional)

Para sincronização em tempo real:

1. **No Supabase, criar Edge Function:**
   ```bash
   supabase functions new miro-webhook
   ```

2. **Configurar webhook no Miro:**
   - URL: `https://[seu-projeto].supabase.co/functions/v1/miro-webhook`
   - Events: `board.item.created`, `board.item.updated`

### 5.2 Configurar Autenticação (Opcional)

Para apps em produção, configure autenticação adequada no Supabase.

## 🐛 Troubleshooting

### Problema: App não carrega no Miro

**Soluções:**
1. Verifique se a URL está acessível via HTTPS
2. Confirme que o manifest.json está correto
3. Verifique o console do navegador para erros

### Problema: Erro de CORS

**Soluções:**
1. Configure CORS no Supabase:
   - Settings > API > CORS
   - Adicione sua URL do Miro app

### Problema: Permissões negadas

**Soluções:**
1. Verifique se as permissões estão corretas no manifest.json
2. Reinstale o app no Miro
3. Confirme que o usuário tem permissões no board

## 📚 Próximos Passos

1. **Personalizar o design** editando `styles.css`
2. **Adicionar mais funcionalidades** em `app.js` e `modal.js`
3. **Configurar analytics** implementando as tabelas de métricas
4. **Adicionar notificações** via email ou Slack
5. **Implementar relatórios** para clientes e CEO

## 🆘 Suporte

- **Documentação Miro SDK**: [developers.miro.com/docs](https://developers.miro.com/docs)
- **Documentação Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Issues**: Crie uma issue no repositório do projeto

---

✅ **Instalação completa!** Seu Miro App está pronto para uso.