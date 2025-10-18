// Configuração Firebase Unificada - Funciona em desenvolvimento e produção
window.getFirebaseConfig = function() {
    // Prioridade 1: Variáveis injetadas pelo GitHub Actions (produção)
    if (window.FIREBASE_API_KEY && 
        window.FIREBASE_API_KEY !== 'undefined' && 
        window.FIREBASE_API_KEY.length > 10) {
        
        console.log('🌐 Usando configuração de produção (GitHub Actions)');
        return {
            apiKey: window.FIREBASE_API_KEY,
            authDomain: window.FIREBASE_AUTH_DOMAIN,
            projectId: window.FIREBASE_PROJECT_ID,
            storageBucket: window.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID,
            appId: window.FIREBASE_APP_ID
        };
    }
    
    // Prioridade 2: Configuração local (desenvolvimento)
    if (window.FIREBASE_CONFIG_LOCAL) {
        console.log('🛠️ Usando configuração local (desenvolvimento)');
        return window.FIREBASE_CONFIG_LOCAL;
    }
    
    // Sem configuração disponível - falha com mensagem clara
    console.error('❌ Nenhuma configuração Firebase encontrada!');
    console.log('🔐 Para configurar:');
    console.log('  📍 Desenvolvimento: Configure firebase-config-local.js');
    console.log('  📍 Produção: Configure secrets no GitHub Actions');
    
    throw new Error('Configuração Firebase não encontrada. Configure as variáveis de ambiente ou secrets do GitHub.');
};

// Disponibilizar configuração globalmente
window.FIREBASE_CONFIG = window.getFirebaseConfig();
console.log('🔥 Firebase configurado para:', window.location.hostname);