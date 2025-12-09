# 🎯 INSTRUÇÕES - LEIA PRIMEIRO!

## ⚡ Ação Imediata Necessária

Antes de usar o sistema, você PRECISA fazer isso:

### 1. Configure o Firebase (5 minutos)

Abra o arquivo: **QUICK_START.md**

Ou siga estes passos ultra-rápidos:

1. Vá para: https://console.firebase.google.com/
2. Crie um projeto chamado "sistema-presenca"
3. Ative "Authentication" > "E-mail/senha"
4. Ative "Realtime Database" em modo teste
5. Copie suas credenciais do Firebase
6. Abra o arquivo `js/firebase-config.js`
7. Cole suas credenciais substituindo os valores de exemplo
8. Salve o arquivo

### 2. Configure as Regras de Segurança

No Firebase Console > Realtime Database > Regras, cole:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Clique em "Publicar".

### 3. Teste Localmente

1. Abra `login.html` no navegador
2. Crie uma conta com seu email
3. Faça login
4. Use o sistema!

### 4. Faça Deploy

```bash
git add .
git commit -m "Sistema de presença com Firebase configurado"
git push
```

Depois adicione `mizabragatti.github.io` em:
Firebase > Authentication > Settings > Authorized domains

---

## 📋 Checklist Rápido

- [ ] Criei projeto no Firebase
- [ ] Ativei Authentication (E-mail/senha)
- [ ] Ativei Realtime Database
- [ ] Configurei regras de segurança
- [ ] Colei minhas credenciais em `js/firebase-config.js`
- [ ] Testei criando uma conta
- [ ] Testei fazendo login
- [ ] Fiz commit e push

---

## 🎓 Arquivos de Ajuda

1. **QUICK_START.md** ← Comece aqui! (5 min)
2. **FIREBASE_SETUP.md** ← Guia completo
3. **README.md** ← Como usar o sistema
4. **CHANGELOG.md** ← O que foi implementado

---

## ⚠️ IMPORTANTE

**SEM CONFIGURAR O FIREBASE, O SISTEMA NÃO VAI FUNCIONAR CORRETAMENTE!**

O sistema vai funcionar em modo offline (localStorage), mas você não terá:
- ❌ Sincronização entre dispositivos
- ❌ Backup em nuvem
- ❌ Acesso de qualquer lugar
- ❌ Proteção por login

**Configure o Firebase para ter acesso completo a todos os recursos!**

---

## 🎉 Depois de Configurar

Você poderá:
- ✅ Acessar de qualquer dispositivo
- ✅ Criar múltiplas contas de professor
- ✅ Ter backup automático
- ✅ Sincronizar dados em tempo real
- ✅ Trabalhar offline (quando necessário)

---

**Qualquer dúvida, consulte os arquivos de documentação!**

Boa sorte! 🚀
