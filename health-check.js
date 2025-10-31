// Health Check Script for Miro Deliverables App
class HealthCheck {
    constructor() {
        this.checks = [];
        this.init();
    }
    
    init() {
        console.log('🏥 Starting Health Check...');
        this.runAllChecks();
    }
    
    async runAllChecks() {
        // Check 1: Miro SDK
        this.checkMiroSDK();
        
        // Check 2: Supabase
        this.checkSupabase();
        
        // Check 3: App Config
        this.checkAppConfig();
        
        // Check 4: Enhanced SDK
        this.checkEnhancedSDK();
        
        // Check 5: CEO Dashboard
        this.checkCEODashboard();
        
        // Summary
        this.showSummary();
    }
    
    checkMiroSDK() {
        const check = {
            name: 'Miro SDK',
            status: 'unknown',
            message: '',
            critical: true
        };
        
        if (typeof miro !== 'undefined') {
            check.status = 'ok';
            check.message = 'Miro SDK loaded successfully';
        } else {
            check.status = 'error';
            check.message = 'Miro SDK not loaded - App will not work in Miro';
        }
        
        this.checks.push(check);
        this.logCheck(check);
    }
    
    checkSupabase() {
        const check = {
            name: 'Supabase JS',
            status: 'unknown',
            message: '',
            critical: false
        };
        
        const hasSupabase = (
            (window.supabase && window.supabase.createClient) ||
            (typeof window.createClient === 'function') ||
            (window.Supabase && window.Supabase.createClient)
        );
        
        if (hasSupabase) {
            check.status = 'ok';
            check.message = 'Supabase JS loaded successfully';
        } else {
            check.status = 'warning';
            check.message = 'Supabase JS not loaded - Analytics disabled, using mock data';
        }
        
        this.checks.push(check);
        this.logCheck(check);
    }
    
    checkAppConfig() {
        const check = {
            name: 'App Configuration',
            status: 'unknown',
            message: '',
            critical: true
        };
        
        if (typeof window.AppConfig !== 'undefined') {
            const config = window.AppConfig;
            const miroAppId = config.get('miro.appId');
            const supabaseUrl = config.get('supabase.url');
            
            if (miroAppId && miroAppId !== 'YOUR_MIRO_APP_ID') {
                check.status = 'ok';
                check.message = `Configuration loaded - App ID: ${miroAppId}`;
            } else {
                check.status = 'warning';
                check.message = 'Miro App ID not configured properly';
            }
        } else {
            check.status = 'error';
            check.message = 'App configuration not loaded';
        }
        
        this.checks.push(check);
        this.logCheck(check);
    }
    
    checkEnhancedSDK() {
        const check = {
            name: 'Enhanced Miro SDK',
            status: 'unknown',
            message: '',
            critical: false
        };
        
        if (typeof window.EnhancedMiroSDK !== 'undefined') {
            check.status = 'ok';
            check.message = 'Enhanced Miro SDK loaded successfully';
        } else {
            check.status = 'warning';
            check.message = 'Enhanced Miro SDK not loaded - Advanced features disabled';
        }
        
        this.checks.push(check);
        this.logCheck(check);
    }
    
    checkCEODashboard() {
        const check = {
            name: 'CEO Dashboard',
            status: 'unknown',
            message: '',
            critical: false
        };
        
        if (typeof window.CEODashboard !== 'undefined') {
            check.status = 'ok';
            check.message = 'CEO Dashboard loaded successfully';
        } else {
            check.status = 'warning';
            check.message = 'CEO Dashboard not loaded';
        }
        
        this.checks.push(check);
        this.logCheck(check);
    }
    
    logCheck(check) {
        const icon = this.getStatusIcon(check.status);
        const style = this.getStatusStyle(check.status);
        
        console.log(`%c${icon} ${check.name}: ${check.message}`, style);
    }
    
    getStatusIcon(status) {
        switch (status) {
            case 'ok': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return '❓';
        }
    }
    
    getStatusStyle(status) {
        switch (status) {
            case 'ok': return 'color: #28a745; font-weight: bold;';
            case 'warning': return 'color: #ffc107; font-weight: bold;';
            case 'error': return 'color: #dc3545; font-weight: bold;';
            default: return 'color: #6c757d;';
        }
    }
    
    showSummary() {
        const okCount = this.checks.filter(c => c.status === 'ok').length;
        const warningCount = this.checks.filter(c => c.status === 'warning').length;
        const errorCount = this.checks.filter(c => c.status === 'error').length;
        const criticalErrors = this.checks.filter(c => c.status === 'error' && c.critical).length;
        
        console.log('\n🏥 Health Check Summary:');
        console.log(`%c✅ OK: ${okCount}`, 'color: #28a745; font-weight: bold;');
        console.log(`%c⚠️ Warnings: ${warningCount}`, 'color: #ffc107; font-weight: bold;');
        console.log(`%c❌ Errors: ${errorCount}`, 'color: #dc3545; font-weight: bold;');
        
        if (criticalErrors === 0) {
            console.log('%c🎉 App is functional!', 'color: #28a745; font-size: 16px; font-weight: bold;');
        } else {
            console.log('%c🚨 Critical errors detected - App may not work properly', 'color: #dc3545; font-size: 16px; font-weight: bold;');
        }
        
        // Show recommendations
        this.showRecommendations();
    }
    
    showRecommendations() {
        const warnings = this.checks.filter(c => c.status === 'warning');
        const errors = this.checks.filter(c => c.status === 'error');
        
        if (warnings.length > 0 || errors.length > 0) {
            console.log('\n💡 Recommendations:');
            
            warnings.forEach(check => {
                console.log(`%c⚠️ ${check.name}: ${this.getRecommendation(check)}`, 'color: #ffc107;');
            });
            
            errors.forEach(check => {
                console.log(`%c❌ ${check.name}: ${this.getRecommendation(check)}`, 'color: #dc3545;');
            });
        }
    }
    
    getRecommendation(check) {
        switch (check.name) {
            case 'Supabase JS':
                return 'Check if Supabase CDN is accessible. App will work with mock data.';
            case 'App Configuration':
                return 'Verify environment variables are set correctly.';
            case 'Miro SDK':
                return 'Ensure app is running inside Miro environment.';
            case 'Enhanced Miro SDK':
                return 'Check if miro-sdk-enhanced.js is loaded correctly.';
            case 'CEO Dashboard':
                return 'Check if ceo-dashboard.js is loaded correctly.';
            default:
                return 'Check console for more details.';
        }
    }
}

// Auto-run health check when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new HealthCheck(), 1000);
    });
} else {
    setTimeout(() => new HealthCheck(), 1000);
}

// Export for manual use
window.HealthCheck = HealthCheck;