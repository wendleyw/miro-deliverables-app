// Miro SDK v2 Improved Implementation
// Based on latest Miro SDK v2 documentation and best practices

class MiroSDKManager {
    constructor() {
        this.isInitialized = false;
        this.boardInfo = null;
        this.currentUser = null;
        this.boardMembers = [];
    }

    async initialize() {
        try {
            // Wait for Miro SDK to be ready
            await miro.board.ui.on('ready', async () => {
                console.log('Miro SDK v2 ready');
                await this.loadBoardContext();
                this.isInitialized = true;
            });

            // Setup event listeners for board changes
            this.setupBoardEventListeners();
            
        } catch (error) {
            console.error('Failed to initialize Miro SDK:', error);
            throw error;
        }
    }

    async loadBoardContext() {
        try {
            // Get board information
            this.boardInfo = await miro.board.getInfo();
            
            // Get current user
            this.currentUser = await miro.board.getUserInfo();
            
            // Get board members
            this.boardMembers = await miro.board.getMembers();
            
            console.log('Board context loaded:', {
                boardId: this.boardInfo.id,
                boardName: this.boardInfo.title,
                userId: this.currentUser.id,
                memberCount: this.boardMembers.length
            });
            
        } catch (error) {
            console.error('Failed to load board context:', error);
        }
    }

    setupBoardEventListeners() {
        // Listen for item creation
        miro.board.ui.on('items:create', (event) => {
            console.log('Items created:', event.items);
            this.handleItemsCreated(event.items);
        });

        // Listen for item updates
        miro.board.ui.on('items:update', (event) => {
            console.log('Items updated:', event.items);
            this.handleItemsUpdated(event.items);
        });

        // Listen for item deletion
        miro.board.ui.on('items:delete', (event) => {
            console.log('Items deleted:', event.itemIds);
            this.handleItemsDeleted(event.itemIds);
        });

        // Listen for selection changes
        miro.board.ui.on('selection:update', (event) => {
            console.log('Selection changed:', event.items);
            this.handleSelectionChanged(event.items);
        });
    }

    async handleItemsCreated(items) {
        // Handle new items created on the board
        for (const item of items) {
            if (item.type === 'sticky_note') {
                await this.processNewStickyNote(item);
            }
        }
    }

    async handleItemsUpdated(items) {
        // Handle items updated on the board
        for (const item of items) {
            if (item.type === 'sticky_note') {
                await this.processStickyNoteUpdate(item);
            }
        }
    }

    async handleItemsDeleted(itemIds) {
        // Handle items deleted from the board
        console.log('Processing deleted items:', itemIds);
        // Update database to reflect deletions
    }

    async handleSelectionChanged(items) {
        // Handle selection changes
        if (items.length > 0) {
            console.log('Selected items:', items);
            // Could highlight related deliverables in sidebar
        }
    }

    async processNewStickyNote(stickyNote) {
        // Check if this sticky note should be converted to a deliverable
        const content = stickyNote.content;
        
        // Look for deliverable keywords or patterns
        if (this.isDeliverableCandidate(content)) {
            await this.suggestDeliverableCreation(stickyNote);
        }
    }

    async processStickyNoteUpdate(stickyNote) {
        // Check if this sticky note is linked to a deliverable
        const linkedDeliverable = await this.findLinkedDeliverable(stickyNote.id);
        
        if (linkedDeliverable) {
            await this.syncDeliverableFromStickyNote(stickyNote, linkedDeliverable);
        }
    }

    isDeliverableCandidate(content) {
        const keywords = ['deliverable', 'task', 'todo', 'deadline', 'due', 'complete', 'finish'];
        const lowerContent = content.toLowerCase();
        
        return keywords.some(keyword => lowerContent.includes(keyword));
    }

    async suggestDeliverableCreation(stickyNote) {
        // Show a notification suggesting to create a deliverable
        const result = await miro.board.ui.showNotification({
            message: 'Convert this sticky note to a deliverable?',
            type: 'info',
            actions: [
                {
                    text: 'Yes',
                    callback: () => this.createDeliverableFromStickyNote(stickyNote)
                },
                {
                    text: 'No',
                    callback: () => console.log('User declined deliverable creation')
                }
            ]
        });
    }

