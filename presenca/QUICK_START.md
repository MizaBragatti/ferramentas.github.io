# 🚀 Início Rápido - 5 Minutos

## Configuração Expressa do Firebase

### 1️⃣ Criar Projeto Firebase (2 min)

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `sistema-presenca` (ou outro de sua escolha)
4. Desabilite Google Analytics (não precisamos)
5. Clique em **"Criar projeto"**

### 2️⃣ Ativar Authentication (1 min)

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Vamos começar"**
3. Clique em **"E-mail/senha"**
4. Ative a primeira opção (E-mail/senha)
5. Clique em **"Salvar"**

### 3️⃣ Ativar Realtime Database (1 min)

1. No menu lateral, clique em **"Realtime Database"**
2. Clique em **"Criar banco de dados"**
3. Localização: escolha mais próxima (ex: `us-central1`)
4. Modo: selecione **"Modo de teste"** (vamos mudar depois)
5. Clique em **"Ativar"**

### 4️⃣ Configurar Regras de Segurança (30s)

1. Ainda no Realtime Database, clique na aba **"Regras"**
2. Apague tudo e cole isto:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

3. Clique em **"Publicar"**

### 5️⃣ Obter Credenciais (30s)

1. Clique no ícone de **engrenagem** ⚙️ > **"Configurações do projeto"**
2. Role até **"Seus aplicativos"**
3. Clique no ícone **Web** (`</>`)
4. Apelido do app: `Sistema de Presença`
5. **NÃO** marque Firebase Hosting
6. Clique em **"Registrar app"**
7. **COPIE** o objeto `firebaseConfig`

### 6️⃣ Colar Credenciais no Código (30s)

1. Abra o arquivo `js/firebase-config.js`
2. Substitua isto:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    // ... etc
};
```

3. Por suas credenciais que copiou:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyA...", // Cole aqui
    authDomain: "sistema-presenca-xxxxx.firebaseapp.com",
    databaseURL: "https://sistema-presenca-xxxxx-default-rtdb.firebaseio.com",
    projectId: "sistema-presenca-xxxxx",
    storageBucket: "sistema-presenca-xxxxx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

4. Salve o arquivo

## ✅ Pronto! Agora é só usar:

1. Abra `login.html` no navegador
2. Clique em **"Criar nova conta"**
3. Cadastre-se com seu email
4. Faça login
5. Comece a usar o sistema!

## 🎉 Dica Extra

Para usar em produção (GitHub Pages):

1. Vá em Authentication > Settings > **Authorized domains**
2. Adicione: `seuusuario.github.io`
3. Faça commit e push:

```bash
git add .
git commit -m "Configurar Firebase"
git push
```

4. Acesse: `https://seuusuario.github.io/ferramentas.github.io/login.html`

---

## ⚠️ Importante

- **Guarde suas credenciais** - você precisará delas sempre
- **Não compartilhe** o arquivo `firebase-config.js` publicamente (mas tudo bem fazer commit no Git - as regras de segurança protegem seus dados)
- **Faça backup** exportando JSON regularmente

## 📚 Quer Mais Detalhes?

Veja o arquivo completo: **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)**
