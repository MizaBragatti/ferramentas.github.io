# 📇 Cartão de Visitas Digital com QR Code

Sistema web simples e elegante para criar cartões de visitas digitais com QR Code integrado. Ao escanear o QR Code, as pessoas são direcionadas automaticamente para seu cartão de visitas online.

## ✨ Funcionalidades

- 📱 **Cartão de Visitas Responsivo** - Design moderno que se adapta a qualquer dispositivo
- 🔳 **Geração de QR Code** - QR Code gerado automaticamente apontando para seu cartão
- 💾 **Salvar Contato** - Botão para baixar arquivo .vcf (vCard) e adicionar aos contatos
- 🎨 **Design Moderno** - Interface com gradientes, animações e efeitos visuais
- 🌐 **Redes Sociais** - Links para LinkedIn, GitHub, Instagram, Twitter e WhatsApp
- 📥 **Download do QR Code** - Baixe o QR Code como imagem PNG

## 🚀 Como Usar

### 1. Personalizar suas Informações

Abra o arquivo `script.js` e edite o objeto `cardData` com suas informações pessoais:

```javascript
const cardData = {
    name: "Seu Nome Completo",
    jobTitle: "Seu Cargo/Profissão",
    company: "Nome da Empresa",
    phone: "+55 11 99999-9999",
    phoneRaw: "+5511999999999",
    email: "seu.email@email.com",
    location: "Sua Cidade, Estado",
    website: "https://seusite.com.br",
    websiteDisplay: "seusite.com.br",
    profilePhoto: "URL_DA_SUA_FOTO",
    social: {
        linkedin: "https://linkedin.com/in/seu-perfil",
        github: "https://github.com/seu-usuario",
        instagram: "https://instagram.com/seu-perfil",
        twitter: "https://twitter.com/seu-usuario",
        whatsapp: "https://wa.me/5511999999999"
    }
};
```

### 2. Adicionar sua Foto de Perfil

Você tem duas opções:

**Opção A:** Usar uma URL de imagem online
```javascript
profilePhoto: "https://seusite.com/foto.jpg"
```

**Opção B:** Adicionar imagem local
1. Coloque sua foto na pasta do projeto (ex: `foto-perfil.jpg`)
2. Atualize o caminho:
```javascript
profilePhoto: "foto-perfil.jpg"
```

### 3. Testar Localmente

Abra o arquivo `index.html` diretamente no navegador ou use um servidor local:

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (http-server)
npx http-server

# Com PHP
php -S localhost:8000
```

Acesse: `http://localhost:8000`

## 🌐 Hospedagem Gratuita

### GitHub Pages (Recomendado)

1. **Crie um repositório no GitHub** e faça upload dos arquivos
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione a branch `main` e pasta `/ (root)`
4. Clique em **Save**
5. Seu site estará disponível em: `https://seu-usuario.github.io/nome-repositorio`

### Netlify

1. Acesse [netlify.com](https://www.netlify.com/)
2. Faça login e clique em **Add new site** → **Deploy manually**
3. Arraste a pasta do projeto
4. Pronto! Seu site estará no ar em segundos
5. Você pode personalizar o domínio em **Site settings**

### Vercel

1. Acesse [vercel.com](https://vercel.com/)
2. Faça login e clique em **Add New** → **Project**
3. Importe o repositório do GitHub ou faça upload manual
4. Clique em **Deploy**
5. Seu site estará disponível em poucos segundos

## 📱 Como Usar o QR Code

Após hospedar seu site:

1. **Acesse a URL do seu cartão** hospedado
2. O QR Code será gerado automaticamente com a URL atual
3. **Clique em "Baixar QR Code"** para salvar a imagem
4. **Imprima ou compartilhe** o QR Code em:
   - Cartões de visita físicos
   - Assinatura de e-mail
   - Redes sociais
   - Apresentações
   - Materiais impressos

Quando alguém escanear o QR Code, será direcionado diretamente para seu cartão de visitas digital!

## 🎨 Personalização Avançada

### Alterar Cores

Edite as variáveis CSS em `styles.css`:

```css
:root {
    --primary-color: #6366f1;      /* Cor principal */
    --secondary-color: #8b5cf6;    /* Cor secundária */
    --text-dark: #1f2937;          /* Texto escuro */
    --text-light: #6b7280;         /* Texto claro */
}
```

### Adicionar Mais Redes Sociais

1. No `index.html`, adicione um novo ícone na seção `.social-links`:

```html
<a href="https://tiktok.com/@seu-usuario" target="_blank" class="social-icon">
    <i class="fab fa-tiktok"></i>
</a>
```

2. Confira ícones disponíveis em [Font Awesome](https://fontawesome.com/icons)

### Personalizar QR Code

No `script.js`, na função `generateQRCode()`, você pode ajustar:

```javascript
new QRCode(qrContainer, {
    text: currentURL,
    width: 256,              // Largura (px)
    height: 256,             // Altura (px)
    colorDark: "#1f2937",    // Cor do QR Code
    colorLight: "#ffffff",   // Cor de fundo
    correctLevel: QRCode.CorrectLevel.H  // Nível de correção de erro (L, M, Q, H)
});
```

## 📋 Estrutura de Arquivos

```
cartao-visita/
│
├── index.html          # Estrutura HTML do cartão
├── styles.css          # Estilos e design
├── script.js           # Lógica e geração de QR Code
└── README.md           # Documentação (este arquivo)
```

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com gradientes e animações
- **JavaScript** - Interatividade e geração de vCard
- **QRCode.js** - Biblioteca para geração de QR Codes
- **Font Awesome** - Ícones de redes sociais

## 📝 Formato vCard

O botão "Salvar Contato" gera um arquivo `.vcf` compatível com:
- 📱 iOS (iPhone/iPad)
- 🤖 Android
- 💻 Windows/Mac/Linux
- 📧 Clientes de e-mail (Outlook, Gmail, etc.)

## 🔧 Solução de Problemas

### QR Code não aparece
- Verifique se está acessando via HTTP/HTTPS (não funciona abrindo arquivo local diretamente)
- Confira se a biblioteca QRCode.js está carregando (verifique o console do navegador)

### Imagem de perfil não carrega
- Verifique se a URL da imagem está correta e acessível
- Se usar imagem local, certifique-se de que está na mesma pasta

### Links não funcionam
- Confirme se as URLs estão completas com `https://`
- Verifique se não há espaços nas URLs

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins pessoais e comerciais.

## 💡 Dicas

- **Mantenha as informações atualizadas** - Revise periodicamente seus dados
- **Use uma foto profissional** - Causa melhor impressão
- **Teste em diferentes dispositivos** - Garanta boa visualização mobile
- **Compartilhe amplamente** - Use o QR Code em todos os seus materiais
- **Analítica (opcional)** - Considere adicionar Google Analytics para rastrear visitantes

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Sinta-se livre para adaptar conforme suas necessidades.

---

**Desenvolvido com ❤️ para facilitar networking profissional**
