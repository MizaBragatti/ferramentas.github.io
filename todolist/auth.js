// Verificar se o usuário já está logado
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Usuário logado, redirecionar para a página principal
        window.location.href = 'index.html';
    }
});

// Mostrar formulário de login
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'none';
}

// Mostrar formulário de registro
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('resetForm').style.display = 'none';
}

// Mostrar formulário de recuperação de senha
function showPasswordReset() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'block';
}

// Fazer login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading(true);
    
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Login realizado com sucesso!', 'success');
        // O redirecionamento será automático pelo onAuthStateChanged
    } catch (error) {
        console.error('Erro no login:', error);
        let message = 'Erro ao fazer login';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'Usuário não encontrado';
                break;
            case 'auth/wrong-password':
                message = 'Senha incorreta';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/user-disabled':
                message = 'Usuário desabilitado';
                break;
            case 'auth/too-many-requests':
                message = 'Muitas tentativas. Tente novamente mais tarde';
                break;
            default:
                message = error.message;
        }
        
        showToast(message, 'error');
        showLoading(false);
    }
}

// Fazer registro
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        showToast('As senhas não coincidem', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // Criar usuário
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // Atualizar perfil com o nome
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        // Criar documento do usuário no Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Conta criada com sucesso!', 'success');
        // O redirecionamento será automático pelo onAuthStateChanged
    } catch (error) {
        console.error('Erro no registro:', error);
        let message = 'Erro ao criar conta';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Este email já está cadastrado';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/weak-password':
                message = 'Senha muito fraca';
                break;
            default:
                message = error.message;
        }
        
        showToast(message, 'error');
        showLoading(false);
    }
}

// Recuperar senha
async function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    
    showLoading(true);
    
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showToast('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
        setTimeout(() => {
            showLogin();
        }, 2000);
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        let message = 'Erro ao enviar email';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'Email não encontrado';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            default:
                message = error.message;
        }
        
        showToast(message, 'error');
    } finally {
        showLoading(false);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    const forms = document.querySelectorAll('.auth-form');
    const loading = document.getElementById('authLoading');
    
    if (show) {
        forms.forEach(form => form.style.display = 'none');
        loading.style.display = 'block';
    } else {
        loading.style.display = 'none';
        showLogin();
    }
}

// Mostrar notificação toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('authToast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}