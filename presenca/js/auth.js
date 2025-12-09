// Authentication Module
import { auth, database } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Sign in existing user
export async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login bem-sucedido:', userCredential.user.email);
        return userCredential.user;
    } catch (error) {
        console.error('Erro no login:', error);
        throw new Error(getErrorMessage(error.code));
    }
}

// Sign up new user
export async function signUp(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        await updateProfile(user, { displayName });
        
        // Create user profile in database
        await set(ref(database, `users/${user.uid}`), {
            email: user.email,
            displayName: displayName,
            createdAt: new Date().toISOString(),
            role: 'teacher'
        });
        
        console.log('Conta criada com sucesso:', user.email);
        return user;
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        throw new Error(getErrorMessage(error.code));
    }
}

// Sign out current user
export async function logout() {
    try {
        await signOut(auth);
        console.log('Logout realizado');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro no logout:', error);
        throw new Error('Erro ao fazer logout');
    }
}

// Reset password
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log('Email de recuperação enviado para:', email);
    } catch (error) {
        console.error('Erro ao enviar email de recuperação:', error);
        throw new Error(getErrorMessage(error.code));
    }
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Check if user is authenticated
export function isAuthenticated() {
    return auth.currentUser !== null;
}

// Get user data from database
export async function getUserData(uid) {
    try {
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
    }
}

// Auth state observer
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Require authentication - redirect to login if not authenticated
export function requireAuth() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                window.location.href = 'login.html';
                reject(new Error('Não autenticado'));
            }
        });
    });
}

// Error message translation
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Usuário desabilitado',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Email já está em uso',
        'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
        'auth/operation-not-allowed': 'Operação não permitida',
        'auth/invalid-credential': 'Credenciais inválidas',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
    };
    
    return errorMessages[errorCode] || 'Erro ao processar solicitação';
}
