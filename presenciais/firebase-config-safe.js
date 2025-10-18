// Configuração Firebase Segura Simplificada
class FirebaseConfigManager {
    constructor() {
        this.config = null;
    }

    // Carrega a configuração usando a função universal
    async loadConfig() {
        try {
            // Aguardar um pouco para garantir que os scripts foram carregados
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (typeof window.getFirebaseConfig === 'function') {
                this.config = window.getFirebaseConfig();
                console.log('✅ Configuração Firebase carregada via getFirebaseConfig()');
                return this.config;
            } else if (window.FIREBASE_CONFIG) {
                this.config = window.FIREBASE_CONFIG;
                console.log('✅ Configuração Firebase obtida de FIREBASE_CONFIG');
                return this.config;
            } else {
                // Verificar se existem variáveis globais do GitHub Actions
                if (window.FIREBASE_API_KEY) {
                    this.config = {
                        apiKey: window.FIREBASE_API_KEY,
                        authDomain: window.FIREBASE_AUTH_DOMAIN,
                        projectId: window.FIREBASE_PROJECT_ID,
                        storageBucket: window.FIREBASE_STORAGE_BUCKET,
                        messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID,
                        appId: window.FIREBASE_APP_ID
                    };
                    console.log('✅ Configuração Firebase obtida de variáveis globais');
                    return this.config;
                } else {
                    throw new Error('Nenhuma configuração Firebase encontrada');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configuração Firebase:', error);
            console.log('🔍 Debug - variáveis disponíveis:', {
                getFirebaseConfig: typeof window.getFirebaseConfig,
                FIREBASE_CONFIG: !!window.FIREBASE_CONFIG,
                FIREBASE_API_KEY: !!window.FIREBASE_API_KEY,
                hostname: window.location.hostname
            });
            throw new Error(`Não foi possível conectar ao Firebase: ${error.message}`);
        }
    }

    getConfig() {
        return this.config;
    }
}

// Disponibilizar globalmente
window.FirebaseConfigManager = FirebaseConfigManager;