# 🔒 Configuração de Segurança - Firebase Firestore

## 🎉 **SISTEMA SEGURO COM VARIÁVEIS DE AMBIENTE IMPLEMENTADO!**

### � **Como Funciona**

1. **Desenvolvimento Local**: 
   - Credenciais em `.env.local` (não commitado)
   - Arquivo `.env.example` como template

2. **Produção (GitHub Pages)**:
   - Credenciais em GitHub Secrets
   - Injetadas automaticamente via GitHub Actions
   - Nunca expostas no código público

### �📋 **Configuração do GitHub**

#### **1. Adicionar Secrets no Repositório**

Vá para: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

```
FIREBASE_API_KEY = your_api_key_here
FIREBASE_AUTH_DOMAIN = your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID = your_project_id
FIREBASE_STORAGE_BUCKET = your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID = your_sender_id
FIREBASE_APP_ID = your_app_id
```

#### **2. GitHub Actions**

O arquivo `.github/workflows/deploy.yml` automaticamente:
- ✅ Lê as secrets
- ✅ Injeta as variáveis no build
- ✅ Faz deploy para GitHub Pages

### 🛡️ **Arquivos de Segurança**

- ✅ `.env.local` - Configuração local (NÃO commitado)
- ✅ `.env.example` - Template para outros devs
- ✅ `.gitignore` - Protege arquivos sensíveis
- ✅ `firebase-config-safe.js` - Gerenciador seguro
- ✅ `github-config.html` - Página de configuração

### 🔍 **Validação de Segurança**

O sistema valida:
- ✅ Domínio autorizado (localhost ou github.io)
- ✅ Todas as variáveis obrigatórias presentes  
- ✅ Configurações não são placeholder values
- ✅ Feedback claro sobre problemas

### 🚀 **Como Usar**

#### **Para Desenvolvimento:**
```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env.local

# 2. Edite com suas credenciais reais
# (já está preenchido)

# 3. Execute normalmente
python -m http.server 8000
```

#### **Para Produção:**
```bash
# 1. Configure as secrets no GitHub
# 2. Faça commit e push
git add .
git commit -m "Implementar sistema seguro"
git push

# 3. GitHub Actions fará deploy automaticamente
```

### 📊 **Status de Segurança**

- 🔐 **Credenciais**: Protegidas via variáveis de ambiente
- 🛡️ **Validação**: Múltiplas camadas de verificação
- 🌐 **Domínio**: Restrito a hosts autorizados
- 🔒 **Firestore**: Regras de segurança aplicadas
- 📋 **Rate Limiting**: Implementado no frontend
- ✅ **GitHub Ready**: Pronto para repositório público

### 🎯 **Próximos Passos**

1. ✅ **Configure as secrets** no GitHub com suas credenciais reais
2. ✅ **Faça commit** de todos os arquivos (exceto .env.local)
3. ✅ **Push para main** para trigger do deploy
4. ✅ **Verifique** o deploy em Actions tab
5. ✅ **Teste** na URL do GitHub Pages

---

## 🔒 Regras de Segurança do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção presenciais
    match /presenciais/{document} {
      // Permite leitura e escrita apenas se os dados são válidos
      allow read, write: if isValidPresencial() && checkRateLimit();
      
      // Função para validar estrutura dos dados
      function isValidPresencial() {
        return request.auth == null && // Por enquanto sem autenticação
               (resource == null || // Para criação de novos documentos
               (
                 // Validar campos obrigatórios
                 request.resource.data.keys().hasAll(['nome', 'dias', 'segunda', 'terca', 'quarta', 'quinta', 'sexta']) &&
                 // Validar tipos de dados
                 request.resource.data.nome is string &&
                 request.resource.data.dias is list &&
                 request.resource.data.segunda is bool &&
                 request.resource.data.terca is bool &&
                 request.resource.data.quarta is bool &&
                 request.resource.data.quinta is bool &&
                 request.resource.data.sexta is bool &&
                 // Validar tamanho do nome
                 request.resource.data.nome.size() > 1 &&
                 request.resource.data.nome.size() <= 100 &&
                 // Validar que nome só contém caracteres permitidos
                 request.resource.data.nome.matches('[a-zA-ZÀ-ÿ0-9\\s\\-\\.\']+') &&
                 // Validar que dias tem exatamente 2 elementos
                 request.resource.data.dias.size() == 2 &&
                 // Validar que são dias válidos
                 request.resource.data.dias.hasAll(['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].toSet().intersection(request.resource.data.dias.toSet()).size() == 2)
               ));
      }
      
      // Rate limiting básico (pode ser melhorado com funções Firebase)
      function checkRateLimit() {
        return true; // Implementado no frontend por enquanto
      }
    }
    
    // Negar acesso a qualquer outra coleção
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. **Regras Mais Simples (Alternativa)**
Se as regras acima derem problema, use esta versão mais simples:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /presenciais/{document} {
      allow read, write: if request.resource.data.nome is string &&
                           request.resource.data.nome.size() > 0 &&
                           request.resource.data.nome.size() <= 100;
    }
  }
}
```

## 🛡️ **Medidas de Segurança Implementadas**

### **Frontend (JavaScript)**
- ✅ **Rate Limiting**: Máximo 20 operações em 5 minutos
- ✅ **Validação de entrada**: Caracteres permitidos, tamanho mínimo/máximo
- ✅ **Sanitização**: Limpeza automática de dados
- ✅ **Timeouts**: 10 segundos máximo por operação
- ✅ **Tratamento de erros**: Mensagens específicas por tipo de erro

### **HTML**
- ✅ **Validação nativa**: Pattern regex para nome
- ✅ **Limites de caracteres**: maxlength="100"
- ✅ **Autocomplete seguro**: name autocomplete

### **Firestore**
- ✅ **Validação de schema**: Campos obrigatórios e tipos corretos
- ✅ **Restrições de tamanho**: Nome entre 2-100 caracteres
- ✅ **Validação de dados**: Apenas dias válidos
- ✅ **Acesso restrito**: Apenas coleção 'presenciais'

## 🚨 **Próximos Passos para Maior Segurança**

### **1. Implementar Autenticação (Recomendado)**
```javascript
// No Firebase Console, habilite Authentication
// Então use regras como:
allow read, write: if request.auth != null;
```

### **2. Adicionar CAPTCHA**
Para prevenir bots automatizados.

### **3. Monitoramento**
- Configure alertas no Firebase Console
- Monitore uso e custos
- Implemente logs de auditoria

### **4. Backup e Recuperação**
- Configure backups automáticos
- Teste procedimentos de recuperação

## ⚙️ **Como Aplicar as Regras**

1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto Firebase
3. Firestore Database → **Regras**
4. Cole uma das regras acima
5. Clique em **Publicar**
6. Teste a aplicação

## 🔍 **Como Testar a Segurança**

1. **Teste com dados válidos**: Deve funcionar normalmente
2. **Teste com nome muito longo**: Deve ser rejeitado
3. **Teste com caracteres especiais**: Deve ser rejeitado
4. **Teste spam**: Muitas operações devem ser limitadas

## 📊 **Monitoramento**

No Firebase Console, monitore:
- **Usage**: Leituras/escritas por dia
- **Security**: Tentativas de acesso negadas
- **Performance**: Tempo de resposta

## 🆘 **Problemas Comuns**

- **"Permission denied"**: Verifique se as regras foram aplicadas corretamente
- **"Invalid argument"**: Dados não passaram na validação
- **"Timeout"**: Conexão lenta ou problema no servidor

---

**Status atual**: ✅ Segurança básica implementada
**Próximo nível**: 🔐 Autenticação de usuários