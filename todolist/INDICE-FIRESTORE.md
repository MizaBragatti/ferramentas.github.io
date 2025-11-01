# ⚠️ ÍNDICE NECESSÁRIO NO FIRESTORE

Quando você testar o aplicativo pela primeira vez, o Firebase pode mostrar um erro no console do navegador pedindo para criar um índice composto.

## Como Criar o Índice:

1. **Abra o aplicativo** e tente adicionar uma tarefa
2. **Abra o Console do navegador** (F12)
3. Se aparecer um erro sobre índice, ele virá com **um link**
4. **Clique no link** - você será levado ao Firebase Console
5. **Clique em "Criar índice"**
6. **Aguarde** alguns minutos até o índice ser criado (você verá o status)
7. **Recarregue a página** do aplicativo

## Ou Crie Manualmente:

1. Vá em [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Índices**
4. Clique em **Adicionar índice**
5. Configure:
   - **Coleção**: `tasks`
   - **Campos a indexar**:
     - `userId` - Crescente
     - `createdAt` - Decrescente
   
  // Se você optar por filtrar por email (userEmail) em vez de userId, crie este índice alternativo:
   - **Campos a indexar (por email)**:
     - `userEmail` - Crescente
     - `createdAt` - Decrescente
   - **Status de consulta**: Ativado
6. Clique em **Criar**

## Por que isso é necessário?

O Firestore exige índices compostos quando você faz queries que:
- Filtram por um campo (`userId`)
- E ordenam por outro campo (`createdAt`)

Isso é feito automaticamente na primeira vez que você tenta fazer a query!