// Miro Deliverables Dashboard - Modal Logic
class DeliverableModal {
    constructor() {
        this.currentDeliverable = null;
        this.isEditMode = false;
        this.selectedFiles = [];
        this.config = window.AppConfig;
        this.supabase = this.config.getSupabaseClient();
    }

    async init() {
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Check if we're editing an existing deliverable
            await this.checkEditMode();
            
            console.log('Modal initialized');
        } catch (error) {
            console.error('Failed to initialize modal:', error);
            this.showError('Failed to initialize form');
        }
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('deliverable-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.handleCancel.bind(this));
        }

        // File upload
        const fileUpload = document.getElementById('file-upload');
        if (fileUpload) {
            fileUpload.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // Auto-resize textarea
        const description = document.getElementById('description');
        if (description) {
            description.addEventListener('input', this.autoResizeTextarea.bind(this));
        }
    }

    async checkEditMode() {
        // TODO: Check if we're editing an existing deliverable
        // This would come from URL parameters or Miro app data
        const urlParams = new URLSearchParams(window.location.search);
        const deliverableId = urlParams.get('id');
        
        if (deliverableId) {
            this.isEditMode = true;
            await this.loadDeliverable(deliverableId);
            this.populateForm();
            
            const title = document.getElementById('modal-title');
            if (title) {
                title.textContent = 'Edit Deliverable';
            }
        }
    }

    async loadDeliverable(id) {
        try {
            // TODO: Load deliverable from Supabase
            // For now, use mock data
            this.currentDeliverable = {
                id: id,
                title: 'Sample Deliverable',
                description: 'This is a sample deliverable for editing',
                status: 'in_progress',
                owner: 'John Doe',
                dueDate: '2024-11-20',
                priority: 'medium',
                tags: 'design, mockup'
            };
            
        } catch (error) {
            console.error('Failed to load deliverable:', error);
            throw error;
        }
    }

    populateForm() {
        if (!this.currentDeliverable) return;

        const fields = ['title', 'description', 'status', 'owner', 'priority', 'tags'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && this.currentDeliverable[field]) {
                element.value = this.currentDeliverable[field];
            }
        });

        // Handle due date separately (format for date input)
        const dueDateElement = document.getElementById('due-date');
        if (dueDateElement && this.currentDeliverable.dueDate) {
            dueDateElement.value = this.currentDeliverable.dueDate;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        try {
            this.showLoading(true);
            
            // Get form data
            const formData = this.getFormData();
            
            // Validate required fields
            if (!this.validateForm(formData)) {
                this.showLoading(false);
                return;
            }
            
            // Save deliverable
            const deliverable = await this.saveDeliverable(formData);
            
            // Sync with Miro board
            await this.syncWithBoard(deliverable);
            
            // Close modal
            await this.closeModal();
            
        } catch (error) {
            console.error('Failed to save deliverable:', error);
            this.showError('Failed to save deliverable');
            this.showLoading(false);
        }
    }

    getFormData() {
        const form = document.getElementById('deliverable-form');
        const formData = new FormData(form);
        
        return {
            id: this.currentDeliverable?.id || null,
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            owner: formData.get('owner'),
            dueDate: formData.get('dueDate'),
            priority: formData.get('priority'),
            tags: formData.get('tags'),
            files: this.selectedFiles
        };
    }

    validateForm(data) {
        // Check required fields
        if (!data.title?.trim()) {
            this.showError('Title is required');
            return false;
        }

        // Validate due date if provided
        if (data.dueDate) {
            const dueDate = new Date(data.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                this.showError('Due date cannot be in the past');
                return false;
            }
        }

        return true;
    }

    async saveDeliverable(data) {
        try {
            if (!this.supabase) {
                console.warn('Supabase not configured, simulating save');
                await this.simulateApiCall();
                return {
                    ...data,
                    id: data.id || this.generateId(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }

            // Obter board ID do Miro
            const boardInfo = await miro.board.getInfo();
            const boardId = boardInfo.id;

            // Preparar dados para o Supabase
            const deliverableData = {
                board_id: boardId,
                title: data.title,
                description: data.description,
                status: data.status,
                owner_name: data.owner,
                due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
                priority: data.priority,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : []
            };

            let result;
            if (this.isEditMode && data.id) {
                // Atualizar entregável existente
                const { data: updated, error } = await this.supabase
                    .from('deliverables')
                    .update(deliverableData)
                    .eq('id', data.id)
                    .select()
                    .single();

                if (error) throw error;
                result = updated;
            } else {
                // Criar novo entregável
                const { data: created, error } = await this.supabase
                    .from('deliverables')
                    .insert(deliverableData)
                    .select()
                    .single();

                if (error) throw error;
                result = created;
            }

            console.log('Saved deliverable to Supabase:', result);
            return result;
            
        } catch (error) {
            console.error('Failed to save deliverable:', error);
            throw error;
        }
    }

    async syncWithBoard(deliverable) {
        try {
            // Create or update sticky note on the board
            const stickyNote = await this.createStickyNote(deliverable);
            
            // Update deliverable with Miro item ID no Supabase
            if (this.supabase && deliverable.id) {
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

                if (error) {
                    console.error('Failed to update Miro item ID:', error);
                }
            }
            
            console.log('Synced with board:', stickyNote);
            
        } catch (error) {
            console.error('Failed to sync with board:', error);
            // Don't throw error - deliverable is saved, sync can be retried
        }
    }

    async createStickyNote(deliverable) {
        try {
            const stickyNote = await miro.board.createStickyNote({
                content: `${deliverable.title}\n\n${deliverable.description || ''}`,
                style: {
                    fillColor: this.getStatusColor(deliverable.status),
                    textAlign: 'left'
                },
                x: Math.random() * 1000, // Random position for demo
                y: Math.random() * 1000
            });
            
            return stickyNote;
            
        } catch (error) {
            console.error('Failed to create sticky note:', error);
            throw error;
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.selectedFiles = files;
        this.renderFileList();
    }

    renderFileList() {
        const container = document.getElementById('file-list');
        if (!container) return;

        if (this.selectedFiles.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.selectedFiles.map((file, index) => `
            <div class="file-item">
                <span>${file.name} (${this.formatFileSize(file.size)})</span>
                <span class="file-remove" onclick="modal.removeFile(${index})">×</span>
            </div>
        `).join('');
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.renderFileList();
        
        // Update file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    autoResizeTextarea(event) {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    async handleCancel() {
        await this.closeModal();
    }

    async closeModal() {
        try {
            await miro.board.ui.closeModal();
        } catch (error) {
            console.error('Failed to close modal:', error);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        // Show error notification
        if (typeof miro !== 'undefined') {
            miro.board.notifications.showError(message);
        } else {
            alert(message); // Fallback for development
        }
    }

    // Utility methods
    getStatusColor(status) {
        const colors = {
            'in_progress': '#e3f2fd',
            'complete': '#e8f5e8',
            'revision_needed': '#fff3e0',
            'blocked': '#ffebee'
        };
        return colors[status] || '#f5f5f5';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateId() {
        return 'del_' + Math.random().toString(36).substr(2, 9);
    }

    async simulateApiCall() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Initialize the modal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.modal = new DeliverableModal();
    modal.init();
});