    async createDeliverableFromStickyNote(stickyNote) {
        try {
            // Extract deliverable data from sticky note
            const deliverableData = {
                title: this.extractTitle(stickyNote.content),
                description: stickyNote.content,
                status: 'in_progress',
                miro_item_ids: [stickyNote.id],
                miro_position: {
                    x: stickyNote.x,
                    y: stickyNote.y
                },
                board_id: this.boardInfo.id,
                owner_name: this.currentUser.name
            };

            // Save to database via the main app
            if (window.dashboard && window.dashboard.supabase) {
                const { data, error } = await window.dashboard.supabase
                    .from('deliverables')
                    .insert(deliverableData)
                    .select()
                    .single();

                if (error) throw error;

                // Update sticky note to show it's linked
                await this.markStickyNoteAsLinked(stickyNote, data.id);
                
                // Refresh dashboard
                if (window.dashboard.loadData) {
                    await window.dashboard.loadData();
                }

                miro.board.ui.showNotification({
                    message: 'Deliverable created successfully!',
                    type: 'success'
                });
            }

        } catch (error) {
            console.error('Failed to create deliverable from sticky note:', error);
            miro.board.ui.showNotification({
                message: 'Failed to create deliverable',
                type: 'error'
            });
        }
    }

    async markStickyNoteAsLinked(stickyNote, deliverableId) {
        try {
            // Add a visual indicator that this sticky note is linked to a deliverable
            const updatedContent = `🔗 ${stickyNote.content}\n\n[Linked to Deliverable #${deliverableId.slice(-8)}]`;
            
            await miro.board.updateItem({
                id: stickyNote.id,
                content: updatedContent,
                style: {
                    ...stickyNote.style,
                    fillColor: '#e3f2fd' // Light blue to indicate it's linked
                }
            });

        } catch (error) {
            console.error('Failed to mark sticky note as linked:', error);
        }
    }

    extractTitle(content) {
        // Extract a title from the sticky note content
        const lines = content.split('\n');
        const firstLine = lines[0].trim();
        
        // Remove common prefixes and clean up
        const title = firstLine
            .replace(/^(todo|task|deliverable):\s*/i, '')
            .replace(/^[-•*]\s*/, '')
            .trim();
            
        return title.length > 0 ? title : 'Untitled Deliverable';
    }

    async findLinkedDeliverable(miroItemId) {
        try {
            if (!window.dashboard || !window.dashboard.supabase) return null;

            const { data, error } = await window.dashboard.supabase
                .from('deliverables')
                .select('*')
                .contains('miro_item_ids', [miroItemId])
                .single();

            return error ? null : data;

        } catch (error) {
            console.error('Failed to find linked deliverable:', error);
            return null;
        }
    }

    async syncDeliverableFromStickyNote(stickyNote, deliverable) {
        try {
            // Update deliverable based on sticky note changes
            const updatedData = {
                description: stickyNote.content,
                miro_position: {
                    x: stickyNote.x,
                    y: stickyNote.y
                },
                updated_at: new Date().toISOString()
            };

            if (window.dashboard && window.dashboard.supabase) {
                const { error } = await window.dashboard.supabase
                    .from('deliverables')
                    .update(updatedData)
                    .eq('id', deliverable.id);

                if (error) throw error;

                console.log('Deliverable synced from sticky note update');
            }

        } catch (error) {
            console.error('Failed to sync deliverable from sticky note:', error);
        }
    }

    // Enhanced sticky note creation with better styling
    async createDeliverableSticky(deliverable) {
        try {
            const stickyNote = await miro.board.createStickyNote({
                content: this.formatDeliverableContent(deliverable),
                style: {
                    fillColor: this.getStatusColor(deliverable.status),
                    textAlign: 'left',
                    textAlignVertical: 'top'
                },
                x: deliverable.miro_position?.x || Math.random() * 1000,
                y: deliverable.miro_position?.y || Math.random() * 1000,
                width: 200,
                height: 150
            });

            return stickyNote;

        } catch (error) {
            console.error('Failed to create deliverable sticky note:', error);
            throw error;
        }
    }

    formatDeliverableContent(deliverable) {
        let content = `📋 ${deliverable.title}\n\n`;
        
        if (deliverable.description) {
            content += `${deliverable.description}\n\n`;
        }
        
        content += `Status: ${this.getStatusEmoji(deliverable.status)} ${deliverable.status}\n`;
        
        if (deliverable.owner_name) {
            content += `Owner: 👤 ${deliverable.owner_name}\n`;
        }
        
        if (deliverable.due_date) {
            const dueDate = new Date(deliverable.due_date);
            content += `Due: 📅 ${dueDate.toLocaleDateString()}\n`;
        }
        
        if (deliverable.priority) {
            content += `Priority: ${this.getPriorityEmoji(deliverable.priority)} ${deliverable.priority}`;
        }

        return content;
    }

