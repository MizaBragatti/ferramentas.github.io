# OneNote Clone

Uma aplicação web moderna que replica as principais funcionalidades do Microsoft OneNote, construída com React, TypeScript e Next.js.

## 🚀 Funcionalidades

- **Estrutura Hierárquica**: Notebooks → Seções → Páginas
- **Editor de Texto Rico**: Formatação completa com negrito, itálico, listas, títulos e mais
- **Navegação Intuitiva**: Sidebar com organização em árvore
- **Busca**: Pesquise por notebooks, seções e páginas
- **Auto-salvamento**: Suas alterações são salvas automaticamente
- **Interface Responsiva**: Funciona em desktop e mobile
- **Tema Moderno**: Interface limpa e profissional

## 🛠️ Tecnologias Utilizadas

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **TipTap** - Editor de texto rico
- **Lucide React** - Ícones
- **React Context** - Gerenciamento de estado

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute em modo de desenvolvimento:
```bash
npm run dev
```

3. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

### Scripts Disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Executa o servidor de produção
- `npm run lint` - Executa linting do código

## 📝 Como Usar

1. **Criar Notebook**: Clique no botão "+" no cabeçalho da sidebar
2. **Criar Seção**: Clique no botão "+" ao lado do notebook
3. **Criar Página**: Clique no botão "+" ao lado da seção
4. **Editar Página**: Clique em uma página para abrir o editor
5. **Formatação**: Use a barra de ferramentas para formatar o texto
6. **Busca**: Digite no campo de busca para encontrar conteúdo

## 📦 Estrutura do Projeto

```
src/
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página inicial
├── components/
│   ├── PageEditor.tsx       # Editor de páginas
│   ├── RichTextEditor.tsx   # Editor de texto rico
│   └── Sidebar.tsx          # Barra lateral de navegação
├── context/
│   └── AppContext.tsx       # Context para estado global
└── types/
    └── index.ts             # Definições TypeScript
```

## 🎯 Funcionalidades Implementadas

- ✅ Criação e gerenciamento de notebooks, seções e páginas
- ✅ Editor de texto rico com formatação
- ✅ Auto-salvamento de alterações
- ✅ Navegação hierárquica
- ✅ Busca por conteúdo
- ✅ Interface responsiva
- ✅ Indicadores de status (modificado/salvo)

## 🔮 Próximas Funcionalidades

- [ ] Persistência em banco de dados
- [ ] Sincronização em tempo real
- [ ] Compartilhamento de notebooks
- [ ] Tags e categorias
- [ ] Exportação para PDF/Word
- [ ] Modo offline
- [ ] Atalhos de teclado

---

Desenvolvido com ❤️ usando React e TypeScript
