// Miro Deliverables App - CEO Dashboard
class CEODashboard {
    constructor() {
        this.dashboardData = {
            totalDeliverables: 0,
            completedDeliverables: 0,
            inProgressDeliverables: 0,
            overdueDeliverables: 0,
            teamPerformance: [],
            recentActivity: []
        };
        this.supabase = null;
        this.boardId = null;
    }

    async init(supabaseClient, boardId) {
        this.supabase = supabaseClient;
        this.boardId = boardId;
        
        this.setupEventListeners();
        await this.loadDashboardData();
        this.renderDashboard();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    setupEventListeners() {
        // Generate Report button
        const generateReportBtn = document.getElementById('generate-report-btn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', this.generateReport.bind(this));
        }

        // Export Data button
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', this.exportData.bind(this));
        }
    }

    async loadDashboardData() {
        try {
            if (!this.supabase || !this.boardId) {
                this.loadMockData();
                return;
            }

            // Load deliverables data
            const { data: deliverables, error } = await this.supabase
                .from('deliverables')
                .select(`
                    *,
                    owner:users(name, email)
                `)
                .eq('board_id', this.boardId);

            if (error) {
                console.error('Error loading deliverables:', error);
                this.loadMockData();
                return;
            }

            // Calculate statistics
            this.calculateStatistics(deliverables || []);
            
            // Load team performance
            await this.loadTeamPerformance();
            
            // Load recent activity
            await this.loadRecentActivity();
            
            // Update dashboard
            this.renderDashboard();

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.loadMockData();
        }
    }

    calculateStatistics(deliverables) {
        const now = new Date();
        
        this.dashboardData.totalDeliverables = deliverables.length;
        this.dashboardData.completedDeliverables = deliverables.filter(d => d.status === 'complete').length;
        this.dashboardData.inProgressDeliverables = deliverables.filter(d => d.status === 'in_progress').length;
        
        // Calculate overdue deliverables
        this.dashboardData.overdueDeliverables = deliverables.filter(d => {
            return d.due_date && new Date(d.due_date) < now && d.status !== 'complete';
        }).length;
    }

    async loadTeamPerformance() {
        try {
            if (!this.supabase) return;

            const { data: workloadData, error } = await this.supabase
                .from('board_workload')
                .select('*')
                .eq('board_id', this.boardId);

            if (error) {
                console.error('Error loading team performance:', error);
                return;
            }

            // Calculate efficiency and performance metrics
            this.dashboardData.teamPerformance = (workloadData || []).map(member => {
                const efficiency = this.calculateEfficiency(member.workload_count);
                return {
                    name: member.user_name,
                    workloadCount: member.workload_count,
                    efficiency: efficiency,
                    isOverloaded: member.is_overloaded,
                    status: member.is_overloaded ? 'overloaded' : 'normal'
                };
            });

        } catch (error) {
            console.error('Failed to load team performance:', error);
        }
    }

    calculateEfficiency(workloadCount) {
        // Simple efficiency calculation based on workload
        if (workloadCount === 0) return 100;
        if (workloadCount <= 3) return 95;
        if (workloadCount <= 5) return 85;
        if (workloadCount <= 7) return 70;
        return 50; // Overloaded
    }

    async loadRecentActivity() {
        try {
            if (!this.supabase) return;

            // Get recent deliverables updates
            const { data: recentDeliverables, error } = await this.supabase
                .from('deliverables')
                .select('*')
                .eq('board_id', this.boardId)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error loading recent activity:', error);
                return;
            }

            this.dashboardData.recentActivity = (recentDeliverables || []).map(deliverable => {
                const timeAgo = this.getTimeAgo(new Date(deliverable.updated_at));
                return {
                    type: 'deliverable_update',
                    icon: this.getStatusIcon(deliverable.status),
                    text: `${deliverable.title} updated to ${deliverable.status}`,
                    time: timeAgo,
                    status: deliverable.status
                };
            });

        } catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    }

    renderDashboard() {
        this.renderStatistics();
        this.renderProgress();
        this.renderTeamPerformance();
        this.renderRecentActivity();
    }

    renderStatistics() {
        const elements = {
            'total-deliverables': this.dashboardData.totalDeliverables,
            'completed-deliverables': this.dashboardData.completedDeliverables,
            'in-progress-deliverables': this.dashboardData.inProgressDeliverables,
            'overdue-deliverables': this.dashboardData.overdueDeliverables
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    renderProgress() {
        const total = this.dashboardData.totalDeliverables;
        const completed = this.dashboardData.completedDeliverables;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        if (progressPercentage) {
            progressPercentage.textContent = `${percentage}%`;
        }
    }

    renderTeamPerformance() {
        const container = document.getElementById('team-performance-list');
        if (!container) return;

        if (this.dashboardData.teamPerformance.length === 0) {
            container.innerHTML = '<div class="no-data">No team data available</div>';
            return;
        }

        container.innerHTML = this.dashboardData.teamPerformance.map(member => `
            <div class="team-member">
                <div class="member-name">
                    <span class="status-indicator ${member.isOverloaded ? 'status-overdue' : 'status-completed'}"></span>
                    ${member.name}
                </div>
                <div class="member-stats">
                    <span>${member.workloadCount} tasks</span>
                    <span class="member-efficiency">${member.efficiency}%</span>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        if (this.dashboardData.recentActivity.length === 0) {
            container.innerHTML = '<div class="no-data">No recent activity</div>';
            return;
        }

        container.innerHTML = this.dashboardData.recentActivity.map(activity => `
            <div class="activity-item">
                <span class="activity-icon">${activity.icon}</span>
                <span class="activity-text">${activity.text}</span>
                <span class="activity-time">${activity.time}</span>
            </div>
        `).join('');
    }

    async generateReport() {
        try {
            const reportData = {
                timestamp: new Date().toISOString(),
                boardId: this.boardId,
                summary: {
                    totalDeliverables: this.dashboardData.totalDeliverables,
                    completedDeliverables: this.dashboardData.completedDeliverables,
                    completionRate: this.dashboardData.totalDeliverables > 0 
                        ? Math.round((this.dashboardData.completedDeliverables / this.dashboardData.totalDeliverables) * 100) 
                        : 0,
                    overdueDeliverables: this.dashboardData.overdueDeliverables,
                    teamSize: this.dashboardData.teamPerformance.length,
                    averageEfficiency: this.calculateAverageEfficiency()
                },
                teamPerformance: this.dashboardData.teamPerformance,
                recentActivity: this.dashboardData.recentActivity
            };

            // Create a report sticky note on the Miro board
            await this.createReportStickyNote(reportData);

            // Show success message
            if (typeof miro !== 'undefined') {
                miro.board.notifications.showInfo('📋 CEO Report generated and added to board!');
            }

        } catch (error) {
            console.error('Failed to generate report:', error);
            if (typeof miro !== 'undefined') {
                miro.board.notifications.showError('Failed to generate report');
            }
        }
    }

    async createReportStickyNote(reportData) {
        if (typeof miro === 'undefined') return;

        const content = `📊 CEO DASHBOARD REPORT
Generated: ${new Date().toLocaleDateString()}

📈 PROJECT SUMMARY
• Total Deliverables: ${reportData.summary.totalDeliverables}
• Completed: ${reportData.summary.completedDeliverables} (${reportData.summary.completionRate}%)
• In Progress: ${this.dashboardData.inProgressDeliverables}
• Overdue: ${reportData.summary.overdueDeliverables}

👥 TEAM PERFORMANCE
• Team Size: ${reportData.summary.teamSize}
• Average Efficiency: ${reportData.summary.averageEfficiency}%
• Overloaded Members: ${this.dashboardData.teamPerformance.filter(m => m.isOverloaded).length}

🎯 RECOMMENDATIONS
${this.generateRecommendations()}`;

        try {
            await miro.board.createStickyNote({
                content: content,
                style: {
                    fillColor: '#fff3cd',
                    textAlign: 'left'
                },
                x: Math.random() * 1000,
                y: Math.random() * 1000
            });
        } catch (error) {
            console.error('Failed to create report sticky note:', error);
        }
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.dashboardData.overdueDeliverables > 0) {
            recommendations.push('• Address overdue deliverables immediately');
        }
        
        const overloadedMembers = this.dashboardData.teamPerformance.filter(m => m.isOverloaded).length;
        if (overloadedMembers > 0) {
            recommendations.push('• Redistribute workload for overloaded team members');
        }
        
        const completionRate = this.dashboardData.totalDeliverables > 0 
            ? (this.dashboardData.completedDeliverables / this.dashboardData.totalDeliverables) * 100 
            : 0;
        
        if (completionRate < 50) {
            recommendations.push('• Review project timeline and resource allocation');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('• Project is on track, maintain current pace');
        }
        
        return recommendations.join('\n');
    }

    calculateAverageEfficiency() {
        if (this.dashboardData.teamPerformance.length === 0) return 0;
        
        const totalEfficiency = this.dashboardData.teamPerformance.reduce((sum, member) => sum + member.efficiency, 0);
        return Math.round(totalEfficiency / this.dashboardData.teamPerformance.length);
    }

    async exportData() {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                boardId: this.boardId,
                dashboardData: this.dashboardData
            };

            // Create downloadable JSON
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = `ceo-dashboard-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);

            if (typeof miro !== 'undefined') {
                miro.board.notifications.showInfo('📤 Dashboard data exported successfully!');
            }

        } catch (error) {
            console.error('Failed to export data:', error);
            if (typeof miro !== 'undefined') {
                miro.board.notifications.showError('Failed to export data');
            }
        }
    }

    // Utility methods
    getStatusIcon(status) {
        const icons = {
            'complete': '✅',
            'in_progress': '🔄',
            'revision_needed': '🔄',
            'blocked': '🚫'
        };
        return icons[status] || '📋';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    loadMockData() {
        // Mock data for development/testing
        this.dashboardData = {
            totalDeliverables: 12,
            completedDeliverables: 8,
            inProgressDeliverables: 3,
            overdueDeliverables: 1,
            teamPerformance: [
                { name: 'Alice Johnson', workloadCount: 4, efficiency: 92, isOverloaded: false },
                { name: 'Bob Smith', workloadCount: 6, efficiency: 78, isOverloaded: true },
                { name: 'Carol Davis', workloadCount: 2, efficiency: 95, isOverloaded: false }
            ],
            recentActivity: [
                { type: 'deliverable_update', icon: '✅', text: 'Brand Guidelines completed', time: '2h ago', status: 'complete' },
                { type: 'deliverable_update', icon: '🔄', text: 'User Research Report needs revision', time: '4h ago', status: 'revision_needed' },
                { type: 'deliverable_update', icon: '🔄', text: 'Homepage Design in progress', time: '1d ago', status: 'in_progress' }
            ]
        };
        
        this.renderDashboard();
    }
}

// Export for global use
window.CEODashboard = CEODashboard;