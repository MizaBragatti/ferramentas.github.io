# 📖 Sistema CRUD de Versos Bíblicos

Um sistema web completo para gerenciar versos da Bíblia, desenvolvido com Node.js, Express, SQLite e interface web moderna.

## 🚀 Funcionalidades

- **CRUD Completo**: Criar, ler, atualizar e excluir versos
- **Interface Intuitiva**: Design responsivo e moderno
- **Busca Inteligente**: Pesquise por livro, texto ou referência
- **Banco de Dados**: SQLite para persistência de dados
- **Validação**: Validação completa de dados no front e backend
- **Livros Pré-cadastrados**: Principais livros da Bíblia já inclusos

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilização**: CSS Grid, Flexbox, Gradientes
- **API**: RESTful API com endpoints JSON

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)

## 🔧 Instalação e Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Inicializar Banco de Dados

```bash
npm run init-db
```

Este comando criará o banco SQLite com as tabelas necessárias e alguns dados de exemplo.

### 3. Executar o Servidor

#### Modo Desenvolvimento (com auto-reload):
```bash
npm run dev
```

#### Modo Produção:
```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000`

## 📊 Estrutura do Banco de Dados

### Tabela: `livros`
- `id` (INTEGER PRIMARY KEY)
- `nome` (TEXT) - Nome do livro
- `ordem` (INTEGER) - Ordem na Bíblia
- `testamento` (TEXT) - "Antigo" ou "Novo"

### Tabela: `versos`
- `id` (INTEGER PRIMARY KEY)
- `livro_id` (INTEGER) - Referência ao livro
- `capitulo` (INTEGER) - Número do capítulo
- `versiculo` (INTEGER) - Número do versículo
- `texto` (TEXT) - Texto do verso

## 🔌 API Endpoints

### Versos
- `GET /api/versos` - Listar todos os versos
- `GET /api/versos/:id` - Buscar verso por ID
- `POST /api/versos` - Criar novo verso
- `PUT /api/versos/:id` - Atualizar verso
- `DELETE /api/versos/:id` - Excluir verso

### Livros
- `GET /api/livros` - Listar todos os livros

### Exemplo de Requisição POST:
```json
{
  "livro_id": 1,
  "capitulo": 1,
  "versiculo": 1,
  "texto": "No princípio criou Deus os céus e a terra."
}
```

## 🎨 Interface do Usuário

### Funcionalidades da Interface:
- **Formulário Dinâmico**: Adicionar/editar versos
- **Lista Interativa**: Visualizar todos os versos com ações
- **Busca em Tempo Real**: Filtrar versos por qualquer termo
- **Confirmação de Exclusão**: Modal de segurança
- **Design Responsivo**: Funciona em desktop e mobile
- **Feedback Visual**: Mensagens de sucesso e erro

### Atalhos de Teclado:
- `Escape`: Cancelar edição ou fechar modal
- `Ctrl + Enter`: Submeter formulário

## 📁 Estrutura do Projeto

```
biblia-crud/
├── database/
│   └── biblia.db          # Banco SQLite
├── public/
│   ├── index.html         # Interface principal
│   ├── style.css          # Estilos
│   └── script.js          # JavaScript do frontend
├── scripts/
│   └── initDatabase.js    # Script de inicialização do DB
├── .github/
│   └── copilot-instructions.md
├── server.js              # Servidor Express
├── package.json
└── README.md
```

## 🔍 Exemplos de Uso

### Buscar versos:
- Digite "João 3:16" para encontrar versículos específicos
- Digite "amor" para encontrar versos que contenham a palavra
- Digite "Gênesis" para filtrar por livro

### Adicionar verso:
1. Selecione o livro no dropdown
2. Digite capítulo e versículo
3. Insira o texto completo
4. Clique em "Adicionar Verso"

### Editar verso:
1. Clique no ícone de edição (✏️) no verso desejado
2. Modifique os campos necessários
3. Clique em "Atualizar Verso"

## 🛡️ Segurança e Validação

- Validação de dados no frontend e backend
- Sanitização de inputs
- Tratamento de erros abrangente
- Prevenção de SQL injection (usando prepared statements)
- Validação de tipos de dados

## 🚀 Melhorias Futuras

- Autenticação de usuários
- Diferentes versões da Bíblia
- Exportação de dados (PDF, JSON)
- Favoritar versos
- Categorização por temas
- API de busca avançada
- Cache de dados

## 📝 Scripts Disponíveis

- `npm start` - Executar servidor em produção
- `npm run dev` - Executar servidor com nodemon (desenvolvimento)
- `npm run init-db` - Inicializar/resetar banco de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `package.json` para mais detalhes.

## ✨ Autor

Desenvolvido com ❤️ para facilitar o estudo e organização de versos bíblicos.

---

**Que este sistema seja uma bênção em seus estudos bíblicos! 🙏**