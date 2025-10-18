// Configuração Firebase Segura com Variáveis de Ambiente
// Este arquivo gerencia as credenciais do Firebase de forma segura

class FirebaseConfigManager {
    constructor() {
        this.config = null;
        this.isProduction = window.location.hostname.includes('github.io');
        this.isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
    }

    // Carrega variáveis de ambiente do arquivo .env.local (desenvolvimento)
    async loadLocalEnv() {
        try {
            const response = await fetch('./.env.local');
            if (!response.ok) {
                throw new Error('Arquivo .env.local não encontrado');
            }
            
            const text = await response.text();
            const env = {};
            
            text.split('\n').forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    if (key && valueParts.length > 0) {
                        env[key.trim()] = valueParts.join('=').trim();
                    }
                }
            });
            
            return env;
        } catch (error) {
            console.warn('Não foi possível carregar .env.local:', error.message);
            return {};
        }
    }

    // Obtém configuração das variáveis globais (produção)
    getProductionConfig() {
        return {
            FIREBASE_API_KEY: window.FIREBASE_API_KEY,
            FIREBASE_AUTH_DOMAIN: window.FIREBASE_AUTH_DOMAIN,
            FIREBASE_PROJECT_ID: window.FIREBASE_PROJECT_ID,
            FIREBASE_STORAGE_BUCKET: window.FIREBASE_STORAGE_BUCKET,
            FIREBASE_MESSAGING_SENDER_ID: window.FIREBASE_MESSAGING_SENDER_ID,
            FIREBASE_APP_ID: window.FIREBASE_APP_ID
        };
    }

    // Configuração de fallback para desenvolvimento
    getDevelopmentFallback() {
        console.warn('⚠️ Usando configuração de fallback - configure .env.local para maior segurança');
        return {
            FIREBASE_API_KEY: 'your_api_key_here',
            FIREBASE_AUTH_DOMAIN: 'your_project_id.firebaseapp.com',
            FIREBASE_PROJECT_ID: 'your_project_id',
            FIREBASE_STORAGE_BUCKET: 'your_project_id.firebasestorage.app',
            FIREBASE_MESSAGING_SENDER_ID: 'your_sender_id',
            FIREBASE_APP_ID: 'your_app_id'
        };
    }

    // Valida se todas as configurações necessárias estão presentes
    validateConfig(env) {
        const required = [
            'FIREBASE_API_KEY',
            'FIREBASE_AUTH_DOMAIN', 
            'FIREBASE_PROJECT_ID',
            'FIREBASE_STORAGE_BUCKET',
            'FIREBASE_MESSAGING_SENDER_ID',
            'FIREBASE_APP_ID'
        ];

        const missing = required.filter(key => !env[key] || env[key] === 'your_api_key_here');
        
        if (missing.length > 0) {
            throw new Error(`Configurações Firebase faltando: ${missing.join(', ')}`);
        }

        return true;
    }

    // Carrega a configuração baseada no ambiente
    async loadConfig() {
        try {
            let env = {};

            if (this.isProduction) {
                console.log('🌐 Ambiente: Produção (GitHub Pages)');
                env = this.getProductionConfig();
            } else if (this.isDevelopment) {
                console.log('🛠️ Ambiente: Desenvolvimento');
                env = await this.loadLocalEnv();
                
                // Se não conseguiu carregar .env.local, usa fallback
                if (Object.keys(env).length === 0) {
                    env = this.getDevelopmentFallback();
                }
            } else {
                throw new Error(`Domínio não autorizado: ${window.location.hostname}`);
            }

            this.validateConfig(env);

            this.config = {
                apiKey: env.FIREBASE_API_KEY,
                authDomain: env.FIREBASE_AUTH_DOMAIN,
                projectId: env.FIREBASE_PROJECT_ID,
                storageBucket: env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
                appId: env.FIREBASE_APP_ID
            };

            console.log('✅ Configuração Firebase carregada com sucesso');
            console.log('📍 Projeto:', this.config.projectId);
            
            return this.config;

        } catch (error) {
            console.error('❌ Erro ao carregar configuração Firebase:', error);
            throw error;
        }
    }

    // Retorna a configuração (carrega se necessário)
    async getConfig() {
        if (!this.config) {
            await this.loadConfig();
        }
        return this.config;
    }
}

// Instância global do gerenciador
window.FirebaseConfigManager = FirebaseConfigManager;