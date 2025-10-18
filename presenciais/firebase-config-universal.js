// Configuração Firebase Unificada - Funciona em desenvolvimento e produção
window.getFirebaseConfig = function() {
    console.log('🔍 Buscando configuração Firebase...');
    console.log('📊 Debug das variáveis:');
    console.log('  FIREBASE_CONFIG:', !!window.FIREBASE_CONFIG);
    console.log('  FIREBASE_API_KEY:', !!window.FIREBASE_API_KEY);
    console.log('  FIREBASE_PROJECT_ID:', !!window.FIREBASE_PROJECT_ID);
    
    // Prioridade 1: Objeto FIREBASE_CONFIG injetado (mais confiável)
    if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
        console.log('✅ Usando configuração FIREBASE_CONFIG (GitHub Actions)');
        return window.FIREBASE_CONFIG;
    }
    
    // Prioridade 2: Variáveis injetadas pelo GitHub Actions (produção)
    if (window.FIREBASE_API_KEY && 
        window.FIREBASE_API_KEY !== 'undefined' && 
        window.FIREBASE_API_KEY.length > 10) {
        
        console.log('✅ Usando configuração de produção (GitHub Actions)');
        return {
            apiKey: window.FIREBASE_API_KEY,
            authDomain: window.FIREBASE_AUTH_DOMAIN,
            projectId: window.FIREBASE_PROJECT_ID,
            storageBucket: window.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID,
            appId: window.FIREBASE_APP_ID
        };
    }
    
    // Prioridade 3: Configuração local (desenvolvimento)
    if (window.FIREBASE_CONFIG_LOCAL) {
        console.log('🛠️ Usando configuração local (desenvolvimento)');
        return window.FIREBASE_CONFIG_LOCAL;
    }
    
    // Sem configuração disponível - falha com mensagem clara
    console.error('❌ Nenhuma configuração Firebase encontrada!');
    console.log('🔐 Para configurar:');
    console.log('  📍 Desenvolvimento: Configure firebase-config-local.js');
    console.log('  📍 Produção: Configure secrets no GitHub Actions');
    console.log('  📍 Verifique se o workflow executou corretamente');
    
    throw new Error('Configuração Firebase não encontrada. Configure as variáveis de ambiente ou secrets do GitHub.');
};

// Disponibilizar configuração globalmente
window.FIREBASE_CONFIG = window.getFirebaseConfig();
console.log('🔥 Firebase configurado para:', window.location.hostname);