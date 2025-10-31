// Miro Deliverables Dashboard - Main App Logic
class DeliverablesDashboard {
    constructor() {
        this.boardId = null;
        this.deliverables = [];
        this.collaborators = [];
        this.config = window.AppConfig;
        this.supabase = this.config.getSupabaseClient();
        this.projectIntegration = null;
        this.currentProject = null;
        this.ceoDashboard = null;
        this.miroSDK = null;
        this.isOnline = navigator.onLine;
        this.syncStatus = 'synced';
    }

    async init() {
        try {
            // Initialize enhanced Miro SDK Manager
            if (window.MiroSDKManager) {
                this.miroSDK = new MiroSDKManager();
                await this.miroSDK.initialize();
                
                // Wait for Miro to be ready, then initialize our app
                await miro.board.ui.on('ready', this.onBoardReady.bind(this));
            } else {
                // Fallback to basic Miro SDK
                await miro.board.ui.on('ready', this.onBoardReady.bind(this));
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup online/offline detection
            this.setupNetworkListeners();
            
            console.log('Deliverables Dashboard initialized with enhanced Miro SDK');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to initialize app');
        }
    }

    async onBoardReady() {
        try {
            // Get board information from enhanced SDK or fallback
            if (this.miroSDK && this.miroSDK.isReady()) {
                this.boardId = this.miroSDK.getBoardId();
                console.log('Board ready via enhanced SDK:', this.boardId);
            } else {
                const boardInfo = await miro.board.getInfo();
                this.boardId = boardInfo.id;
                console.log('Board ready via basic SDK:', this.boardId);
            }
            
            // Initialize project integration service
            if (this.supabase) {
                this.projectIntegration = new ProjectIntegrationService(this.supabase);
                
                // Find or create project for this board
                this.currentProject = await this.projectIntegration.findProjectByBoardId(this.boardId);
                if (!this.currentProject) {
                    const boardInfo = await miro.board.getInfo();
                    this.currentProject = await this.projectIntegration.createProjectForBoard(
                        this.boardId, 
                        boardInfo.title || boardInfo.name
                    );
                }
                
                console.log('Current project:', this.currentProject);
            }
            
            // Load initial data
            await this.loadData();
            
            // Initialize CEO Dashboard
            if (window.CEODashboard) {
                this.ceoDashboard = new CEODashboard();
                await this.ceoDashboard.init(this.supabase, this.boardId);
            }
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            // Auto-organize deliverables if we have the enhanced SDK
            if (this.miroSDK && this.deliverables.length > 0) {
                setTimeout(() => {
                    this.miroSDK.organizeDeliverables(this.deliverables);
                }, 2000);
            }
            
        } catch (error) {
            console.error('Board ready error:', error);
            this.showError('Failed to connect to board');
        }
    }

    setupEventListeners() {
        // Add deliverable button
        const addButton = document.getElementById('add-deliverable');
        if (addButton) {
            addButton.addEventListener('click', this.openAddModal.bind(this));
        }

        // Deliverable card clicks (will be added dynamically)
        document.addEventListener('click', (event) => {
            if (event.target.closest('.deliverable-card')) {
                const card = event.target.closest('.deliverable-card');
                const deliverableId = card.dataset.id;
                this.highlightBoardElements(deliverableId);
            }
        });
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateSyncStatus('synced');
            this.syncPendingChanges();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus('offline');
        });
    }

    async loadData() {
        try {
            this.updateSyncStatus('syncing');
            
            // Load deliverables and collaborators
            await Promise.all([
                this.loadDeliverables(),
                this.loadCollaborators()
            ]);
            
            // Render the dashboard
            this.renderDashboard();
            
            // Check for workload alerts
            this.checkWorkloadAlerts();
            
            this.updateSyncStatus('synced');
            
        } catch (error) {
            console.error('Failed to load data:', error);
            this.updateSyncStatus('error');
            this.showError('Failed to load data');
        }
    }

    async loadDeliverables() {
        try {
            if (!this.supabase) {
                console.warn('Supabase not configured, using mock data');
                this.deliverables = this.getMockDeliverables();
                return;
            }

            // Carregar entregáveis do Supabase
            const { data, error } = await this.supabase
                .from('deliverables')
                .select(`
                    *,
                    project:projects(name),
                    owner:users(name, email),
                    deliverable_revisions(*)
                `)
                .eq('board_id', this.boardId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                this.deliverables = this.getMockDeliverables();
                return;
            }

            this.deliverables = data || [];
            console.log('Loaded deliverables:', this.deliverables);
            
        } catch (error) {
            console.error('Failed to load deliverables:', error);
            // Fallback para dados mock em caso de erro
            this.deliverables = this.getMockDeliverables();
        }
    }

    async loadCollaborators() {
        try {
            if (!this.supabase) {
                console.warn('Supabase not configured, using mock data');
                this.collaborators = this.getMockCollaborators();
                this.calculateWorkloads();
                return;
            }

            // Carregar workload do board do Supabase
            const { data, error } = await this.supabase
                .from('board_workload')
                .select('*')
                .eq('board_id', this.boardId);

            if (error) {
                console.error('Supabase error loading workload:', error);
                this.collaborators = this.getMockCollaborators();
                this.calculateWorkloads();
                return;
            }

            // Converter para formato esperado
            this.collaborators = (data || []).map(item => ({
                id: item.user_id,
                name: item.user_name,
                workloadCount: item.workload_count,
                isOverloaded: item.is_overloaded,
                lastCalculated: item.last_calculated
            }));

            // Se não há dados de workload, recalcular
            if (this.collaborators.length === 0) {
                await this.recalculateWorkload();
            }
            
        } catch (error) {
            console.error('Failed to load collaborators:', error);
            this.collaborators = this.getMockCollaborators();
            this.calculateWorkloads();
        }
    }

    calculateWorkloads() {
        // Reset workload counts
        this.collaborators.forEach(collaborator => {
            collaborator.workloadCount = 0;
            collaborator.isOverloaded = false;
        });

        // Count active deliverables per collaborator
        this.deliverables.forEach(deliverable => {
            if (deliverable.status !== 'complete' && deliverable.owner) {
                const collaborator = this.collaborators.find(c => c.name === deliverable.owner);
                if (collaborator) {
                    collaborator.workloadCount++;
                    collaborator.isOverloaded = collaborator.workloadCount > 5;
                }
            }
        });
    }

    renderDashboard() {
        this.renderDeliverables();
        this.renderCollaborators();
    }

    renderDeliverables() {
        const container = document.getElementById('deliverables-list');
        if (!container) return;

        if (this.deliverables.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    No deliverables yet. Click "Add" to create your first one!
                </div>
            `;
            return;
        }

        container.innerHTML = this.deliverables.map(deliverable => `
            <div class="deliverable-card" data-id="${deliverable.id}">
                <div class="deliverable-header">
                    <div>
                        <div class="deliverable-title">${deliverable.title}</div>
                        ${deliverable.description ? `<div class="deliverable-description">${deliverable.description}</div>` : ''}
                    </div>
                    <span class="deliverable-status status-${deliverable.status}">
                        ${this.getStatusLabel(deliverable.status)}
                    </span>
                </div>
                <div class="deliverable-meta">
                    <span class="deliverable-owner">👤 ${deliverable.owner || 'Unassigned'}</span>
                    <span class="deliverable-due ${this.isOverdue(deliverable.dueDate) ? 'due-overdue' : ''}">
                        ${deliverable.dueDate ? `📅 ${this.formatDate(deliverable.dueDate)}` : ''}
                    </span>
                </div>
            </div>
        `).join('');
    }

    renderCollaborators() {
        const container = document.getElementById('collaborators-list');
        if (!container) return;

        container.innerHTML = this.collaborators.map(collaborator => `
            <div class="collaborator-item">
                <span class="collaborator-name">${collaborator.name}</span>
                <div class="workload-indicator">
                    <span class="workload-count ${collaborator.isOverloaded ? 'workload-overloaded' : ''}">
                        ${collaborator.workloadCount} tasks
                    </span>
                    ${collaborator.isOverloaded ? '⚠️' : ''}
                </div>
            </div>
        `).join('');
    }

    checkWorkloadAlerts() {
        const overloadedMembers = this.collaborators.filter(c => c.isOverloaded);
        const alertElement = document.getElementById('workload-alert');
        const messageElement = document.getElementById('alert-message');

        if (overloadedMembers.length > 0 && alertElement && messageElement) {
            const names = overloadedMembers.map(m => m.name).join(', ');
            messageElement.textContent = `⚠️ Workload Alert: ${names} may be overloaded (>5 tasks)`;
            alertElement.style.display = 'block';
        } else if (alertElement) {
            alertElement.style.display = 'none';
        }
    }

    async openAddModal() {
        try {
            await miro.board.ui.openModal({
                url: 'modal.html',
                width: 500,
                height: 600
            });
        } catch (error) {
            console.error('Failed to open modal:', error);
            this.showError('Failed to open form');
        }
    }

    async highlightBoardElements(deliverableId) {
        try {
            const deliverable = this.deliverables.find(d => d.id === deliverableId);
            if (!deliverable) return;

            // Use enhanced SDK if available
            if (this.miroSDK) {
                await this.miroSDK.showNotification(`Viewing: ${deliverable.title}`, 'info');
            }

            // Highlight related elements on the board
            if (deliverable.miro_item_ids && deliverable.miro_item_ids.length > 0) {
                await miro.board.viewport.zoomTo(deliverable.miro_item_ids);
            } else {
                // Create sticky note if it doesn't exist
                await this.createStickyNoteForDeliverable(deliverable);
            }
            
        } catch (error) {
            console.error('Failed to highlight elements:', error);
        }
    }

    async createStickyNoteForDeliverable(deliverable) {
        try {
            let stickyNote;
            
            if (this.miroSDK) {
                // Use enhanced SDK for better formatting
                stickyNote = await this.miroSDK.createDeliverableSticky(deliverable);
            } else {
                // Fallback to basic sticky note creation
                stickyNote = await miro.board.createStickyNote({
                    content: `📋 ${deliverable.title}\n\n${deliverable.description || ''}`,
                    style: {
                        fillColor: this.getStatusColor(deliverable.status),
                        textAlign: 'left'
                    },
                    x: Math.random() * 1000,
                    y: Math.random() * 1000
                });
            }

            // Update deliverable with Miro item ID
            if (this.supabase && stickyNote) {
                const { error } = await this.supabase
                    .from('deliverables')
                    .update({ 
                        miro_item_ids: [stickyNote.id],
                        miro_position: {
                            x: stickyNote.x,
                            y: stickyNote.y
                        }
                    })
                    .eq('id', deliverable.id);

                if (!error) {
                    // Update local data
                    deliverable.miro_item_ids = [stickyNote.id];
                    deliverable.miro_position = { x: stickyNote.x, y: stickyNote.y };
                }
            }

            return stickyNote;

        } catch (error) {
            console.error('Failed to create sticky note for deliverable:', error);
        }
    }

    getStatusColor(status) {
        const colors = {
            'in_progress': '#fff3cd',
            'complete': '#d4edda',
            'revision_needed': '#f8d7da',
            'blocked': '#e2e3e5'
        };
        return colors[status] || '#ffffff';
    }

    updateSyncStatus(status) {
        this.syncStatus = status;
        const indicator = document.getElementById('sync-indicator');
        const text = document.getElementById('sync-text');

        if (indicator && text) {
            indicator.className = `sync-indicator ${status}`;
            
            switch (status) {
                case 'synced':
                    text.textContent = 'Synced';
                    indicator.style.color = '#4caf50';
                    break;
                case 'syncing':
                    text.textContent = 'Syncing...';
                    indicator.style.color = '#ff9800';
                    break;
                case 'offline':
                    text.textContent = 'Offline';
                    indicator.style.color = '#757575';
                    break;
                case 'error':
                    text.textContent = 'Sync Error';
                    indicator.style.color = '#f44336';
                    break;
            }
        }
    }

    async syncPendingChanges() {
        // TODO: Implement sync queue for offline changes
        console.log('Syncing pending changes...');
    }

    async recalculateWorkload() {
        try {
            if (!this.supabase) return;

            // Chamar função do Supabase para recalcular workload
            const { error } = await this.supabase.rpc('calculate_board_workload', {
                board_id_param: this.boardId
            });

            if (error) {
                console.error('Error recalculating workload:', error);
                return;
            }

            // Recarregar dados de workload
            await this.loadCollaborators();
            
        } catch (error) {
            console.error('Failed to recalculate workload:', error);
        }
    }

    setupRealtimeSubscriptions() {
        if (!this.supabase) {
            console.log('Supabase not configured, skipping realtime subscriptions');
            return;
        }

        // Subscription para mudanças em deliverables
        const deliverablesSub = this.supabase
            .channel('deliverables-changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'deliverables',
                    filter: `board_id=eq.${this.boardId}`
                }, 
                (payload) => {
                    console.log('Deliverable changed:', payload);
                    this.handleDeliverableChange(payload);
                }
            )
            .subscribe();

        // Subscription para mudanças em workload
        const workloadSub = this.supabase
            .channel('workload-changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'board_workload',
                    filter: `board_id=eq.${this.boardId}`
                }, 
                (payload) => {
                    console.log('Workload changed:', payload);
                    this.handleWorkloadChange(payload);
                }
            )
            .subscribe();

        console.log('Realtime subscriptions setup complete');
    }

    handleDeliverableChange(payload) {
        // Recarregar dados quando há mudanças
        this.loadData();
    }

    handleWorkloadChange(payload) {
        // Atualizar apenas a seção de colaboradores
        this.loadCollaborators().then(() => {
            this.renderCollaborators();
            this.checkWorkloadAlerts();
        });
    }

    showError(message) {
        miro.board.notifications.showError(message);
    }

    // Utility methods
    getStatusLabel(status) {
        const labels = {
            'in_progress': '🔄 In Progress',
            'complete': '✅ Complete',
            'revision_needed': '🔄 Needs Revision',
            'blocked': '🚫 Blocked'
        };
        return labels[status] || status;
    }

    isOverdue(dueDate) {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Mock data for development
    getMockDeliverables() {
        return [
            {
                id: '1',
                title: 'Homepage Design Mockup',
                description: 'Create high-fidelity mockups for the new homepage',
                status: 'in_progress',
                owner: 'Alice Johnson',
                dueDate: '2024-11-15',
                miroItemIds: ['mock-item-1']
            },
            {
                id: '2',
                title: 'User Research Report',
                description: 'Compile findings from user interviews',
                status: 'revision_needed',
                owner: 'Bob Smith',
                dueDate: '2024-11-10',
                miroItemIds: ['mock-item-2']
            },
            {
                id: '3',
                title: 'Brand Guidelines Document',
                description: 'Finalize brand colors, typography, and logo usage',
                status: 'complete',
                owner: 'Carol Davis',
                dueDate: '2024-11-05',
                miroItemIds: ['mock-item-3']
            }
        ];
    }

    getMockCollaborators() {
        return [
            { id: '1', name: 'Alice Johnson', role: 'Designer', workloadCount: 0, isOverloaded: false },
            { id: '2', name: 'Bob Smith', role: 'Researcher', workloadCount: 0, isOverloaded: false },
            { id: '3', name: 'Carol Davis', role: 'Brand Manager', workloadCount: 0, isOverloaded: false }
        ];
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DeliverablesDashboard();
    dashboard.init();
});

// Make dashboard available globally for debugging
window.dashboard = dashboard;