# 🏢 Cadastro de Dias Presenciais

Aplicação web para gerenciar cadastro de dias presenciais dos funcionários, com armazenamento seguro no Firebase Firestore.

## 🚀 **Funcionalidades**

- ✅ **Cadastro de presenciais** - Nome + 2 dias da semana
- ✅ **Lista visual** - Tabela com todos os cadastros
- ✅ **Edição inline** - Modificar dados existentes
- ✅ **Exclusão segura** - Remover registros com confirmação
- ✅ **Validação robusta** - Frontend e backend protegidos
- ✅ **Design responsivo** - Funciona em mobile e desktop
- ✅ **Armazenamento na nuvem** - Firebase Firestore
- ✅ **Sistema seguro** - Variáveis de ambiente protegidas

## 📁 **Estrutura do Projeto**

```
presenciais/
├── presenciais.html        # Página principal
├── presenciais.css         # Estilos da aplicação
├── presenciais.js          # Lógica da aplicação
├── firebase-config-safe.js # Gerenciador seguro do Firebase
├── .env.example           # Template de configuração
├── .env.local            # Configuração local (não commitado)
├── .gitignore            # Proteção de arquivos sensíveis
└── SECURITY.md           # Documentação de segurança
```

## 🔧 **Tecnologias Utilizadas**

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase Firestore (NoSQL)
- **Segurança**: Variáveis de ambiente, validação multicamada
- **Deploy**: GitHub Actions + GitHub Pages
- **Responsividade**: CSS Grid + Media Queries

## 🛡️ **Segurança Implementada**

### **Frontend**
- Rate limiting (1 seg entre ações, máx 20 em 5 min)
- Validação de entrada (2-100 chars, regex pattern)
- Sanitização automática de dados
- Timeouts de 10 segundos
- Tratamento específico de erros

### **Backend (Firestore)**
- Regras de validação de schema
- Campos obrigatórios e tipos corretos
- Restrições de tamanho de dados
- Acesso restrito por coleção

### **Deploy**
- Credenciais em GitHub Secrets
- Variáveis de ambiente protegidas
- Domínios autorizados apenas
- Build automático seguro

## 📊 **Dados Armazenados**

```json
{
  "id": "documento_id_auto_gerado",
  "nome": "João Silva",
  "dias": ["Seg", "Qui"],
  "segunda": true,
  "terca": false,
  "quarta": false,
  "quinta": true,
  "sexta": false,
  "criadoEm": "timestamp",
  "atualizadoEm": "timestamp"
}
```

## 🚀 **Como Usar**

### **Desenvolvimento Local**
```bash
# 1. Clone o repositório
git clone https://github.com/MizaBragatti/ferramentas.github.io.git

# 2. Configure as variáveis (já preenchido)
cp presenciais/.env.example presenciais/.env.local

# 3. Execute localmente
cd ferramentas
python -m http.server 8000

# 4. Acesse: http://localhost:8000/presenciais/presenciais.html
```

### **Produção**
- URL: https://mizabragatti.github.io/ferramentas/presenciais/presenciais.html
- Deploy automático via GitHub Actions
- Configuração segura via GitHub Secrets

## 📱 **Interface**

### **Formulário de Cadastro**
- Campo nome (2-100 caracteres)
- Seleção de 2 dias da semana
- Validação em tempo real
- Feedback visual

### **Lista de Presenciais**
- Tabela organizada por dia
- Indicadores visuais (✓) para dias selecionados
- Botões de ação (editar/excluir)
- Ordenação por data de criação

## 🔍 **Validações**

- **Nome**: 2-100 caracteres, apenas letras, números, espaços, hífens
- **Dias**: Exatamente 2 dias selecionados
- **Duplicatas**: Não permite nomes duplicados
- **Rate limiting**: Previne spam e abuso
- **Timeouts**: Operações com limite de tempo

## 🎯 **Status do Projeto**

- ✅ **Funcional**: Aplicação totalmente operacional
- ✅ **Seguro**: Sistema de segurança implementado
- ✅ **Otimizado**: Código limpo e estrutura organizada
- ✅ **Documentado**: Documentação completa
- ✅ **Deploy**: Pronto para produção

---

**Desenvolvido com ❤️ para máxima segurança e usabilidade**