    getStatusColor(status) {
        const colors = {
            'in_progress': '#fff3cd',    // Yellow
            'complete': '#d4edda',       // Green
            'revision_needed': '#f8d7da', // Red
            'blocked': '#e2e3e5'         // Gray
        };
        return colors[status] || '#ffffff';
    }

    getStatusEmoji(status) {
        const emojis = {
            'in_progress': '🔄',
            'complete': '✅',
            'revision_needed': '🔄',
            'blocked': '🚫'
        };
        return emojis[status] || '📋';
    }

    getPriorityEmoji(priority) {
        const emojis = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🔴',
            'urgent': '🚨'
        };
        return emojis[priority] || '⚪';
    }

    // Enhanced board organization
    async organizeDeliverables(deliverables) {
        try {
            // Group deliverables by status
            const statusGroups = this.groupByStatus(deliverables);
            
            // Create frames for each status
            const frames = await this.createStatusFrames(statusGroups);
            
            // Position deliverable sticky notes within frames
            await this.positionDeliverablesInFrames(deliverables, frames);
            
            // Zoom to fit all content
            await miro.board.viewport.zoomTo(Object.values(frames).map(f => f.id));

        } catch (error) {
            console.error('Failed to organize deliverables:', error);
        }
    }

    groupByStatus(deliverables) {
        return deliverables.reduce((groups, deliverable) => {
            const status = deliverable.status || 'in_progress';
            if (!groups[status]) groups[status] = [];
            groups[status].push(deliverable);
            return groups;
        }, {});
    }

    async createStatusFrames(statusGroups) {
        const frames = {};
        const frameWidth = 300;
        const frameHeight = 400;
        const frameSpacing = 50;
        
        let xOffset = 0;
        
        for (const [status, deliverables] of Object.entries(statusGroups)) {
            if (deliverables.length === 0) continue;
            
            const frame = await miro.board.createFrame({
                title: this.getStatusTitle(status),
                style: {
                    fillColor: this.getStatusColor(status)
                },
                x: xOffset,
                y: 0,
                width: frameWidth,
                height: frameHeight
            });
            
            frames[status] = frame;
            xOffset += frameWidth + frameSpacing;
        }
        
        return frames;
    }

    getStatusTitle(status) {
        const titles = {
            'in_progress': '🔄 In Progress',
            'complete': '✅ Completed',
            'revision_needed': '🔄 Needs Revision',
            'blocked': '🚫 Blocked'
        };
        return titles[status] || status;
    }

    async positionDeliverablesInFrames(deliverables, frames) {
        const itemSpacing = 20;
        const itemsPerRow = 1;
        
        for (const deliverable of deliverables) {
            const status = deliverable.status || 'in_progress';
            const frame = frames[status];
            
            if (!frame || !deliverable.miro_item_ids?.length) continue;
            
            // Calculate position within frame
            const statusDeliverables = deliverables.filter(d => d.status === status);
            const index = statusDeliverables.indexOf(deliverable);
            
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            
            const x = frame.x + 50 + (col * 220);
            const y = frame.y + 80 + (row * (150 + itemSpacing));
            
            // Update sticky note position
            for (const itemId of deliverable.miro_item_ids) {
                try {
                    await miro.board.updateItem({
                        id: itemId,
                        x: x,
                        y: y
                    });
                } catch (error) {
                    console.error(`Failed to position item ${itemId}:`, error);
                }
            }
        }
    }

    // Utility methods
    async showNotification(message, type = 'info') {
        return await miro.board.ui.showNotification({
            message,
            type
        });
    }

    async confirmAction(message) {
        return new Promise((resolve) => {
            miro.board.ui.showNotification({
                message,
                type: 'info',
                actions: [
                    {
                        text: 'Yes',
                        callback: () => resolve(true)
                    },
                    {
                        text: 'No',
                        callback: () => resolve(false)
                    }
                ]
            });
        });
    }

    getBoardId() {
        return this.boardInfo?.id;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getBoardMembers() {
        return this.boardMembers;
    }

    isReady() {
        return this.isInitialized;
    }
}

// Export for global use
window.MiroSDKManager = MiroSDKManager;