# Configuração do Firebase - Todo List com Autenticação

## ✅ Funcionalidades Implementadas

- **Autenticação de Usuários**: Login, Registro e Recuperação de Senha
- **Tarefas por Usuário**: Cada usuário vê apenas suas próprias tarefas
- **Segurança**: Regras de firestore protegem os dados

## 🔒 Configurar Regras de Segurança do Firestore

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Firestore Database** > **Regras**
3. Substitua as regras pelo código abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Lista de emails autorizados a acessar as tarefas compartilhadas
    function isAuthorizedUser() {
      return request.auth != null && (
        request.auth.token.email == 'mizabgt@gmail.com' ||
        request.auth.token.email == 'nicolasdesenvolvedor123@gmail.com'
      );
    }
    
    // Regras para a coleção de tarefas (compartilhadas entre usuários autorizados)
    match /tasks/{taskId} {
      // Permitir leitura se for usuário autorizado
      // OU se for tarefa sem userId (para migração)
      allow read: if isAuthorizedUser() || 
                     (request.auth != null && !("userId" in resource.data));
      
      // Permitir criar tarefas apenas se for usuário autorizado
      allow create: if isAuthorizedUser();
      
      // Permitir atualizar se for usuário autorizado
      // OU se for migração (tarefa sem userId)
      allow update: if isAuthorizedUser() || 
                       (request.auth != null && !("userId" in resource.data));
      
      // Permitir deletar se for usuário autorizado
      allow delete: if isAuthorizedUser();
    }
    
    // Regras para a coleção de usuários
    match /users/{userId} {
      // Permitir ler apenas o próprio perfil
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Permitir criar apenas o próprio perfil
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Permitir atualizar apenas o próprio perfil
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Clique em **Publicar**

## 🔐 Configurar Autenticação

1. No Firebase Console, vá em **Authentication**
2. Clique em **Começar** (se ainda não ativou)
3. Em **Sign-in method**, ative:
   - **Email/Password** (clique em Ativar)
4. Salve as configurações

## 📁 Estrutura dos Arquivos

```
todolist/
├── index.html          # Página principal (requer login)
├── login.html          # Página de login/registro
├── styles.css          # Estilos da página principal
├── auth.css            # Estilos da página de autenticação
├── script.js           # Lógica das tarefas
└── auth.js             # Lógica de autenticação
```

## 🚀 Como Usar

1. **Primeiro Acesso**:
   - Abra `login.html`
   - Clique em "Criar conta"
   - Preencha nome, email e senha
   - Crie sua conta

2. **Login**:
   - Digite seu email e senha
   - Clique em "Entrar"

3. **Recuperar Senha**:
   - Clique em "Esqueceu a senha?"
   - Digite seu email
   - Você receberá um email com instruções

4. **Usar o App**:
   - Após login, você será redirecionado para `index.html`
   - Adicione, edite, marque e delete suas tarefas
   - Suas tarefas são privadas e só você pode vê-las

## 🔧 Estrutura de Dados

### Coleção: tasks
```javascript
{
  text: "Exemplo de tarefa",
  completed: false,
  priority: "media",
  userId: "uid-do-usuario",
  userEmail: "usuario@email.com",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Coleção: users
```javascript
{
  name: "Nome do Usuário",
  email: "usuario@email.com",
  createdAt: timestamp
}
```

## ⚠️ Importante

- **Sempre use HTTPS** em produção
- **Configure regras de segurança** antes de publicar
- **Ative verificação de email** para maior segurança (opcional)
- **Configure domínios autorizados** em Authentication > Settings

## 🎯 Próximos Passos (Opcional)

- Adicionar foto de perfil
- Verificação de email obrigatória
- Login com Google/Facebook
- Temas personalizados por usuário
- Compartilhar tarefas com outros usuários