// Miro Deliverables App - Project Integration Service
// Integra com a estrutura existente de projetos e tasks

class ProjectIntegrationService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    // Buscar projeto associado ao board do Miro
    async findProjectByBoardId(boardId) {
        try {
            const { data, error } = await this.supabase
                .from('projects')
                .select(`
                    *,
                    client:users!projects_clientId_fkey(name, email),
                    designer:users!projects_designerId_fkey(name, email)
                `)
                .eq('miroBoardId', boardId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Error finding project:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Failed to find project:', error);
            return null;
        }
    }

    // Criar projeto automaticamente se não existir
    async createProjectForBoard(boardId, boardName) {
        try {
            // Verificar se já existe
            const existingProject = await this.findProjectByBoardId(boardId);
            if (existingProject) return existingProject;

            // Buscar usuário atual (assumindo que há um contexto de usuário)
            const currentUser = await this.getCurrentUser();
            if (!currentUser) {
                console.warn('No current user found, cannot create project');
                return null;
            }

            const projectData = {
                name: boardName || `Miro Project ${boardId.slice(-8)}`,
                description: `Project automatically created from Miro board ${boardId}`,
                miroBoardId: boardId,
                designerId: currentUser.id,
                clientId: currentUser.id, // Temporário - pode ser atualizado depois
                status: 'IN_PROGRESS'
            };

            const { data, error } = await this.supabase
                .from('projects')
                .insert(projectData)
                .select()
                .single();

            if (error) {
                console.error('Error creating project:', error);
                return null;
            }

            console.log('Created project for board:', data);
            return data;

        } catch (error) {
            console.error('Failed to create project:', error);
            return null;
        }
    }

    // Buscar usuário atual (implementação básica)
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (error || !user) {
                // Se não há autenticação, buscar um usuário padrão ou criar um
                return await this.getOrCreateDefaultUser();
            }

            // Buscar dados completos do usuário
            const { data: userData, error: userError } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('Error fetching user data:', userError);
                return await this.getOrCreateDefaultUser();
            }

            return userData;

        } catch (error) {
            console.error('Failed to get current user:', error);
            return await this.getOrCreateDefaultUser();
        }
    }

    // Criar ou buscar usuário padrão para o Miro App
    async getOrCreateDefaultUser() {
        try {
            // Buscar usuário padrão
            const { data: existingUser, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', 'miro-app@default.com')
                .single();

            if (!error && existingUser) {
                return existingUser;
            }

            // Criar usuário padrão
            const defaultUserData = {
                email: 'miro-app@default.com',
                name: 'Miro App User',
                role: 'DESIGNER'
            };

            const { data: newUser, error: createError } = await this.supabase
                .from('users')
                .insert(defaultUserData)
                .select()
                .single();

            if (createError) {
                console.error('Error creating default user:', createError);
                return null;
            }

            return newUser;

        } catch (error) {
            console.error('Failed to get or create default user:', error);
            return null;
        }
    }

    // Sincronizar entregável com task existente
    async syncDeliverableWithTask(deliverable, projectId) {
        try {
            if (!projectId) return null;

            // Buscar task similar
            const { data: existingTasks, error } = await this.supabase
                .from('tasks')
                .select('*')
                .eq('projectId', projectId)
                .ilike('title', `%${deliverable.title}%`);

            if (error) {
                console.error('Error searching tasks:', error);
                return null;
            }

            // Se encontrou task similar, vincular
            if (existingTasks && existingTasks.length > 0) {
                const task = existingTasks[0];
                
                const { error: updateError } = await this.supabase
                    .from('deliverables')
                    .update({ 
                        task_id: task.id,
                        project_id: projectId 
                    })
                    .eq('id', deliverable.id);

                if (updateError) {
                    console.error('Error linking deliverable to task:', updateError);
                    return null;
                }

                return task;
            }

            // Criar nova task se não encontrou
            const taskData = {
                projectId: projectId,
                title: deliverable.title,
                description: deliverable.description,
                status: this.mapDeliverableStatusToTaskStatus(deliverable.status),
                priority: this.mapPriorityToTaskPriority(deliverable.priority),
                dueDate: deliverable.due_date,
                assigneeId: deliverable.owner_id
            };

            const { data: newTask, error: createError } = await this.supabase
                .from('tasks')
                .insert(taskData)
                .select()
                .single();

            if (createError) {
                console.error('Error creating task:', createError);
                return null;
            }

            // Vincular deliverable à nova task
            const { error: linkError } = await this.supabase
                .from('deliverables')
                .update({ 
                    task_id: newTask.id,
                    project_id: projectId 
                })
                .eq('id', deliverable.id);

            if (linkError) {
                console.error('Error linking deliverable to new task:', linkError);
            }

            return newTask;

        } catch (error) {
            console.error('Failed to sync deliverable with task:', error);
            return null;
        }
    }

    // Mapear status de deliverable para task
    mapDeliverableStatusToTaskStatus(deliverableStatus) {
        const statusMap = {
            'in_progress': 'IN_PROGRESS',
            'complete': 'DONE',
            'revision_needed': 'REVIEW',
            'blocked': 'TODO'
        };
        return statusMap[deliverableStatus] || 'TODO';
    }

    // Mapear prioridade de deliverable para task
    mapPriorityToTaskPriority(deliverablePriority) {
        const priorityMap = {
            'low': 'LOW',
            'medium': 'MEDIUM',
            'high': 'HIGH',
            'urgent': 'URGENT'
        };
        return priorityMap[deliverablePriority] || 'MEDIUM';
    }

    // Buscar membros da equipe do projeto
    async getProjectTeamMembers(projectId) {
        try {
            const { data: project, error } = await this.supabase
                .from('projects')
                .select(`
                    *,
                    client:users!projects_clientId_fkey(id, name, email),
                    designer:users!projects_designerId_fkey(id, name, email),
                    tasks(assigneeId, assignee:users(id, name, email))
                `)
                .eq('id', projectId)
                .single();

            if (error) {
                console.error('Error fetching project team:', error);
                return [];
            }

            // Coletar todos os membros únicos
            const members = new Map();
            
            // Adicionar cliente e designer
            if (project.client) {
                members.set(project.client.id, project.client);
            }
            if (project.designer) {
                members.set(project.designer.id, project.designer);
            }

            // Adicionar assignees das tasks
            if (project.tasks) {
                project.tasks.forEach(task => {
                    if (task.assignee) {
                        members.set(task.assignee.id, task.assignee);
                    }
                });
            }

            return Array.from(members.values());

        } catch (error) {
            console.error('Failed to get project team members:', error);
            return [];
        }
    }

    // Sincronizar usuários do Miro com o projeto
    async syncMiroUsersWithProject(boardId, miroUsers) {
        try {
            const project = await this.findProjectByBoardId(boardId);
            if (!project) return;

            // Para cada usuário do Miro, verificar se existe no sistema
            for (const miroUser of miroUsers) {
                await this.getOrCreateUserFromMiro(miroUser);
            }

        } catch (error) {
            console.error('Failed to sync Miro users:', error);
        }
    }

    // Criar ou buscar usuário baseado em dados do Miro
    async getOrCreateUserFromMiro(miroUser) {
        try {
            // Buscar por email se disponível
            if (miroUser.email) {
                const { data: existingUser, error } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('email', miroUser.email)
                    .single();

                if (!error && existingUser) {
                    return existingUser;
                }
            }

            // Criar novo usuário
            const userData = {
                email: miroUser.email || `${miroUser.id}@miro.user`,
                name: miroUser.name || `Miro User ${miroUser.id}`,
                role: 'DESIGNER' // Padrão para usuários do Miro
            };

            const { data: newUser, error: createError } = await this.supabase
                .from('users')
                .insert(userData)
                .select()
                .single();

            if (createError) {
                console.error('Error creating user from Miro:', createError);
                return null;
            }

            return newUser;

        } catch (error) {
            console.error('Failed to get or create user from Miro:', error);
            return null;
        }
    }
}

// Exportar para uso global
window.ProjectIntegrationService = ProjectIntegrationService;