// Firebase Configuration
// IMPORTANTE: Você precisará substituir estas configurações pelas suas próprias
// Para obter essas informações:
// 1. Acesse o Console do Firebase (https://console.firebase.google.com/)
// 2. Selecione seu projeto
// 3. Vá em Configurações do Projeto (ícone de engrenagem) > Geral
// 4. Role até "Seus aplicativos" e clique em "Web" (</> ícone)
// 5. Copie as configurações do firebaseConfig

const firebaseConfig = {
    apiKey: "AIzaSyBV_tYSfSvMGPzCHEMk919qGonkimPgiXo",
    authDomain: "presenca-1bee3.firebaseapp.com",
    databaseURL: "https://presenca-1bee3-default-rtdb.firebaseio.com",
    projectId: "presenca-1bee3",
    storageBucket: "presenca-1bee3.firebasestorage.app",
    messagingSenderId: "408759724396",
    appId: "1:408759724396:web:7bd2ff11c5ea32e521eb49"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
