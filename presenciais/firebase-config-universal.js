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
    
    // Prioridade 3: Configuração real como fallback (temporário)
    console.log('⚠️ Usando configuração de fallback - Configure as secrets para produção');
    return {
        apiKey: "AIzaSyBHE6qTXR1Iy64J3E5DygeiQ29Fwi6yq2c",
        authDomain: "presenciais-63551.firebaseapp.com",
        projectId: "presenciais-63551",
        storageBucket: "presenciais-63551.firebasestorage.app",
        messagingSenderId: "509316904369",
        appId: "1:509316904369:web:94b186cc7c5bd926687990"
    };
};

// Disponibilizar configuração globalmente
window.FIREBASE_CONFIG = window.getFirebaseConfig();
console.log('🔥 Firebase configurado para:', window.location.hostname);