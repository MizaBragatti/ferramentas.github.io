# 🔄 Configurar Compartilhamento de Tarefas

## ✅ O que foi alterado

Agora o sistema permite que **DOIS usuários específicos** compartilhem todas as tarefas entre si.

## 📝 Passos para Configurar

### 1️⃣ Atualizar Emails no Código JavaScript

Abra o arquivo `script.js` e localize as linhas 8-12:

```javascript
// CONFIGURAÇÃO: Adicione aqui os emails que podem acessar as tarefas compartilhadas
const AUTHORIZED_EMAILS = [
    'seu-email@exemplo.com',      // Substitua pelo seu email
    'outro-email@exemplo.com'      // Substitua pelo email da outra pessoa
];
```

**Substitua** pelos emails reais dos dois usuários. Exemplo:

```javascript
const AUTHORIZED_EMAILS = [
    'joao@gmail.com',
    'maria@gmail.com'
];
```

### 2️⃣ Atualizar Regras do Firestore

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Firestore Database** > **Regras**
3. Localize as linhas 7-11:

```javascript
function isAuthorizedUser() {
  return request.auth != null && (
    request.auth.token.email == 'seu-email@exemplo.com' ||
    request.auth.token.email == 'outro-email@exemplo.com'
  );
}
```

4. **Substitua** pelos mesmos emails que você colocou no `script.js`:

```javascript
function isAuthorizedUser() {
  return request.auth != null && (
    request.auth.token.email == 'joao@gmail.com' ||
    request.auth.token.email == 'maria@gmail.com'
  );
}
```

5. Clique em **Publicar**

### 3️⃣ Criar Índice Composto no Firestore

O Firestore precisa de um índice para buscar por múltiplos emails:

1. No Firebase Console, vá em **Firestore Database** > **Índices**
2. Clique em **Adicionar índice**
3. Configure:
   - **Coleção**: `tasks`
   - **Campos**:
     - `userEmail` - Ascendente
     - `createdAt` - Descendente
   - **Status da consulta**: Habilitado
4. Clique em **Criar**
5. **Aguarde** a criação do índice (pode levar alguns minutos)

> **Alternativa**: Quando você tentar carregar as tarefas, o Firestore mostrará um link no console do navegador para criar o índice automaticamente.

### 4️⃣ Executar Migração (se necessário)

Se você já tem tarefas antigas sem `userId` ou `userEmail`:

1. Abra o arquivo `migrar-tarefas.html` no navegador
2. Faça login com um dos emails autorizados
3. Clique em **Migrar Tarefas Agora**
4. Aguarde a confirmação

## ⚠️ IMPORTANTE

- **Ambos os emails devem estar iguais** em `script.js` E nas regras do Firestore
- **Ambos os usuários devem estar registrados** no Firebase Authentication
- Qualquer um dos dois pode criar, editar e deletar TODAS as tarefas
- Mudanças aparecem em tempo real para ambos os usuários

## 🎯 Como Funciona

- Quando qualquer um dos dois usuários faz login, ele vê **TODAS** as tarefas criadas por ambos
- As tarefas são identificadas pelo campo `userEmail`
- O sistema busca tarefas onde `userEmail` está na lista `AUTHORIZED_EMAILS`
- Qualquer usuário autorizado pode fazer CRUD completo em qualquer tarefa

## 🔐 Segurança

- Apenas os emails listados podem acessar as tarefas
- Usuários não autorizados não conseguem ver nada
- Cada usuário ainda tem seu próprio perfil privado na coleção `users`

## 🚀 Testando

1. Faça login com o primeiro email
2. Crie algumas tarefas
3. Faça logout
4. Faça login com o segundo email
5. Você deve ver as mesmas tarefas criadas pelo primeiro usuário
6. Crie, edite ou delete tarefas
7. Volte ao primeiro usuário e veja as mudanças em tempo real!
