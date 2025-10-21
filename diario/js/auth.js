// auth.js - Gerenciamento de autenticação Firebase

import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

import { auth } from '../config/firebase-config.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authListenerConfigured = false;
        
        // Aguardar DOM estar pronto antes de configurar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize();
            });
        } else {
            this.initialize();
        }
    }

    // Inicializar após DOM estar pronto
    initialize() {
        console.log('Inicializando AuthManager...');
        
        // Timeout de emergência mais curto para remover loading
        setTimeout(() => {
            if (!this.authListenerConfigured) {
                console.warn('Firebase Auth não respondeu em 3 segundos, removendo loading...');
                this.forceHideLoading();
            }
        }, 3000);
        
        this.setupEventListeners();
        this.setupAuthListener();
    }

    // Função específica para remover loading agressivamente
    forceRemoveLoading() {
        const loadingElement = document.getElementById('loading');
        
        if (loadingElement) {
            // Múltiplas formas de esconder o loading
            loadingElement.style.setProperty('display', 'none', 'important');
            loadingElement.style.setProperty('visibility', 'hidden', 'important');
            loadingElement.style.setProperty('opacity', '0', 'important');
            loadingElement.style.setProperty('height', '0', 'important');
            loadingElement.style.setProperty('overflow', 'hidden', 'important');
            loadingElement.style.setProperty('position', 'absolute', 'important');
            loadingElement.style.setProperty('top', '-9999px', 'important');
            loadingElement.classList.add('d-none');
            loadingElement.setAttribute('hidden', 'true');
            loadingElement.remove(); // Remove completamente do DOM
            
            console.log('Loading removido agressivamente do DOM');
        } else {
            console.warn('Elemento loading não encontrado para remoção');
        }
    }

    // Forçar remoção do loading em caso de emergência
    forceHideLoading() {
        console.log('Forçando remoção do loading...');
        
        const loadingElement = document.getElementById('loading');
        
        if (loadingElement) {
            // Múltiplas formas de esconder o loading para garantir que funcione
            loadingElement.style.display = 'none';
            loadingElement.style.visibility = 'hidden';
            loadingElement.style.opacity = '0';
            loadingElement.style.height = '0';
            loadingElement.style.overflow = 'hidden';
            loadingElement.classList.add('d-none'); // Bootstrap utility
            loadingElement.setAttribute('hidden', 'true');
            
            console.log('Loading removido com sucesso');
        } else {
            console.warn('Elemento loading não encontrado');
        }
        
        this.showLoginSection();
    }

    // Função auxiliar para mostrar a seção de login
    showLoginSection() {
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const diarySection = document.getElementById('diary-section');
        const authSection = document.getElementById('auth-section');
        
        if (loginSection) {
            loginSection.style.display = 'block';
            loginSection.style.visibility = 'visible';
            loginSection.style.opacity = '1';
            loginSection.classList.remove('d-none');
            console.log('Seção de login mostrada');
        }
        
        if (registerSection) {
            registerSection.style.display = 'none';
        }
        
        if (diarySection) {
            diarySection.style.display = 'none';
        }
        
        if (authSection) {
            authSection.innerHTML = `
                <span class="navbar-text">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Problema de conexão
                </span>
            `;
        }
        
        this.showError('Problema de conexão com o Firebase. Recarregue a página ou verifique sua internet.');
    }

    // Configurar listener para mudanças no estado de autenticação
    setupAuthListener() {
        try {
            onAuthStateChanged(auth, (user) => {
                this.authListenerConfigured = true;
                this.currentUser = user;
                this.handleAuthStateChange(user);
            }, (error) => {
                console.error('Erro no listener de autenticação:', error);
                this.authListenerConfigured = true;
                this.forceHideLoading();
                this.showError('Erro de conexão com o Firebase. Verifique sua internet.');
            });
        } catch (error) {
            console.error('Erro ao configurar listener de autenticação:', error);
            this.authListenerConfigured = true;
            this.forceHideLoading();
            this.showError('Erro ao inicializar autenticação.');
        }
    }

    // Gerenciar mudanças no estado de autenticação
    handleAuthStateChange(user) {
        console.log('Mudança no estado de autenticação:', user ? `Logado: ${user.email}` : 'Não logado');
        
        // Forçar remoção do loading de forma agressiva
        this.forceRemoveLoading();
        
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const diarySection = document.getElementById('diary-section');
        const authSection = document.getElementById('auth-section');

        if (user) {
            // Usuário logado
            console.log('Usuário logado:', user.email);
            
            // Mostrar seção do diário
            if (loginSection) loginSection.style.display = 'none';
            if (registerSection) registerSection.style.display = 'none';
            if (diarySection) diarySection.style.display = 'block';

            // Atualizar navbar
            if (authSection) {
                authSection.innerHTML = `
                    <span class="navbar-text me-3">
                        <i class="fas fa-user me-1"></i>
                        ${user.email}
                    </span>
                    <button id="logout-btn" class="btn btn-outline-light btn-sm">
                        <i class="fas fa-sign-out-alt me-1"></i>
                        Sair
                    </button>
                `;

                // Configurar botão de logout
                document.getElementById('logout-btn').addEventListener('click', () => this.logout());
            }

            // Carregar entradas do diário
            if (window.diaryManager) {
                window.diaryManager.loadEntries();
            }

        } else {
            // Usuário não logado
            console.log('Usuário não logado');
            
            // Mostrar seção de login
            if (loginSection) loginSection.style.display = 'block';
            if (registerSection) registerSection.style.display = 'none';
            if (diarySection) diarySection.style.display = 'none';

            // Atualizar navbar
            if (authSection) {
                authSection.innerHTML = `
                    <span class="navbar-text">
                        <i class="fas fa-lock me-1"></i>
                        Faça login para acessar seu diário
                    </span>
                `;
            }
        }
    }

    // Configurar event listeners dos formulários
    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Formulário de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        } else {
            console.warn('Formulário de login não encontrado');
        }

        // Formulário de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        } else {
            console.warn('Formulário de registro não encontrado');
        }

        // Botões para alternar entre login e registro
        const showRegisterBtn = document.getElementById('show-register');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => {
                const loginSection = document.getElementById('login-section');
                const registerSection = document.getElementById('register-section');
                if (loginSection) loginSection.style.display = 'none';
                if (registerSection) registerSection.style.display = 'block';
            });
        } else {
            console.warn('Botão show-register não encontrado');
        }

        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => {
                const registerSection = document.getElementById('register-section');
                const loginSection = document.getElementById('login-section');
                if (registerSection) registerSection.style.display = 'none';
                if (loginSection) loginSection.style.display = 'block';
            });
        } else {
            console.warn('Botão show-login não encontrado');
        }
        
        console.log('Event listeners configurados com sucesso');
    }

    // Fazer login
    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            this.showLoading('Fazendo login...');
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login realizado com sucesso:', userCredential.user.email);
            
            this.showSuccess('Login realizado com sucesso!');
            
            // Limpar formulário
            document.getElementById('login-form').reset();

        } catch (error) {
            console.error('Erro no login:', error);
            this.showError(this.getErrorMessage(error.code));
        } finally {
            this.hideLoading();
        }
    }

    // Fazer registro
    async register() {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            this.showLoading('Criando conta...');
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Registro realizado com sucesso:', userCredential.user.email);
            
            this.showSuccess('Conta criada com sucesso! Bem-vindo ao seu diário!');
            
            // Limpar formulário
            document.getElementById('register-form').reset();

        } catch (error) {
            console.error('Erro no registro:', error);
            this.showError(this.getErrorMessage(error.code));
        } finally {
            this.hideLoading();
        }
    }

    // Fazer logout
    async logout() {
        try {
            await signOut(auth);
            console.log('Logout realizado com sucesso');
            this.showSuccess('Logout realizado com sucesso!');
        } catch (error) {
            console.error('Erro no logout:', error);
            this.showError('Erro ao fazer logout. Tente novamente.');
        }
    }

    // Obter mensagem de erro em português
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'Usuário não encontrado. Verifique o email.',
            'auth/wrong-password': 'Senha incorreta. Tente novamente.',
            'auth/email-already-in-use': 'Este email já está sendo usado por outra conta.',
            'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
            'auth/invalid-email': 'Email inválido. Verifique o formato.',
            'auth/user-disabled': 'Esta conta foi desabilitada.',
            'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
            'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
            'auth/invalid-credential': 'Credenciais inválidas. Verifique email e senha.'
        };

        return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente.';
    }

    // Mostrar loading
    showLoading(message = 'Carregando...') {
        // Implementar loading visual se necessário
        console.log(message);
    }

    // Esconder loading
    hideLoading() {
        // Implementar remoção do loading visual se necessário
    }

    // Mostrar mensagem de sucesso
    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    // Mostrar mensagem de erro
    showError(message) {
        this.showAlert(message, 'danger');
    }

    // Mostrar alerta
    showAlert(message, type) {
        // Remover alertas anteriores
        const existingAlerts = document.querySelectorAll('.alert-temporary');
        existingAlerts.forEach(alert => alert.remove());

        // Criar novo alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-temporary`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Verificar se usuário está logado
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obter ID do usuário atual
    getCurrentUserId() {
        return this.currentUser ? this.currentUser.uid : null;
    }
}

// Exportar instância do AuthManager
export const authManager = new AuthManager();