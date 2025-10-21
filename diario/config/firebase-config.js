// Configuração do Firebase
// IMPORTANTE: Substitua estas configurações pelas suas do Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyBnCKA2s2y5O3zYzIdL_1tiww54A0chXq4",
  authDomain: "diario-19072.firebaseapp.com",
  projectId: "diario-19072",
  storageBucket: "diario-19072.firebasestorage.app",
  messagingSenderId: "682916910383",
  appId: "1:682916910383:web:f7a5109ddcecb023e23dda"
};

// Como obter essas configurações:
// 1. Vá para https://console.firebase.google.com
// 2. Selecione seu projeto (ou crie um novo)
// 3. Clique no ícone de engrenagem > Configurações do projeto
// 4. Role até "Seus apps" e clique no ícone da web (</>)
// 5. Registre o app se ainda não fez
// 6. Copie as configurações do objeto firebaseConfig
// 7. Substitua os valores acima

// Inicializar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);