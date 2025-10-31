// Enhanced Miro SDK with Access Token Integration
class EnhancedMiroSDK {
    constructor() {
        this.config = window.AppConfig;
        this.accessToken = this.config.get('miro.accessToken') || 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_5hKYp-osgPnAjsiBKbQfnE9Xn84';
        this.appId = this.config.get('miro.appId');
        this.region = this.config.get('miro.region') || 'eu01';
        this.boardId = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Check if we're in Miro environment
            if (typeof miro !== 'undefined') {
                // Try to get board info first
                try {
                    const boardInfo = await miro.board.getInfo();
                    this.boardId = boardInfo.id;
                    console.log('✅ Enhanced Miro SDK initialized with board:', this.boardId);
                } catch (boardError) {
                    console.warn('⚠️ Could not get board info:', boardError.message);
                    this.boardId = 'unknown';
                }
                
                // Try to set up icon click handler
                try {
                    // Note: icon:click might not be available in all contexts
                    if (miro.board.ui && miro.board.ui.on) {
                        await miro.board.ui.on('icon:click', this.handleIconClick.bind(this));
                    }
                } catch (uiError) {
                    console.warn('⚠️ Could not set up UI handlers:', uiError.message);
                }
                
                this.isInitialized = true;
            } else {
                console.warn('⚠️ Miro SDK not available - running in standalone mode');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Miro SDK:', error);
        }
    }
    
    // Enhanced Board Operations
    async getBoardInfo() {
        if (!this.isInitialized) return null;
        
        try {
            const info = await miro.board.getInfo();
            return {
                id: info.id,
                name: info.title,
                description: info.description,
                owner: info.owner,
                team: info.team,
                permissions: info.permissions,
                createdAt: info.createdAt,
                modifiedAt: info.modifiedAt
            };
        } catch (error) {
            console.error('Error getting board info:', error);
            return null;
        }
    }
    
    // Enhanced Item Creation with Templates
    async createDeliverableCard(deliverable) {
        if (!this.isInitialized) return null;
        
        try {
            // Create main card
            const card = await miro.board.createCard({
                title: deliverable.title,
                description: deliverable.description || '',
                x: deliverable.position?.x || Math.random() * 1000,
                y: deliverable.position?.y || Math.random() * 1000,
                width: 300,
                style: {
                    cardTheme: this.getCardTheme(deliverable.status),
                    fillColor: this.getStatusColor(deliverable.status)
                }
            });
            
            // Add status tag
            await this.addStatusTag(card, deliverable.status);
            
            // Add priority indicator
            if (deliverable.priority && deliverable.priority !== 'medium') {
                await this.addPriorityIndicator(card, deliverable.priority);
            }
            
            // Add due date if exists
            if (deliverable.due_date) {
                await this.addDueDateIndicator(card, deliverable.due_date);
            }
            
            return card;
        } catch (error) {
            console.error('Error creating deliverable card:', error);
            return null;
        }
    }
    
    // Enhanced Status Management
    async updateDeliverableStatus(itemId, newStatus) {
        if (!this.isInitialized) return false;
        
        try {
            const item = await miro.board.getById(itemId);
            if (!item) return false;
            
            // Update card color
            await item.sync({
                style: {
                    fillColor: this.getStatusColor(newStatus)
                }
            });
            
            // Update status tag
            await this.updateStatusTag(item, newStatus);
            
            // Add status change notification
            await this.addStatusChangeNotification(item, newStatus);
            
            return true;
        } catch (error) {
            console.error('Error updating deliverable status:', error);
            return false;
        }
    }
    
    // Advanced Reporting Features
    async generateExecutiveReport(data) {
        if (!this.isInitialized) return null;
        
        try {
            const reportContent = this.buildReportContent(data);
            
            // Create report sticky note
            const report = await miro.board.createStickyNote({
                content: reportContent,
                x: 100,
                y: 100,
                width: 400,
                style: {
                    fillColor: '#fff9c4', // Light yellow
                    textAlign: 'left',
                    textAlignVertical: 'top'
                }
            });
            
            // Add report title
            await miro.board.createText({
                content: '📊 Executive Report - ' + new Date().toLocaleDateString(),
                x: 100,
                y: 50,
                width: 400,
                style: {
                    color: '#1a1a1a',
                    fontSize: 18,
                    fontFamily: 'Arial',
                    textAlign: 'center'
                }
            });
            
            // Create visual charts
            await this.createProgressChart(data, 600, 100);
            await this.createTeamWorkloadChart(data, 600, 300);
            
            return report;
        } catch (error) {
            console.error('Error generating executive report:', error);
            return null;
        }
    }
    
