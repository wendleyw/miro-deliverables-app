# 📋 Miro Deliverables Dashboard

Um app nativo do Miro para gerenciar entregáveis de projeto, carga de trabalho da equipe e colaboração em tempo real.

![Miro App Preview](https://via.placeholder.com/800x400/4262ff/ffffff?text=Miro+Deliverables+Dashboard)

## ✨ Funcionalidades

### 🎯 Core Features
- **Dashboard Lateral**: Visualize todos os entregáveis diretamente no Miro
- **Modal Interativo**: Adicione e edite entregáveis com formulário completo
- **Gestão de Status**: Acompanhe progresso (Em Andamento, Completo, Revisão, Bloqueado)
- **Atribuição de Responsáveis**: Designe tarefas para membros da equipe
- **Alertas de Sobrecarga**: Detecção automática quando alguém tem >5 tarefas

### 🔄 Integração com Miro
- **Sincronização Bidirecional**: Entregáveis ↔ Sticky Notes
- **Destaque de Elementos**: Clique no entregável para destacar no board
- **Organização Automática**: Criação de frames e organização visual
- **Cores por Status**: Elementos coloridos baseados no status

### 📊 Analytics & Reports
- **Métricas de Produtividade**: Acompanhe performance da equipe
- **Relatórios para Clientes**: Geração automática de reports executivos
- **Dashboard CEO**: Visão executiva de todos os projetos
- **Time Tracking**: Controle de horas por entregável

## 🚀 Instalação Rápida

### 1. Clone e Configure
```bash
# Clone os arquivos do app
git clone [repo-url] miro-deliverables-app
cd miro-deliverables-app

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais
```

### 2. Setup Supabase
1. Crie projeto no [Supabase](https://supabase.com)
2. Execute o SQL schema (veja INSTALLATION.md)
3. Copie URL e API Key para `.env`

### 3. Deploy
```bash
# Opção A: Netlify
# Arraste a pasta para netlify.com

# Opção B: Vercel
npx vercel --prod

# Opção C: Seu servidor
# Upload via FTP/SSH
```

### 4. Registrar no Miro
1. Acesse [developers.miro.com](https://developers.miro.com)
2. Crie novo app
3. Configure URL do deploy
4. Instale no seu team

📖 **[Guia Completo de Instalação](INSTALLATION.md)**

## 🎮 Como Usar

### Abrir o App
1. Entre em qualquer board do Miro
2. Clique no ícone de apps (lateral esquerda)
3. Selecione "Project Deliverables Dashboard"
4. O sidebar aparecerá à direita

### Gerenciar Entregáveis
- **➕ Adicionar**: Clique "+ Add" para criar novo entregável
- **✏️ Editar**: Clique em qualquer card para editar
- **🎯 Destacar**: Clique para destacar elementos relacionados no board
- **📊 Monitorar**: Veja carga de trabalho da equipe em tempo real

### Fluxo de Trabalho
1. **Criar entregável** com título, descrição, responsável e prazo
2. **Atualizar status** conforme progresso
3. **Anexar arquivos** e adicionar comentários
4. **Monitorar alertas** de sobrecarga da equipe
5. **Gerar relatórios** para clientes e stakeholders

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Miro Board    │    │  Miro App SDK   │    │   Supabase      │
│                 │◄──►│                 │◄──►│                 │
│ • Sticky Notes  │    │ • Sidebar       │    │ • Database      │
│ • Frames        │    │ • Modal         │    │ • Realtime      │
│ • Comments      │    │ • Sync Logic    │    │ • Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tecnologias
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Miro SDK**: v2.0 (Web SDK)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Realtime**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage para arquivos
- **Deploy**: Netlify, Vercel, ou servidor próprio

## 📁 Estrutura de Arquivos

```
miro-deliverables-app/
├── 📄 manifest.json          # Configuração do app Miro
├── 🏠 index.html            # Dashboard principal (sidebar)
├── 📝 modal.html            # Modal para formulários
├── ⚙️ app.js               # Lógica principal do dashboard
├── 🔧 modal.js             # Lógica do modal
├── 🎨 styles.css           # Estilos do app
├── ⚙️ config.js            # Configurações centralizadas
├── 📖 README.md            # Este arquivo
├── 📋 INSTALLATION.md      # Guia de instalação completo
└── 🔐 .env.example         # Exemplo de variáveis de ambiente
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-aqui

# Miro
MIRO_APP_ID=seu-app-id
MIRO_CLIENT_ID=seu-client-id

# App
APP_URL=https://seu-deploy.netlify.app
ENVIRONMENT=production
```

### Personalização
- **Cores e Tema**: Edite `styles.css`
- **Funcionalidades**: Modifique `config.js`
- **Lógica de Negócio**: Customize `app.js` e `modal.js`

## 📊 Database Schema

### Tabelas Principais
- **`deliverables`**: Entregáveis com status, responsável, prazos
- **`assets`**: Arquivos anexados aos entregáveis
- **`revisions`**: Comentários e feedback
- **`collaborators`**: Membros da equipe e carga de trabalho
- **`project_metrics`**: Métricas para analytics e relatórios

### Relacionamentos
```sql
deliverables (1) ──► (N) assets
deliverables (1) ──► (N) revisions
collaborators (1) ──► (N) deliverables
```

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado no Supabase
- **Validação de entrada** em todos os formulários
- **Sanitização de dados** antes de salvar
- **Políticas de acesso** baseadas em board_id
- **HTTPS obrigatório** para produção

## 🚀 Performance

- **Lazy Loading** para grandes datasets
- **Cache local** para dados frequentes
- **Debounce** em operações de busca
- **Otimização de queries** com índices
- **Compressão** de assets estáticos

## 🧪 Desenvolvimento

### Setup Local
```bash
# Servir arquivos localmente
python -m http.server 8000
# ou
npx serve .

# Acessar em http://localhost:8000
```

### Debug
- Abra DevTools no Miro
- Console logs disponíveis em `window.dashboard`
- Teste com dados mock incluídos

### Testes
```bash
# Validar manifest.json
npx @miro/create-app validate

# Testar integração Supabase
# (implementar testes unitários)
```

## 📈 Roadmap

### v1.1 (Próxima Release)
- [ ] Notificações por email
- [ ] Integração com Slack
- [ ] Templates de entregáveis
- [ ] Bulk operations

### v1.2 (Futuro)
- [ ] Mobile app companion
- [ ] Advanced analytics
- [ ] Custom workflows
- [ ] API pública

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **📖 Documentação**: [INSTALLATION.md](INSTALLATION.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/seu-repo/issues)
- **💬 Discussões**: [GitHub Discussions](https://github.com/seu-repo/discussions)
- **📧 Email**: suporte@seudominio.com

## 🙏 Agradecimentos

- [Miro Developer Platform](https://developers.miro.com)
- [Supabase](https://supabase.com)
- Comunidade open source

---

**Feito com ❤️ para melhorar a colaboração em projetos**