# 🎤 Transcritor de Áudio Web com Tradução# 🎤 Transcritor de Áudio Web



Uma aplicação web moderna para transcrever áudio em tempo real e traduzir automaticamente, usando Web Speech API e tradução instantânea.Uma aplicação web moderna para transcrever áudio em tempo real através do microfone, usando a Web Speech API do navegador.



## 🌟 Características Principais## 🌟 Características



- 🎯 **Interface Web Moderna**: Design responsivo e intuitivo- � **Interface Web Moderna**: Design responsivo e intuitivo

- 🎤 **Transcrição em Tempo Real**: Funciona diretamente no navegador- 🎤 **Transcrição em Tempo Real**: Funciona diretamente no navegador

- 🌍 **Tradução Automática**: Inglês → Português + outros idiomas- 🌍 **Múltiplos Idiomas**: Português, Inglês, Espanhol, Francês

- 💾 **Salvamento Automático**: Histórico local e download de arquivos- 💾 **Salvamento Automático**: Histórico local e download de arquivos

- 📱 **Totalmente Responsivo**: Desktop, tablet e mobile- 📱 **Responsivo**: Funciona em desktop e mobile

- ⚡ **Sem Instalação**: Abra e use imediatamente- ⚡ **Sem Instalação**: Abra e use imediatamente



## 🎯 Funcionalidades Completas## 🎯 Funcionalidades



### ✨ Core Features### Core Features

- ✅ **Transcrição em tempo real** do microfone- ✅ Transcrição em tempo real do microfone

- ✅ **Tradução automática instantânea** - ✅ **Tradução automática** (inglês → português + outros)

- ✅ **Layout lado a lado** (original + tradução)- ✅ Interface web moderna e responsiva

- ✅ **Múltiplos idiomas** de reconhecimento- ✅ Múltiplos idiomas de reconhecimento

- ✅ **Resultados provisórios** em tempo real- ✅ Resultados provisórios em tempo real

- ✅ **Modo contínuo** de gravação- ✅ Modo contínuo de gravação



### 🚀 Recursos Avançados### Recursos Avançados

- ✅ **Histórico de sessões** com traduções- ✅ **Layout lado a lado** (original + tradução)

- ✅ **Download de transcrições** bilíngues (.txt)- ✅ Histórico de sessões com traduções

- ✅ **Estatísticas detalhadas** (palavras, caracteres, duração)- ✅ Download de transcrições bilíngues

- ✅ **Configurações automáticas** salvas no navegador- ✅ Estatísticas (palavras, caracteres, duração)

- ✅ **Atalhos de teclado** para controle rápido- ✅ Configurações salvas automaticamente

- ✅ **Cache offline** (Service Worker)- ✅ Atalhos de teclado

- ✅ Cache offline (Service Worker)

### 🌍 Sistema de Tradução

- **Idiomas suportados**: Inglês, Português, Espanhol, Francês### 🌍 Tradução Automática

- **Tradução para**: Português, Espanhol, Francês, Alemão, Italiano- **Idiomas de origem**: Inglês, Português, Espanhol, Francês

- **API gratuita**: MyMemory Translation Service- **Idiomas de destino**: Português, Espanhol, Francês, Alemão, Italiano

- **Visualização simultânea**: Original e tradução em tempo real- **API gratuita**: MyMemory Translation

- **Histórico bilíngue**: Sessões salvas com ambos os textos- **Visualização simultânea**: Original e tradução lado a lado



## 📋 Requisitos do Sistema## 📋 Requisitos



### 🌐 Navegador e Hardware### 🌐 Para a Versão Web

- **Navegador**: Chrome, Edge, Safari ou Firefox (atualizados)- **Navegador Compatível**: Chrome, Edge, Safari ou Firefox

- **Microfone**: Funcional com permissões habilitadas- **Microfone**: Funcional e com permissões

- **Internet**: Conexão ativa para reconhecimento e tradução- **Internet**: Necessária para reconhecimento de voz

- **HTTPS**: Obrigatório para produção (localhost funciona sem)- **HTTPS**: Obrigatório para acesso ao microfone (exceto localhost)



### 🖥️ Compatibilidade de Navegadores### 🖥️ Navegadores Suportados

