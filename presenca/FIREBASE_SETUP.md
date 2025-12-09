# 🔥 Configuração do Firebase

## Passos para Configurar o Firebase no Seu Projeto

### 1. Obter as Credenciais do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto (que você já criou)
3. Clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto"
4. Selecione **"Configurações do projeto"**
5. Role até a seção **"Seus aplicativos"**
6. Clique no ícone **Web** (`</>`) para adicionar um app web
7. Dê um nome ao app (ex: "Sistema de Presença")
8. **NÃO** marque a opção Firebase Hosting (vamos usar GitHub Pages)
9. Clique em **"Registrar app"**
10. Copie o objeto `firebaseConfig` que aparece

### 2. Configurar o Arquivo firebase-config.js

Abra o arquivo `js/firebase-config.js` e substitua as credenciais de exemplo pelas suas:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",              // Cole sua chave aqui
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO-default-rtdb.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

### 3. Configurar as Regras do Realtime Database

1. No Console do Firebase, vá em **"Realtime Database"**
2. Clique na aba **"Regras"**
3. Substitua as regras padrão por estas:

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

Estas regras garantem que:
- ✅ Cada professor só pode ler/escrever seus próprios dados
- ✅ Ninguém pode acessar dados de outros professores
- ✅ Apenas usuários autenticados têm acesso

4. Clique em **"Publicar"**

### 4. Configurar as Regras de Autenticação

1. No Console do Firebase, vá em **"Authentication"**
2. Clique na aba **"Sign-in method"**
3. Ative o método **"E-mail/senha"**:
   - Clique em "E-mail/senha"
   - Ative a opção
   - Clique em "Salvar"

### 5. Testar o Sistema

1. Abra `login.html` no navegador
2. Crie uma conta com seu email e senha
3. Faça login
4. O sistema deve redirecionar para `index.html`
5. Você deve ver seu nome/email no canto superior direito

### 6. Recursos Adicionais do Firebase (Opcional)

#### Adicionar Logo no Email de Verificação
1. Vá em Authentication > Templates
2. Personalize os templates de email

#### Configurar Domínio Autorizado
1. Vá em Authentication > Settings
2. Em "Authorized domains", adicione:
   - `localhost` (já está)
   - `mizabragatti.github.io` (ou seu domínio GitHub Pages)

## 🔒 Segurança

**IMPORTANTE:** Nunca compartilhe suas credenciais do Firebase publicamente!

- ✅ As credenciais no `firebase-config.js` são seguras para uso no frontend
- ✅ A segurança é garantida pelas regras do Realtime Database
- ❌ Não exponha dados sensíveis nas regras do banco
- ❌ Não desabilite as regras de segurança

## 📊 Estrutura de Dados no Firebase

Seus dados serão organizados assim:

```
firebase-database/
├── users/
│   ├── [uid-do-usuario-1]/
│   │   ├── attendance_students: [...]
│   │   ├── attendance_modules: [...]
│   │   ├── attendance_records: [...]
│   │   └── attendance_alerts: [...]
│   └── [uid-do-usuario-2]/
│       └── ...
```

Cada professor tem seus próprios dados isolados!

## 🚀 Deploy no GitHub Pages

Após configurar o Firebase:

1. Commit e push das alterações:
```bash
git add .
git commit -m "Configurar Firebase Authentication e Realtime Database"
git push
```

2. Acesse seu site em: `https://mizabragatti.github.io/ferramentas.github.io/`

## 🆘 Troubleshooting

### Erro: "Firebase config not found"
- Verifique se substituiu as credenciais em `firebase-config.js`

### Erro: "Permission denied"
- Verifique as regras do Realtime Database
- Certifique-se de estar autenticado

### Erro: "Auth domain not authorized"
- Adicione seu domínio em Authentication > Settings > Authorized domains

### Dados não sincronizam
- Abra o Console do navegador (F12)
- Verifique se há erros no console
- Verifique sua conexão com internet

## 📝 Notas Importantes

1. **Backup dos Dados:** Os dados locais em localStorage continuam funcionando como backup offline
2. **Sincronização:** Ao fazer login, os dados são sincronizados entre dispositivos
3. **Primeiro Acesso:** Na primeira vez, você precisará criar uma conta de professor
4. **Multi-device:** Depois de configurado, acesse de qualquer lugar com o mesmo login!
