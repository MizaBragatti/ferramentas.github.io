# Drivers Mentais

Aplicação web para registrar, buscar, editar e excluir frases de autoengenharia e drivers mentais, com visual inspirado em componentes de computador.

## Tecnologias

- HTML
- CSS
- JavaScript
- Firebase Authentication
- Firestore
- GitHub Pages

## Estrutura

- `index.html`: página principal
- `styles.css`: visual da interface
- `firebase-config.js`: configuração do Firebase e emails permitidos
- `app.js`: lógica de autenticação, filtros, CRUD e renderização

## Configuração do Firebase

1. Crie um projeto no Firebase.
2. Ative Authentication com Email/Senha.
3. Ative Firestore Database.
4. Configure o arquivo `firebase-config.js` com suas chaves do Firebase.
5. Altere a lista `allowedEmails` para incluir somente os usuários liberados.

Exemplo:

```js
window.firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_MESSAGING_ID",
  appId: "SEU_APP_ID"
};

window.allowedEmails = [
  "usuario1@email.com",
  "usuario2@email.com"
];
```

## Regras do Firestore

Para restringir acesso somente a pessoas autorizadas, use regras como esta:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAllowedEmail() {
      return request.auth != null &&
        request.auth.token.email in [
          "usuario1@email.com",
          "usuario2@email.com"
        ];
    }

    match /drivers/{driverId} {
      allow read, write: if isAllowedEmail();
    }
  }
}
```

## GitHub Pages

1. Faça upload do projeto para um repositório do GitHub.
2. Acesse as configurações do repositório.
3. Ative GitHub Pages.
4. Escolha a branch principal e a pasta raiz.
5. Publique o site.

## Como usar

- Faça login com um email autorizado.
- Adicione, edite ou exclua drivers mentais.
- Use filtros e busca para encontrar frases.
- Marque favoritos para destacar as ideias mais importantes.

## Observação importante

A interface do GitHub Pages é pública, então o controle real de acesso deve acontecer no Firebase Auth + Firestore Rules.