- ✅ **Chrome/Chromium** (Recomendado - melhor suporte)- ✅ **Chrome/Chromium** (Recomendado)

- ✅ **Microsoft Edge** (Excelente compatibilidade)- ✅ **Microsoft Edge**

- ✅ **Safari** (macOS/iOS - funcional)- ✅ **Safari** (macOS/iOS)

- ⚠️ **Firefox** (Suporte limitado da Web Speech API)- ⚠️ **Firefox** (Suporte limitado)



## 🚀 Como Usar## 🚀 Como Usar



### 📖 Início Rápido### 🌐 Versão Web (Recomendada)



1. **Abrir a aplicação:**1. **Abrir a aplicação:**

   - Abra `index.html` diretamente no navegador   - Abra o arquivo `index.html` no navegador

   - Ou use servidor local: `python -m http.server 8000`   - Ou acesse via servidor web local



2. **Primeira configuração:**2. **Primeira vez:**

   - Permita acesso ao microfone quando solicitado   - Permita acesso ao microfone quando solicitado

   - Verifique se aparece "Navegador compatível!"   - Verifique se aparece "Navegador compatível!" 



3. **Para transcrever áudio em inglês com tradução:**3. **Usando o transcritor:**

   - Configure idioma para **"English (US)"**   - Configure o idioma (recomendado: **Inglês** para melhor reconhecimento)

   - Ative **"Tradução Automática"** ✅   - Ative **"Tradução Automática"** para português

   - Mantenha **"Português"** como destino   - Clique em **"Iniciar Transcrição"**

   - Clique em **"Iniciar Transcrição"**   - Fale claramente próximo ao microfone

   - Reproduza seu áudio próximo ao microfone   - Veja transcrição e tradução aparecerem lado a lado

   - Veja transcrição (inglês) + tradução (português) lado a lado   - Clique em **"Parar"** quando terminar



### ⚙️ Configurações Disponíveis### ⚙️ Configurações



- **🌍 Idioma de origem**: Reconhecimento de voz (inglês, português, etc.)- **🌍 Idioma de origem**: Selecione o idioma do reconhecimento

- **🔄 Modo contínuo**: Reinicia automaticamente após pausas- **🔄 Modo Contínuo**: Reinicia automaticamente após pausas

- **👁️ Resultados provisórios**: Mostra texto enquanto você fala- **👁️ Resultados Provisórios**: Mostra texto enquanto você fala

- **🌐 Tradução automática**: Liga/desliga tradução em tempo real- **🌐 Tradução Automática**: Ativa/desativa tradução em tempo real

- **🎯 Idioma de destino**: Para qual idioma traduzir- **🎯 Idioma de destino**: Selecione para qual idioma traduzir



### ⌨️ Atalhos de Teclado### 🎤 Recomendação para Áudio em Inglês



- **`Ctrl + Espaço`**: Iniciar/Parar transcrição1. **Configure o idioma para "English (US)"**

- **`Ctrl + S`**: Baixar transcrição atual2. **Ative "Tradução Automática"**  

- **`Ctrl + Delete`**: Limpar transcrição atual3. **Mantenha "Português" como idioma de destino**

4. **Toque seu áudio em inglês próximo ao microfone**

## 📁 Estrutura do Projeto5. **Veja a transcrição em inglês + tradução em português simultaneamente**



```### ⌨️ Atalhos de Teclado

transcricao/

├── index.html      # Aplicação principal- `Ctrl + Espaço`: Iniciar/Parar transcrição

├── styles.css      # Design e estilos responsivos- `Ctrl + S`: Baixar transcrição

├── script.js       # Lógica de transcrição e tradução- `Ctrl + Delete`: Limpar transcrição

├── sw.js           # Service Worker (cache offline)

├── demo.html       # Página de demonstração e testes### 💾 Salvamento e Histórico

└── README.md       # Esta documentação

```- **Automático**: Sessões são salvas no navegador

- **Download**: Baixe arquivos .txt das transcrições

## 🎤 Guia para Áudio em Inglês- **Histórico**: Acesse as 20 sessões mais recentes



### 🎯 Configuração Recomendada## 📁 Estrutura do Projeto

1. **Idioma**: "English (US)" 

