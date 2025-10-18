# 📖 Bíblia Versos - CRUD

Sistema simples para buscar e gerenciar versículos bíblicos, otimizado para GitHub Pages.

## 🚀 Features

- ✅ **Busca de Versículos**: Interface amigável para buscar versículos por livro, capítulo e verso
- ⭐ **Favoritos**: Sistema de favoritos com localStorage (dados salvos no navegador)
- 📋 **Copiar Texto**: Copie versículos facilmente para área de transferência
- 🔍 **Filtros**: Filtre seus versículos favoritos
- 📱 **Responsivo**: Interface adaptada para desktop e mobile
- 🌐 **GitHub Pages**: Funciona completamente no cliente, sem necessidade de servidor

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Design moderno com gradientes e animações
- **JavaScript Vanilla**: Funcionalidades interativas
- **LocalStorage**: Persistência de dados local

## 📋 Como Usar

### 🚀 Início Rápido
1. Abra `demo.html` em seu navegador
2. Clique em "📚 Adicionar Versículos de Exemplo"
3. Navegue para "➕ Cadastro" ou "📋 Lista de Versos"

### Online (GitHub Pages)
1. Faça o deploy seguindo as instruções em `DEPLOY.md`
2. Acesse: `https://seu-usuario.github.io/nome-do-repositorio/`

### Local
1. Clone/baixe os arquivos
2. Abra qualquer arquivo `.html` em seu navegador
3. Pronto! Não precisa instalar nada

## 🔍 Funcionalidades

### Buscar Versículos
1. Selecione o livro da Bíblia
2. Digite o capítulo e versículo
3. Clique em "🔍 Buscar Versículo"
4. Use os botões de sugestão para versículos populares

### Gerenciar Favoritos
- Adicione versículos aos favoritos clicando em "⭐ Adicionar aos Favoritos"
- Visualize todos os favoritos na aba "⭐ Meus Favoritos"
- Filtre favoritos usando a caixa de busca
- Copie ou remova versículos individuais
- Limpe todos os favoritos de uma vez

### Base de Dados
O sistema inclui uma base local com versículos populares:
- João 3:16
- Salmos 23:1
- Filipenses 4:13
- Romanos 8:28
- Provérbios 3:5
- Mateus 11:28
- E muitos outros...

## 📁 Estrutura do Projeto

```
biblia/
├── demo.html           # 🚀 Página de demonstração (COMECE AQUI!)
├── cadastro.html       # ➕ Página de cadastro de versículos
├── index.html          # 📋 Página de lista/gerenciamento
├── style.css           # 🎨 Estilos CSS compartilhados
├── cadastro.js         # 📝 Lógica do formulário de cadastro
├── lista.js            # 📋 Lógica da lista e CRUD
├── dados-exemplo.js    # 📚 Utilitários e dados de exemplo
├── README.md           # 📖 Este arquivo
└── DEPLOY.md           # 🌐 Instruções de deploy
```

## 🎨 Design

- **Layout**: Design moderno com gradientes e cards
- **Cores**: Paleta azul e roxo profissionais
- **Tipografia**: Segoe UI para melhor legibilidade
- **Animações**: Transições suaves e efeitos hover
- **Responsivo**: Adaptado para todos os tamanhos de tela

## 💾 Armazenamento

Os dados são salvos no localStorage do navegador:
- **Favoritos**: Lista de versículos favoritos
- **Persistência**: Dados mantidos entre sessões
- **Privacidade**: Dados ficam apenas no seu navegador

## 🔧 Customização

### Adicionar Mais Versículos
Edite o array `versiculosExemplo` em `dados-exemplo.js`:

```javascript
const versiculosExemplo = [
    {
        id: 6,
        livro: "Salmos",
        capitulo: 91,
        versiculo: "1",
        texto: "Aquele que habita no esconderijo do Altíssimo...",
        observacoes: "Salmo de proteção",
        referencia: "Salmos 91:1",
        dataCadastro: "18/10/2025",
        dataModificacao: "18/10/2025"
    }
    // Adicione mais versículos aqui
];
```

### Modificar Estilos
Personalize as cores e estilos editando `style.css`.

## 🌐 Deploy no GitHub Pages

1. Faça fork deste repositório
2. Vá em Settings > Pages
3. Selecione "Deploy from a branch"
4. Escolha "main" branch e "/ (root)"
5. Acesse seu site em `https://seu-usuario.github.io/biblia/`

Veja `DEPLOY.md` para instruções detalhadas.

## 📱 Compatibilidade

- ✅ Chrome/Edge 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Mobile browsers

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b nova-feature`
3. Commit suas mudanças: `git commit -m 'Adiciona nova feature'`
4. Push para a branch: `git push origin nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🙏 Agradecimentos

- Versículos baseados na Bíblia Sagrada
- Design inspirado em interfaces modernas
- Desenvolvido para a comunidade cristã

---

**Desenvolvido com ❤️ para o estudo bíblico**