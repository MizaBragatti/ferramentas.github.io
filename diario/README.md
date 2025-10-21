# 📖 Diário Online

> Um diário pessoal online conectado ao Firestore para armazenamento seguro na nuvem.

## 🎯 Demo

**🔗 Acesse a aplicação:** [https://mizabragatti.github.io/ferramentas.github.io/diario/](https://mizabragatti.github.io/ferramentas.github.io/diario/)

## ✨ Funcionalidades

- ✍️ **Escrever entradas** do diário com data e hora
- 📖 **Visualizar entradas** anteriores em ordem cronológica
- ✏️ **Editar entradas** existentes
- 🗑️ **Excluir entradas** com confirmação
- 🔐 **Autenticação segura** (Firebase Auth)
- ☁️ **Sincronização automática** com Firestore
- � **Pesquisa** nas entradas
- �📱 **Interface responsiva** (funciona em mobile)

## 🛡️ Segurança

- **Dados privados:** Cada usuário vê apenas suas próprias entradas
- **Autenticação obrigatória:** Todas as operações requerem login
- **Regras do Firestore:** Proteção a nível de banco de dados
- **Validação frontend:** Prevenção contra XSS

## 🚀 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Firebase (Firestore + Authentication)
- **UI Framework:** Bootstrap 5
- **Ícones:** Font Awesome
- **Hosting:** GitHub Pages

## 📱 Como Usar

1. **Acesse** a aplicação no link acima
2. **Crie uma conta** com email e senha
3. **Faça login** com suas credenciais
4. **Escreva** suas primeiras entradas no diário
5. **Gerencie** suas entradas (editar, excluir, pesquisar)

## 🔧 Desenvolvimento Local

### Pré-requisitos
- Node.js instalado
- Projeto Firebase configurado

### Instalação
```bash
# Clonar repositório
git clone https://github.com/MizaBragatti/ferramentas.github.io.git

# Navegar para pasta do diário
cd ferramentas.github.io/diario

# Instalar dependências
npm install

# Configurar Firebase (ver FIREBASE_SETUP.md)

# Executar localmente
npm start
```

### Arquivos de Configuração
- `FIREBASE_SETUP.md` - Instruções detalhadas do Firebase
- `GITHUB_DEPLOY.md` - Guia para publicação
- `QUICK_TEST.md` - Testes e verificações

## 📊 Estrutura do Projeto

```
diario/
├── index.html              # Página principal
├── css/
│   └── style.css          # Estilos personalizados
├── js/
│   ├── app.js            # Aplicação principal
│   ├── auth.js           # Autenticação
│   └── diary.js          # Funcionalidades do diário
├── config/
│   └── firebase-config.js # Configurações do Firebase
├── debug-loading.html     # Ferramenta de debug
├── test-simple.html      # Teste do Firebase
└── docs/                 # Documentação
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 👤 Autor

**Miza Bragatti**
- GitHub: [@MizaBragatti](https://github.com/MizaBragatti)
- Projeto: [ferramentas.github.io](https://github.com/MizaBragatti/ferramentas.github.io)

## 🙏 Agradecimentos

- Firebase pela infraestrutura backend
- Bootstrap pela framework de UI
- Font Awesome pelos ícones
- GitHub Pages pelo hosting gratuito