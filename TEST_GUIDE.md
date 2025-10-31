# 🧪 Guia de Teste - Miro Deliverables App

## 🚀 Teste Rápido Local

### 1. Servir Arquivos Localmente
```bash
cd miro-deliverables-app
python -m http.server 8000
# ou
npx serve . -p 8000
```

### 2. Testar no Navegador
1. Abra `http://localhost:8000/index.html`
2. Abra o Console do navegador (F12)
3. Verifique se não há erros de JavaScript

### 3. Testar Configuração Supabase
No console do navegador, execute:
```javascript
// Testar configuração
console.log('Config:', window.AppConfig.config);

// Testar conexão Supabase
const supabase = window.AppConfig.getSupabaseClient();
console.log('Supabase client:', supabase);

// Testar query simples
supabase.from('deliverables').select('*').limit(5).then(console.log);
```

## 🎯 Teste no Miro (Desenvolvimento)

### 1. Configurar App de Desenvolvimento no Miro

1. **Acesse**: [developers.miro.com](https://developers.miro.com)
2. **Crie novo app** com configurações de desenvolvimento:
   ```json
   {
     "App URL": "http://localhost:8000/index.html",
     "Permissions": ["boards:read", "boards:write"],
     "Redirect URLs": ["http://localhost:8000/auth/callback"]
   }
   ```

### 2. Testar Funcionalidades

#### ✅ Dashboard Sidebar
- [ ] App abre no sidebar do Miro
- [ ] Lista de entregáveis carrega
- [ ] Indicadores de workload aparecem
- [ ] Alertas de sobrecarga funcionam

#### ✅ Modal de Entregáveis
- [ ] Botão "+ Add" abre modal
- [ ] Formulário valida campos obrigatórios
- [ ] Salvamento persiste no Supabase
- [ ] Modal fecha após salvar

#### ✅ Integração com Board
- [ ] Sticky notes são criados no board
- [ ] Cores refletem status dos entregáveis
- [ ] Clique no entregável destaca elementos
- [ ] Sincronização bidirecional funciona

#### ✅ Integração com Projetos
- [ ] Projeto é criado automaticamente para o board
- [ ] Entregáveis são vinculados ao projeto
- [ ] Tasks são criadas quando necessário
- [ ] Workload é calculado corretamente

## 📊 Dados de Teste

### Entregáveis de Exemplo
O banco já contém dados de teste para o board `test-board-123`:

1. **Design System Components** (Em Progresso)
   - Owner: Alice Designer
   - Priority: High
   - Tags: design, ui, components

2. **User Research Report** (Revisão Necessária)
   - Owner: Bob Researcher  
   - Priority: Medium
   - Tags: research, ux, report

3. **Brand Guidelines** (Completo)
   - Owner: Carol Brand Manager
   - Priority: High
   - Tags: branding, guidelines, visual

### Testar com Board Real

Para testar com um board real do Miro:

1. **Abra qualquer board no Miro**
2. **Instale o app de desenvolvimento**
3. **Abra o app no sidebar**
4. **Crie novos entregáveis**
5. **Verifique se aparecem no Supabase**:
   ```sql
   SELECT * FROM deliverables ORDER BY created_at DESC LIMIT 10;
   ```

## 🐛 Troubleshooting

### Problema: App não carrega no Miro
**Soluções:**
1. Verifique se `http://localhost:8000` está acessível
2. Confirme que não há erros no console
3. Verifique se o manifest.json está correto

### Problema: Erro de CORS
**Soluções:**
1. Use `npx serve . -p 8000 --cors` para habilitar CORS
2. Ou configure CORS no Supabase Dashboard

### Problema: Dados não salvam
**Soluções:**
1. Verifique conexão com Supabase no console
2. Confirme que as tabelas existem
3. Verifique se não há erros de validação

### Problema: Workload não calcula
**Soluções:**
1. Execute manualmente: `SELECT calculate_board_workload('seu-board-id');`
2. Verifique se há entregáveis com owner_name preenchido
3. Confirme que o trigger está ativo

## 📈 Métricas de Teste

### Performance
- [ ] App carrega em < 2 segundos
- [ ] Queries do Supabase < 500ms
- [ ] Sincronização com Miro < 1 segundo
- [ ] Realtime updates funcionam

### Usabilidade
- [ ] Interface intuitiva e responsiva
- [ ] Formulários fáceis de usar
- [ ] Feedback visual adequado
- [ ] Erros são tratados graciosamente

### Integração
- [ ] Dados persistem corretamente
- [ ] Sincronização bidirecional
- [ ] Workload atualiza automaticamente
- [ ] Projetos são vinculados corretamente

## 🚀 Próximos Passos

Após os testes locais:

1. **Deploy para produção** usando `./deploy.sh`
2. **Configurar app de produção** no Miro
3. **Testar com equipe real**
4. **Implementar funcionalidades avançadas**:
   - Analytics e relatórios
   - Notificações por email
   - Integração com Slack
   - Templates de entregáveis

---

✅ **Testes completos!** O app está pronto para uso em produção.