2. **Tradução**: ✅ Ativada```

3. **Destino**: "Português"transcricao/

4. **Modo contínuo**: ✅ Ativado├── index.html            # Página principal da aplicação

5. **Resultados provisórios**: ✅ Ativado├── styles.css            # Estilos e design responsivo  

├── script.js             # Lógica da Web Speech API

### 🔊 Dicas de Uso├── sw.js                 # Service Worker para cache

- **Qualidade do áudio**: Fale/reproduza próximo ao microfone├── README.md             # Documentação

- **Ruído de fundo**: Minimize para melhor precisão│

- **Velocidade da fala**: Moderada funciona melhor├── Versões Python (opcional):

- **Conexão**: Internet estável melhora a tradução├── main.py               # Versão Python completa

├── transcritor_alternativo.py  # Versão Python demo

## 🔧 Solução de Problemas├── src/

│   └── transcritor.py    # Classe Python

### ❌ Problemas Comuns├── requirements.txt      # Dependências Python

└── executar.bat         # Launcher Windows

**"Navegador não suporta reconhecimento de voz"**```

- Solução: Use Chrome, Edge ou Safari mais recentes

- Alternativa: Atualize seu navegador para versão mais nova## ⚙️ Configuração e Solução de Problemas



**"Permissão para usar o microfone negada"**### 🎤 Configuração do Microfone

- Chrome: `chrome://settings/content/microphone`

- Edge: `edge://settings/content/microphone`1. **Permissões do Navegador:**

- Safari: Preferências → Sites → Microfone   - Permita acesso ao microfone quando solicitado

   - Chrome: Configurações → Privacidade → Microfone

**"Nenhuma fala detectada"**   - Edge: Configurações → Cookies e permissões do site → Microfone

- Verifique se o microfone não está mudo

- Teste volume nas configurações do sistema2. **Teste do Microfone:**

- Confirme que outro programa não está usando o microfone   - Fale e veja se aparece "Gravando" na interface

- Fale mais próximo ao dispositivo   - Verifique se o microfone não está mudo

   - Teste em outras aplicações se necessário

**"Erro na tradução"**

- Verifique conexão com internet### 🌐 Servidor Web Local

- API pode ter limite temporário - tente novamente

- Frases muito longas podem falhar - divida em segmentosPara usar com HTTPS (recomendado):



**Não funciona no smartphone**```bash

- Use Chrome ou Safari mobile# Python 3

- Verifique permissões do microfone no navegadorpython -m http.server 8000

- Alguns dispositivos têm limitações de hardware

# Node.js (se instalado)

### 🌐 Hospedagem e Deploynpx serve .



**GitHub Pages**# PHP (se instalado)  

```bashphp -S localhost:8000

git add .```

git commit -m "Transcritor Web com Tradução"

git push origin mainAcesse: `http://localhost:8000`

```

Acesso: `https://seu-usuario.github.io/transcricao`## 🔧 Recursos Técnicos



**Netlify/Vercel**### 🌐 Tecnologias Web

- Faça upload da pasta do projeto- **Frontend:** HTML5, CSS3, JavaScript ES6+

- Deploy automático com HTTPS- **API:** Web Speech API (nativa do navegador)

- Domínio personalizado disponível- **Armazenamento:** LocalStorage para configurações e histórico

- **Cache:** Service Worker para uso offline

**Servidor Próprio**- **Design:** Responsivo com CSS Grid/Flexbox

- Certifique-se de ter certificado SSL (HTTPS obrigatório)

- Configure headers CORS se necessário### 📊 Formatos Suportados

- Teste em ambiente local primeiro- **Idiomas:** pt-BR, en-US, es-ES, fr-FR (extensível)

- **Saída:** Arquivos .txt com timestamp

## 🎯 Casos de Uso- **Encoding:** UTF-8 completo



- **📚 Estudos**: Transcrever aulas e palestras em inglês## 📝 Exemplo de Saída

- **🎬 Legendas**: Criar legendas para vídeos

