# 🔒 Configuração de Segurança - Presenciais App

## ⚠️ IMPORTANTE: Sem Credenciais Expostas

Este sistema foi configurado para **MÁXIMA SEGURANÇA**. Nenhuma credencial Firebase está exposta no código fonte.

## 🛠️ Configuração para Desenvolvimento

### 1. Criar arquivo de configuração local

Crie o arquivo `presenciais/firebase-config-local.js`:

```javascript
// Configuração Firebase para Desenvolvimento Local
window.FIREBASE_CONFIG_LOCAL = {
    apiKey: "sua_api_key_aqui",
    authDomain: "seu_projeto.firebaseapp.com",
    projectId: "seu_projeto_id",
    storageBucket: "seu_projeto.firebasestorage.app",
    messagingSenderId: "seu_sender_id",
    appId: "seu_app_id"
};
```

### 2. Substituir pelos valores reais

Obtenha as credenciais no [Firebase Console](https://console.firebase.google.com) e substitua os valores acima.

## 🌐 Configuração para Produção (GitHub Pages)

### 1. Configurar Secrets no GitHub

Vá para: `https://github.com/SEU_USUARIO/ferramentas.github.io/settings/secrets/actions`

### 2. Adicionar as seguintes secrets:

| Secret Name | Descrição | Exemplo |
|-------------|-----------|---------|
| `FIREBASE_API_KEY` | Chave da API Firebase | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | Domínio de autenticação | `projeto.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | ID do projeto | `meu-projeto-123` |
| `FIREBASE_STORAGE_BUCKET` | Bucket de storage | `projeto.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | ID do sender | `123456789` |
| `FIREBASE_APP_ID` | ID da aplicação | `1:123:web:abc123` |

## 🔐 Arquivos Protegidos

Os seguintes arquivos estão no `.gitignore` e **NUNCA** serão commitados:

- `presenciais/.env.local`
- `presenciais/firebase-config-local.js`

## ✅ Sistema de Segurança

### Desenvolvimento:
1. ✅ Credenciais em arquivo local (não commitado)
2. ✅ Fallback seguro sem exposição

### Produção:
1. ✅ Credenciais apenas via GitHub Secrets
2. ✅ Deploy falha se secrets não estiverem configuradas
3. ✅ Nenhuma credencial no código fonte público

## 🚨 Se o Deploy Falhar

Se você ver o erro: *"Secrets Firebase faltando"*

1. Configure todas as 6 secrets listadas acima
2. Faça um novo push para triggegar o deploy
3. O sistema só funcionará com todas as secrets configuradas

## 🔍 Verificação de Segurança

Para verificar se não há credenciais expostas:

```bash
# Buscar por possíveis credenciais no repositório
git grep -i "AIzaSy"
git grep -i "firebase.*key"
git grep -i "\.firebaseapp\.com"
```

O resultado deve ser vazio ou apenas em arquivos do `.gitignore`.

---

**⚠️ NUNCA** commite credenciais reais no código fonte!
**✅ SEMPRE** use variáveis de ambiente ou secrets para produção!