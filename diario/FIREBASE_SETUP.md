# Configuração do Firebase para o Diário Online

Este arquivo contém instruções passo a passo para configurar o Firebase para seu diário online.

## Passo 1: Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto" ou "Create a project"
3. Dê um nome ao seu projeto (ex: "meu-diario-online")
4. Siga as instruções na tela (pode desabilitar o Google Analytics se quiser)
5. Aguarde a criação do projeto

## Passo 2: Configurar Firestore Database

1. No console do seu projeto Firebase, clique em "Firestore Database" no menu lateral
2. Clique em "Create database"
3. Escolha "Start in test mode" (para desenvolvimento)
4. Selecione uma localização próxima (ex: "southamerica-east1" para Brasil)
5. Clique em "Done"

## Passo 3: Configurar Authentication

1. No console do Firebase, clique em "Authentication" no menu lateral
2. Clique na aba "Sign-in method"
3. Clique em "Email/Password"
4. Ative a opção "Email/Password"
5. Clique em "Save"

## Passo 4: Obter Configurações do Firebase

1. No console do Firebase, clique no ícone de engrenagem ⚙️ no menu lateral
2. Clique em "Project settings"
3. Role para baixo até a seção "Your apps"
4. Clique no ícone da web `</>`
5. Dê um nome para o app (ex: "diario-web")
6. NÃO marque "Also set up Firebase Hosting"
7. Clique em "Register app"
8. Copie o objeto `firebaseConfig` que aparece

## Passo 5: Configurar o Projeto Local

1. Abra o arquivo `config/firebase-config.js` no seu projeto
2. Substitua os valores placeholder pelas suas configurações reais:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Passo 6: Configurar Regras de Segurança do Firestore

1. No console do Firebase, vá para "Firestore Database"
2. Clique na aba "Rules"
3. Substitua as regras pelo seguinte código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para entradas do diário
    match /diary_entries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Negar acesso a qualquer outro documento
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Clique em "Publish"

## Passo 7: Configurar para GitHub Pages (Opcional)

Se você vai hospedar no GitHub Pages, adicione os domínios autorizados:

1. No Firebase Console, vá para "Authentication" → "Settings" → "Authorized domains"
2. Adicione:
   - `localhost` (para desenvolvimento)
   - `seu-usuario.github.io` (para GitHub Pages)

## Passo 8: Testar a Aplicação

1. Execute localmente:
   ```bash
   npm start
   ```

2. Abra seu navegador em `http://localhost:3000`

3. Crie uma conta de teste e experimente as funcionalidades

## 📊 Índices do Firestore (Automático)

A aplicação foi otimizada para não precisar de índices personalizados. As consultas são feitas de forma simples e a ordenação é realizada no lado do cliente.

**Se você tiver muitas entradas (1000+) e quiser otimizar:**

1. No console do Firebase, vá para "Firestore Database" → "Indexes"
2. Clique em "Create Index"
3. Configure:
   - **Collection:** `diary_entries`
   - **Fields:** `userId` (Ascending) + `createdAt` (Descending)

## Estrutura dos Dados no Firestore

As entradas do diário são armazenadas na coleção `diary_entries`:

```javascript
{
  userId: "uid-do-usuario",
  title: "Título da entrada",
  content: "Conteúdo da entrada",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Dicas de Segurança

1. **API Keys são públicas** - Isso é normal para aplicações frontend
2. **Segurança real** está nas regras do Firestore
3. **Backups** - Exporte dados periodicamente
4. **Monitoramento** - Acompanhe uso no console

## Problemas Comuns

### Erro "Permission denied"
- Verifique as regras do Firestore
- Confirme se o usuário está autenticado

### Erro "Firebase app not initialized"
- Verifique as configurações no `firebase-config.js`
- Confirme se o projeto Firebase está ativo

### Loading infinito
- Verifique conexão com internet
- Confirme configurações de domínios autorizados

## Próximos Passos

Após configurar e testar:

1. ✅ Personalize o design no `css/style.css`
2. ✅ Adicione mais funcionalidades
3. ✅ Configure backup automático
4. ✅ Publique no GitHub Pages