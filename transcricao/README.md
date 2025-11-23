# 🎤 Transcritor de Áudio Web

Uma aplicação web simples e moderna para transcrever áudio em tempo real com tradução automática, usando Web Speech API.

## 🌟 Características

- 🎤 **Transcrição em Tempo Real**: Funciona diretamente no navegador
- 🌍 **Tradução Automática**: Tradução instantânea para múltiplos idiomas
- 💾 **Download de Transcrições**: Salve suas transcrições em arquivo .txt
- 📱 **Responsivo**: Funciona em desktop e mobile
- ⚡ **Sem Instalação**: Abra e use imediatamente

## 🎯 Funcionalidades

### Core Features
- ✅ Transcrição em tempo real do microfone
- ✅ Tradução automática (inglês → português + outros)
- ✅ Layout lado a lado (original + tradução)
- ✅ Múltiplos idiomas de reconhecimento
- ✅ Resultados provisórios em tempo real
- ✅ Modo contínuo de gravação
- ✅ Download de transcrições
- ✅ Estatísticas (palavras e caracteres)

## 🚀 Como Usar

### Uso Básico

1. **Abra o arquivo `index.html` no navegador**
   - Recomendado: Chrome, Edge ou Safari (últimas versões)

2. **Permita o acesso ao microfone**
   - O navegador solicitará permissão na primeira vez

3. **Configure o idioma**
   - Selecione o idioma de fala (Inglês, Português, etc.)
   - Ative a tradução automática se desejar
   - Escolha o idioma de destino para tradução

4. **Inicie a transcrição**
   - Clique em "Iniciar"
   - Comece a falar
   - O texto aparecerá em tempo real

5. **Gerencie o conteúdo**
   - Use "Parar" para encerrar
   - "Limpar" para apagar tudo
   - "Baixar" para salvar em arquivo .txt

## ⚙️ Configurações Disponíveis

### Idiomas Suportados
- 🇺🇸 Inglês (US)
- 🇧🇷 Português (Brasil)
- 🇪🇸 Espanhol
- 🇫🇷 Francês

### Opções de Tradução
- Português
- Espanhol
- Francês
- Alemão
- Italiano

### Modos de Operação
- **Modo Contínuo**: Mantém o reconhecimento ativo
- **Resultados Provisórios**: Mostra texto enquanto você fala

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilização moderna e responsiva
- **JavaScript ES6+**: Lógica da aplicação
- **Web Speech API**: Reconhecimento de voz
- **MyMemory Translation API**: Tradução automática
- **Font Awesome**: Ícones

## 📋 Requisitos

### Navegadores Compatíveis
- ✅ Google Chrome (recomendado)
- ✅ Microsoft Edge
- ✅ Safari (macOS/iOS)
- ❌ Firefox (suporte limitado)

### Permissões Necessárias
- Acesso ao microfone
- Conexão com internet (para tradução)

## 🔧 Estrutura do Projeto

```
transcricao/
│
├── index.html          # Página principal
├── styles.css          # Estilos da aplicação
├── script.js           # Lógica JavaScript
├── sw.js              # Service Worker (cache)
└── README.md          # Este arquivo
```

## 💡 Dicas de Uso

1. **Melhor Qualidade de Áudio**
   - Use um microfone externo de boa qualidade
   - Evite ambientes barulhentos
   - Fale de forma clara e pausada

2. **Transcrição Mais Precisa**
   - Ative "Resultados Provisórios" para ver o texto sendo formado
   - Use "Modo Contínuo" para sessões longas
   - Fale próximo ao microfone

3. **Tradução**
   - A tradução funciona melhor com frases completas
   - Aguarde alguns segundos para a tradução aparecer
   - A qualidade depende da API de tradução

## 🐛 Solução de Problemas

### O microfone não funciona
- Verifique se o navegador tem permissão de acesso ao microfone
- Confira se o microfone está conectado e funcionando
- Teste em outro navegador (Chrome recomendado)

### A tradução não aparece
- Verifique sua conexão com a internet
- Aguarde alguns segundos após a transcrição
- Tente recarregar a página

### Navegador não suportado
- Use Chrome, Edge ou Safari mais recentes
- Atualize seu navegador para a versão mais recente

## 🔐 Privacidade e Segurança

- ✅ Todo o processamento de áudio acontece no navegador
- ✅ Nenhum áudio é enviado para servidores (apenas texto para tradução)
- ✅ Dados salvos apenas localmente (localStorage)
- ✅ Sem rastreamento ou analytics

## 📝 Notas Importantes

- A Web Speech API usa os servidores do Google para reconhecimento
- A tradução usa a API MyMemory (gratuita e pública)
- Requer conexão com internet para funcionar
- As transcrições são salvas apenas no navegador

## 🎨 Personalização

Para personalizar cores e estilos, edite o arquivo `styles.css`:
- Gradiente de fundo: linhas 9-10
- Cores dos botões: linhas 107-177
- Tamanho da área de transcrição: linhas 300-305

## 🤝 Contribuições

Este é um projeto simples e funcional. Sugestões são bem-vindas!

## 📄 Licença

Projeto de código aberto. Use livremente para fins pessoais ou educacionais.

---

**Desenvolvido com ❤️ para facilitar a transcrição e tradução de áudio**

Para suporte ou dúvidas, verifique a documentação da [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
