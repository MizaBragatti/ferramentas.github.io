# 🔧 Configuração Local

## ⚠️ IMPORTANTE: Configuração de Credenciais

Para usar esta aplicação localmente, você precisa configurar suas próprias credenciais do Firebase:

### 1. **Obter Credenciais do Firebase**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Vá em **Project Settings** → **General** → **Your apps**
4. Clique no ícone web (`</>`) para criar um web app
5. Copie as credenciais fornecidas

### 2. **Configurar Localmente**

```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env.local

# 2. Edite .env.local com suas credenciais reais
nano .env.local
```

### 3. **Formato do .env.local**

```env
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
```

### 4. **Habilitar Firestore**

No Firebase Console:
1. Vá para **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **modo de teste** (temporariamente)
4. Selecione uma região próxima

### 5. **Aplicar Regras de Segurança**

Copie as regras do arquivo `SECURITY.md` e aplique no Firestore.

---

**NUNCA commite o arquivo `.env.local` - ele está protegido pelo `.gitignore`**