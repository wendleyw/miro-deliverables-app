// Miro Deliverables App - Configuration
class AppConfig {
    constructor() {
        this.config = {
            // Supabase Configuration
            supabase: {
                url: this.getEnvVar('SUPABASE_URL', 'https://xcdnjsufldwmdfchrstx.supabase.co'),
                anonKey: this.getEnvVar('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZG5qc3VmbGR3bWRmY2hyc3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzIxNDMsImV4cCI6MjA3NzQ0ODE0M30.2mJPuhQehNSs-0vcxWSp7RToTJEFePiPl1a5nVUgJBE'),
                serviceRoleKey: this.getEnvVar('SUPABASE_SERVICE_ROLE_KEY', '')
            },
            
            // Miro Configuration
            miro: {
                appId: this.getEnvVar('MIRO_APP_ID', '3458764598765432109'),
                accessToken: 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_BH1OjqHpVAomwhAdCt14quaaHGsmelhore',
                region: 'eu01',
                clientId: this.getEnvVar('MIRO_CLIENT_ID', ''),
                clientSecret: this.getEnvVar('MIRO_CLIENT_SECRET', '')
            },
            
            // App Configuration
            app: {
                url: this.getEnvVar('APP_URL', window.location.origin),
                environment: this.getEnvVar('ENVIRONMENT', 'development'),
                version: '1.0.0'
            },
            
            // Feature Flags
            features: {
                analytics: this.getEnvVar('ANALYTICS_ENABLED', 'false') === 'true',
                realtime: true,
                fileUpload: true,
                notifications: true,
                workloadAlerts: true
            },
            
            // UI Configuration
            ui: {
                theme: 'light',
                sidebar: {
                    width: 350,
                    height: 600
                },
                modal: {
                    width: 500,
                    height: 600
                }
            },
            
            // Workload Configuration
            workload: {
                overloadThreshold: 5,
                alertEnabled: true,
                redistributionSuggestions: true
            }
        };
        
        this.validateConfig();
    }
    
    getEnvVar(name, defaultValue = '') {
        // Try to get from environment variables (if available)
        if (typeof process !== 'undefined' && process.env) {
            return process.env[name] || defaultValue;
        }
        
        // Try to get from window object (for client-side)
        if (typeof window !== 'undefined' && window.ENV) {
            return window.ENV[name] || defaultValue;
        }
        
        // Return default value
        return defaultValue;
    }
    
    validateConfig() {
        const required = [
            'supabase.url',
            'supabase.anonKey',
            'miro.appId'
        ];
        
        const missing = required.filter(path => {
            const value = this.getNestedValue(this.config, path);
            return !value || value.startsWith('YOUR_');
        });
        
        if (missing.length > 0) {
            console.warn('Missing required configuration:', missing);
            console.warn('Please update your configuration in config.js or set environment variables');
        }
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    get(path) {
        return this.getNestedValue(this.config, path);
    }
    
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, this.config);
        
        target[lastKey] = value;
    }
    
    isProduction() {
        return this.get('app.environment') === 'production';
    }
    
    isDevelopment() {
        return this.get('app.environment') === 'development';
    }
    
    getSupabaseClient() {
        if (typeof createClient === 'undefined') {
            console.error('Supabase client not loaded. Include Supabase JS library.');
            return null;
        }
        
        return createClient(
            this.get('supabase.url'),
            this.get('supabase.anonKey')
        );
    }
}

// Create global config instance
window.AppConfig = new AppConfig();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}