    // Team Collaboration Features
    async addCollaboratorMention(itemId, collaboratorId, message) {
        if (!this.isInitialized) return false;
        
        try {
            const item = await miro.board.getById(itemId);
            if (!item) return false;
            
            // Add comment with mention
            await miro.board.createComment({
                targetId: itemId,
                content: `@${collaboratorId} ${message}`,
                x: item.x + 150,
                y: item.y + 100
            });
            
            return true;
        } catch (error) {
            console.error('Error adding collaborator mention:', error);
            return false;
        }
    }
    
    // Advanced Analytics
    async trackUserActivity(action, data = {}) {
        try {
            const activity = {
                boardId: this.boardId || 'unknown',
                action: action,
                data: data,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            console.log(`📊 Tracking activity: ${action}`);
            
            // Send to analytics service
            const success = await this.sendAnalytics(activity);
            
            if (!success) {
                console.log('📊 Analytics not sent (Supabase unavailable) - this is normal');
            }
            
            return success;
        } catch (error) {
            console.warn('Analytics tracking failed (non-critical):', error.message);
            return false;
        }
    }
    
    // Utility Methods
    getStatusColor(status) {
        const colors = {
            'in_progress': '#ffd966', // Yellow
            'complete': '#93c47d',    // Green
            'revision_needed': '#ff9900', // Orange
            'blocked': '#e06666',     // Red
            'pending': '#9fc5e8'      // Blue
        };
        return colors[status] || '#f1c232';
    }
    
    getCardTheme(status) {
        const themes = {
            'complete': 'green',
            'blocked': 'red',
            'revision_needed': 'orange',
            'in_progress': 'yellow',
            'pending': 'blue'
        };
        return themes[status] || 'yellow';
    }
    
    async addStatusTag(item, status) {
        const statusText = status.replace('_', ' ').toUpperCase();
        const color = this.getStatusColor(status);
        
        await miro.board.createShape({
            content: statusText,
            shape: 'round_rectangle',
            x: item.x + 120,
            y: item.y - 50,
            width: 80,
            height: 25,
            style: {
                fillColor: color,
                borderColor: color,
                borderWidth: 1,
                fontSize: 10,
                textAlign: 'center'
            }
        });
    }
    
    async addPriorityIndicator(item, priority) {
        const priorityColors = {
            'high': '#e06666',
            'low': '#93c47d'
        };
        
        const priorityText = priority.toUpperCase();
        const color = priorityColors[priority] || '#f1c232';
        
        await miro.board.createShape({
            content: `🔥 ${priorityText}`,
            shape: 'round_rectangle',
            x: item.x - 50,
            y: item.y - 50,
            width: 60,
            height: 25,
            style: {
                fillColor: color,
                borderColor: color,
                fontSize: 9,
                textAlign: 'center'
            }
        });
    }
    
    async addDueDateIndicator(item, dueDate) {
        const date = new Date(dueDate);
        const isOverdue = date < new Date();
        const dateText = date.toLocaleDateString();
        
        await miro.board.createText({
            content: `📅 ${dateText}${isOverdue ? ' ⚠️' : ''}`,
            x: item.x,
            y: item.y + 120,
            style: {
                color: isOverdue ? '#e06666' : '#666666',
                fontSize: 10,
                fontFamily: 'Arial'
            }
        });
    }
    
    buildReportContent(data) {
        const completionRate = Math.round((data.completed / data.total) * 100);
        const avgEfficiency = Math.round(data.teamEfficiency);
        
        return `📊 PROJECT EXECUTIVE SUMMARY
        
🎯 DELIVERABLES STATUS
• Total: ${data.total}
• Completed: ${data.completed} (${completionRate}%)
• In Progress: ${data.inProgress}
• Overdue: ${data.overdue}

👥 TEAM PERFORMANCE
• Average Efficiency: ${avgEfficiency}%
• Team Members: ${data.teamMembers}
• Overloaded Members: ${data.overloadedMembers}

⚡ KEY INSIGHTS
• Project completion rate: ${completionRate}%
• Team workload distribution: ${data.workloadDistribution}
• Recommended actions: ${data.recommendations}

📈 NEXT STEPS
${data.nextSteps || '• Review overdue items\n• Redistribute workload\n• Update project timeline'}

Generated: ${new Date().toLocaleString()}`;
    }
    
    async createProgressChart(data, x, y) {
        const total = data.total;
        const completed = data.completed;
        const width = 300;
        const height = 20;
        
        // Background bar
        await miro.board.createShape({
            content: '',
            shape: 'rectangle',
            x: x,
            y: y,
            width: width,
            height: height,
            style: {
                fillColor: '#f0f0f0',
                borderColor: '#cccccc'
            }
        });
        
        // Progress bar
        const progressWidth = (completed / total) * width;
        await miro.board.createShape({
            content: '',
            shape: 'rectangle',
            x: x - (width - progressWidth) / 2,
            y: y,
            width: progressWidth,
            height: height,
            style: {
                fillColor: '#93c47d',
                borderColor: '#93c47d'
            }
        });
        
        // Progress text
        await miro.board.createText({
            content: `Progress: ${completed}/${total} (${Math.round((completed/total)*100)}%)`,
            x: x,
            y: y - 30,
            style: {
                fontSize: 12,
                fontFamily: 'Arial',
                textAlign: 'center'
            }
        });
    }
    
    async createTeamWorkloadChart(data, x, y) {
        if (!data.teamMembers || data.teamMembers.length === 0) return;
        
        const barWidth = 40;
        const maxHeight = 100;
        const spacing = 60;
        
        for (let i = 0; i < data.teamMembers.length; i++) {
            const member = data.teamMembers[i];
            const barHeight = (member.workload / 10) * maxHeight; // Scale to max 10 tasks
            const barX = x + (i * spacing);
            const barY = y;
            
            // Workload bar
            await miro.board.createShape({
                content: '',
                shape: 'rectangle',
                x: barX,
                y: barY,
                width: barWidth,
                height: barHeight,
                style: {
                    fillColor: member.isOverloaded ? '#e06666' : '#93c47d',
                    borderColor: '#666666'
                }
            });
            
            // Member name
            await miro.board.createText({
                content: member.name,
                x: barX,
                y: barY + barHeight/2 + 30,
                style: {
                    fontSize: 10,
                    fontFamily: 'Arial',
                    textAlign: 'center'
                }
            });
            
            // Workload count
            await miro.board.createText({
                content: member.workload.toString(),
                x: barX,
                y: barY - barHeight/2 - 10,
                style: {
                    fontSize: 12,
                    fontFamily: 'Arial',
                    textAlign: 'center',
                    color: '#333333'
                }
            });
        }
        
        // Chart title
        await miro.board.createText({
            content: '👥 Team Workload Distribution',
            x: x + (data.teamMembers.length * spacing) / 2 - spacing/2,
            y: y - maxHeight/2 - 40,
            style: {
                fontSize: 14,
                fontFamily: 'Arial',
                textAlign: 'center',
                color: '#1a1a1a'
            }
        });
    }
    
    async sendAnalytics(activity) {
        // Send to Supabase analytics table
        const supabase = this.config.getSupabaseClient();
        if (!supabase) {
            console.log('📊 Analytics disabled - Supabase not available');
            return false;
        }
        
        try {
            const { data, error } = await supabase
                .from('analytics_events')
                .insert([{
                    board_id: activity.boardId,
                    event_type: activity.action,
                    event_data: activity.data,
                    created_at: activity.timestamp
                }]);
                
            if (error) {
                console.warn('Analytics insert error:', error.message);
                return false;
            }
            
            console.log('📊 Analytics sent successfully');
            return true;
        } catch (error) {
            console.warn('Analytics error (non-critical):', error.message);
            return false;
        }
    }
    
    handleIconClick() {
        console.log('🎯 Miro app icon clicked');
        this.trackUserActivity('app_opened');
    }
}

// Initialize Enhanced Miro SDK
window.EnhancedMiroSDK = new EnhancedMiroSDK();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedMiroSDK;
}