- **📞 Reuniões**: Atas bilíngues de meetings internacionais  ```

- **📖 Pesquisa**: Transcrever entrevistas e documentários=== TRANSCRIÇÃO DE ÁUDIO WEB ===

- **🎤 Podcasts**: Converter áudio para texto + traduçãoData: 02/11/2025 14:30:15

- **📝 Acessibilidade**: Tornar conteúdo mais acessívelIdioma: Português (Brasil)

================================================

## 🔬 Tecnologias Utilizadas

[14:30:20] Olá, este é um teste do transcritor web

- **Frontend**: HTML5, CSS3, JavaScript ES6+[14:30:25] O sistema funciona diretamente no navegador

- **API de Voz**: Web Speech API (nativa do navegador)[14:30:30] As transcrições são salvas automaticamente

- **API de Tradução**: MyMemory Translation (gratuita)

- **Armazenamento**: LocalStorage para configurações e histórico--- Estatísticas ---

- **Cache**: Service Worker para funcionamento offlineTotal de palavras: 23

- **Design**: CSS Grid/Flexbox para responsividadeTotal de caracteres: 156

Número de segmentos: 3

## 📊 Limitações ConhecidasDuração da sessão: 2:15

```

### Técnicas

- **Internet obrigatória**: Reconhecimento e tradução precisam de conexão## 🚨 Limitações

- **Precisão variável**: Depende da qualidade do áudio e sotaque

- **Limites de API**: Serviço gratuito pode ter restrições de uso### Técnicas

- **Navegador específico**: Melhor performance no Chrome/Edge- **Internet:** Requer conexão ativa para reconhecimento

- **Navegador:** Funcionalidade limitada pela Web Speech API

### Funcionais  - **HTTPS:** Necessário para produção (microfone bloqueado em HTTP)

- **HTTPS necessário**: Microfone bloqueado em HTTP (exceto localhost)- **Precisão:** Depende da qualidade do áudio e ruído ambiente

- **Idiomas limitados**: Baseado no suporte da Web Speech API

- **Traduções automáticas**: Podem não ser 100% precisas### Compatibilidade

- **Performance mobile**: Pode variar entre dispositivos- **Chrome/Edge:** Melhor suporte e precisão

- **Safari:** Funcional, mas com limitações

## 📄 Licença- **Firefox:** Suporte experimental

- **Mobile:** Funcionamento pode variar por dispositivo

Este projeto é de **uso livre e educacional**. 

## 🛠️ Solução de Problemas

## 🤝 Contribuições

### ❌ "Navegador não suporta reconhecimento de voz"

Contribuições são bem-vindas! - **Solução:** Use Chrome, Edge ou Safari mais recentes

- **Alternativa:** Atualize seu navegador

- 🐛 **Reportar bugs**

- 💡 **Sugerir melhorias** ### ❌ "Permissão para usar o microfone negada"

- 🔧 **Enviar pull requests**- **Chrome:** chrome://settings/content/microphone

- 📚 **Melhorar documentação**- **Edge:** edge://settings/content/microphone  

- **Safari:** Preferências → Sites → Microfone

## 📞 Suporte

### ❌ "Nenhuma fala detectada"

Se encontrar problemas:- Verifique se o microfone não está mudo

- Teste o volume nas configurações do sistema

1. Consulte a seção "Solução de Problemas" acima- Fale mais próximo ao microfone

2. Verifique a compatibilidade do seu navegador- Verifique se outro programa não está usando o microfone

3. Teste as permissões do microfone

4. Confirme sua conexão com internet### ❌ "Erro de rede"

- Verifique sua conexão com internet

---- Tente recarregar a página

- Use uma conexão mais estável

**🚀 Desenvolvido por:** Miza  

**📅 Data:** Novembro 2025  ### ❌ Não funciona em smartphone

**🏷️ Versão:** 1.0 - Web com Tradução Automática- Alguns navegadores mobile têm limitações
- Tente usar Chrome ou Safari mobile
- Verifique permissões do microfone no app

## 🚀 Deploy e Hospedagem

### GitHub Pages
```bash
git add .
git commit -m "Transcritor Web"
git push origin main
```
Acesse: `https://seu-usuario.github.io/transcricao`

### Netlify/Vercel
1. Faça upload da pasta do projeto
2. Configure domínio personalizado
3. HTTPS automático habilitado

### Servidor Próprio
- Certifique-se de ter certificado SSL (HTTPS)
- Configure headers CORS se necessário

## 📄 Licença

Este projeto é de uso livre e educacional.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

---

**Desenvolvido por:** Miza  
**Data:** Novembro 2025