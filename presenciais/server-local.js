const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Middleware para injetar variáveis de ambiente no HTML
app.get('/presenciais.html', (req, res) => {
    // Ler o arquivo HTML
    let htmlContent = fs.readFileSync(path.join(__dirname, 'presenciais.html'), 'utf8');
    
    // Verificar se temos as variáveis de ambiente
    const firebaseVars = {
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID
    };
    
    console.log('🔍 Variáveis de ambiente detectadas:');
    Object.entries(firebaseVars).forEach(([key, value]) => {
        const status = value ? '✅ Definida' : '❌ Não definida';
        const preview = value ? `(${value.substring(0, 10)}...)` : '';
        console.log(`   ${key}: ${status} ${preview}`);
    });
    
    // Se temos as variáveis, injetar no HTML
    if (firebaseVars.FIREBASE_API_KEY && firebaseVars.FIREBASE_PROJECT_ID) {
        const isTestMode = firebaseVars.FIREBASE_API_KEY.includes('DEMO') || 
                          firebaseVars.FIREBASE_PROJECT_ID.includes('teste');
        
        const firebaseScript = `<script>
        // Configuração Firebase injetada por servidor local
        window.FIREBASE_API_KEY = '${firebaseVars.FIREBASE_API_KEY}';
        window.FIREBASE_AUTH_DOMAIN = '${firebaseVars.FIREBASE_AUTH_DOMAIN}';
        window.FIREBASE_PROJECT_ID = '${firebaseVars.FIREBASE_PROJECT_ID}';
        window.FIREBASE_STORAGE_BUCKET = '${firebaseVars.FIREBASE_STORAGE_BUCKET}';
        window.FIREBASE_MESSAGING_SENDER_ID = '${firebaseVars.FIREBASE_MESSAGING_SENDER_ID}';
        window.FIREBASE_APP_ID = '${firebaseVars.FIREBASE_APP_ID}';
        
        // Configurar FIREBASE_CONFIG diretamente
        window.FIREBASE_CONFIG = {
            apiKey: window.FIREBASE_API_KEY,
            authDomain: window.FIREBASE_AUTH_DOMAIN,
            projectId: window.FIREBASE_PROJECT_ID,
            storageBucket: window.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID,
            appId: window.FIREBASE_APP_ID
        };
        
        // Modo de teste detectado
        window.FIREBASE_TEST_MODE = ${isTestMode};
        
        console.log('🔐 Variáveis Firebase carregadas via servidor local');
        console.log('🔥 FIREBASE_CONFIG configurado:', !!window.FIREBASE_CONFIG);
        console.log('🔑 API Key presente:', !!window.FIREBASE_API_KEY);
        console.log('📋 Project ID:', window.FIREBASE_PROJECT_ID);
        console.log('🧪 Modo de teste:', window.FIREBASE_TEST_MODE);
        
        if (window.FIREBASE_TEST_MODE) {
            console.log('⚠️ USANDO CHAVES DE TESTE - Firebase não conectará, mas dinâmica funciona!');
        }
        </script>`;
        
        // Remover referência ao firebase-config-local.js
        htmlContent = htmlContent.replace(
            /<script src="firebase-config-local\.js"><\/script>\s*/g,
            ''
        );
        
        // Injetar o script antes do firebase-config-universal.js
        htmlContent = htmlContent.replace(
            '<script src="firebase-config-universal.js"></script>',
            firebaseScript + '\n    <script src="firebase-config-universal.js"></script>'
        );
        
        console.log('✅ Configuração Firebase injetada no HTML');
        if (isTestMode) {
            console.log('🧪 Modo de teste ativo - usando chaves falsas');
        }
    } else {
        console.log('⚠️ Variáveis de ambiente Firebase não encontradas');
        console.log('💡 Configure as variáveis antes de iniciar o servidor');
    }
    
    res.send(htmlContent);
});

app.listen(PORT, () => {
    console.log('🚀 Servidor local iniciado!');
    console.log(`📍 Acesse: http://localhost:${PORT}/presenciais.html`);
    console.log('');
    console.log('🔑 Para testar com Firebase, configure as variáveis de ambiente:');
    console.log('   FIREBASE_API_KEY=sua_api_key');
    console.log('   FIREBASE_AUTH_DOMAIN=seu_domain');
    console.log('   FIREBASE_PROJECT_ID=seu_project_id');
    console.log('   FIREBASE_STORAGE_BUCKET=seu_bucket');
    console.log('   FIREBASE_MESSAGING_SENDER_ID=seu_sender_id');
    console.log('   FIREBASE_APP_ID=seu_app_id');
    console.log('');
    console.log('💻 Exemplo no PowerShell:');
    console.log('   $env:FIREBASE_API_KEY="sua_key"; npm start');
});