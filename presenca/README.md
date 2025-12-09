# 🎵 Sistema de Presença - Aulas Musicais

Sistema completo para controle de presença em aulas musicais aos sábados, com estrutura modular, sistema de alertas automáticos e **sincronização em nuvem com Firebase**.

## ⭐ Novidades - Versão Cloud

### 🔐 Sistema de Autenticação
- **Login seguro** para professores
- Criação de contas individuais
- Recuperação de senha por email
- Cada professor tem seus próprios dados isolados

### ☁️ Sincronização Multi-Dispositivo
- **Acesse de qualquer lugar** - computador, tablet, celular
- Dados sincronizados em tempo real via Firebase
- Backup automático em nuvem
- Funciona offline com localStorage como fallback

## 📋 Funcionalidades

### ✅ Recursos Implementados

1. **Sistema de Login e Autenticação** 🆕
   - Login com email e senha
   - Criação de conta de professor
   - Recuperação de senha
   - Logout seguro
   - Menu de usuário em todas as páginas

2. **Cadastro de Alunos**
   - ID gerado automaticamente
   - Campos: Nome, Telefone, Módulo Inicial
   - Edição e exclusão de alunos
   - Busca por nome
   - Importação/Exportação (JSON, CSV, PDF)

3. **Controle de Presença**
   - Marcação rápida com botões P (Presente) e F (Faltou)
   - Filtros por módulo e fase
   - Seleção de data
   - Indicadores visuais de alertas em tempo real
   - Resumo da presença do dia
   - Sincronização automática

4. **Sistema de Alertas Automáticos**
   - 🟠 **25% de faltas**: Aviso preventivo (laranja)
   - 🔴 **40% de faltas**: Alerta crítico - deve repetir módulo (vermelho)
   - Cálculo automático por módulo
   - Indicadores visuais na tela de presença

5. **Estrutura Modular**
   - 4 Módulos por ano
   - 4 Fases por módulo
   - Configuração de datas e número de sábados esperados
   - Gestão flexível de módulos e fases

6. **Relatórios Completos**
   - Dashboard com visão geral
   - Alertas críticos e avisos em destaque
   - Estatísticas por módulo
   - Histórico detalhado por aluno com breakdown por fase
   - Exportação em JSON, CSV e PDF

## 🚀 Como Usar

### 0. Configuração Inicial do Firebase ⚠️ IMPORTANTE

**ANTES de usar o sistema, você precisa configurar o Firebase:**

1. Leia o arquivo **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** com instruções detalhadas
2. Configure suas credenciais no arquivo `js/firebase-config.js`
3. Configure as regras de segurança no Firebase Console
4. Ative a autenticação por email/senha

### 1. Primeira Vez
1. Abra `login.html` no navegador
2. Clique em "Criar nova conta"
3. Preencha seus dados (nome, email, senha)
4. Faça login com sua conta
5. Vá em "Gestão de Módulos"
6. Configure as datas das fases (opcional)

### 2. Cadastrar Alunos
1. Vá em "Cadastro de Alunos"
2. Preencha: Nome, Telefone, Módulo Inicial
3. Clique em "Adicionar Aluno"
4. O ID será gerado automaticamente

### 3. Marcar Presença
1. Vá em "Marcar Presença"
2. Selecione a data da aula (padrão: hoje)
3. Escolha o módulo/fase (ou deixe "Todos")
4. Para cada aluno, clique em:
   - **P** = Presente
   - **F** = Faltou
5. Os dados são salvos automaticamente
6. Alunos com alertas aparecerão destacados:
   - 🟠 Laranja = 25% a 39% de faltas (aviso)
   - 🔴 Vermelho = 40%+ de faltas (crítico - repetir módulo)

### 4. Ver Relatórios
1. Vá em "Relatórios"
2. Visualize:
   - Alertas críticos e avisos
   - Estatísticas gerais
   - Detalhes por módulo
   - Histórico individual de cada aluno
3. Exporte os dados em JSON ou CSV

## 📊 Estrutura do Curso

```
Ano Letivo
├── Módulo 1
│   ├── Fase 1 (≈4 sábados)
│   ├── Fase 2 (≈4 sábados)
│   ├── Fase 3 (≈4 sábados)
│   └── Fase 4 (≈4 sábados)
├── Módulo 2
│   └── ... (mesma estrutura)
├── Módulo 3
│   └── ... (mesma estrutura)
└── Módulo 4
    └── ... (mesma estrutura)
```

## ⚠️ Sistema de Alertas

### Níveis de Alerta

| Faltas | Status | Cor | Ação |
|--------|--------|-----|------|
| < 25% | ✅ Regular | Verde | Nenhuma ação necessária |
| 25-39% | ⚠️ Aviso | Laranja | Atenção - monitorar frequência |
| ≥ 40% | 🚨 Crítico | Vermelho | **Aluno deve repetir o módulo** |

### Como os Alertas Funcionam

- Calculados **por módulo** (não geral)
- Atualizados automaticamente a cada presença marcada
- Visíveis em:
  - Tela de presença (indicador ao lado do nome)
  - Relatórios (seção de alertas)
  - Detalhes do aluno (histórico completo)

## 💾 Armazenamento de Dados

### ☁️ Firebase Realtime Database (Recomendado)
- Dados sincronizados em tempo real
- Acesso de múltiplos dispositivos
- Backup automático em nuvem
- Dados isolados por professor

### 📱 localStorage (Backup Offline)
- Funciona como fallback se Firebase não estiver configurado
- Dados salvos localmente no navegador
- Útil para trabalhar offline

**IMPORTANTE**: Configure o Firebase para aproveitar a sincronização em nuvem!

### Backup e Restauração

**Fazer Backup Manual:**
1. Vá em "Cadastro de Alunos" ou "Relatórios"
2. Clique em "Exportar JSON"
3. Salve o arquivo em local seguro

**OBS:** Com Firebase ativado, o backup na nuvem é automático!
2. Cole este código (substituindo pelo conteúdo do seu backup):
```javascript
const backupData = { /* cole aqui o conteúdo do JSON */ };
DataManager.importData(backupData);
location.reload();
```

## 📱 Compatibilidade

- ✅ Funciona em navegadores modernos (Chrome, Firefox, Edge, Safari)
- ✅ Responsivo (funciona em tablets e celulares)
- ✅ Pode ser usado offline após o primeiro carregamento
- ✅ Pronto para GitHub Pages (não requer servidor)

## 🔧 Estrutura de Arquivos

```
presenca/
├── login.html          # 🆕 Página de login/registro
├── index.html          # Página inicial
├── cadastro.html       # Cadastro de alunos
├── presenca.html       # Marcar presença
├── reports.html        # Relatórios
├── modulos.html        # Gestão de módulos
├── FIREBASE_SETUP.md   # 🆕 Guia de configuração Firebase
├── css/
│   └── style.css       # Estilos + menu de usuário
└── js/
    ├── firebase-config.js  # 🆕 Configuração Firebase
    ├── auth.js             # 🆕 Sistema de autenticação
    ├── data.js             # 🆕 Gerenciamento Firebase + localStorage
    ├── calculations.js     # Cálculos de presença e alertas
    ├── students.js         # Lógica de cadastro
    ├── attendance.js       # Lógica de presença
    ├── reports.js          # Lógica de relatórios
    └── modules.js          # Gestão de módulos
```

## 🔐 Segurança

- ✅ Autenticação obrigatória para acesso ao sistema
- ✅ Cada professor acessa apenas seus próprios dados
- ✅ Senha armazenada com hash pelo Firebase Auth
- ✅ Regras de segurança no Realtime Database
- ✅ HTTPS obrigatório em produção (GitHub Pages usa HTTPS)

## 🎯 Casos de Uso Comuns

### Cenário 1: Primeiro acesso
1. Abra `login.html`
2. Clique em "Criar nova conta"
3. Registre-se com email e senha
4. Faça login e comece a usar

### Cenário 2: Acessar de outro dispositivo
1. Abra o sistema em outro computador/tablet
2. Faça login com suas credenciais
3. Todos os dados estarão sincronizados!

### Cenário 3: Aluno novo no meio do ano
1. Cadastre o aluno escolhendo o módulo atual
2. Comece a marcar presença normalmente
3. O sistema calculará a porcentagem baseado nas aulas que ele participou

### Cenário 4: Aluno atingiu 40% de faltas
1. O sistema mostrará alerta vermelho
2. Na conclusão do módulo, o professor decide se aluno repete
3. Para repetir: vá em "Cadastro de Alunos" > Editar > mantenha no mesmo módulo

### Cenário 5: Cancelamento de aula por feriado
1. Simplesmente não marque presença naquele sábado
2. Os cálculos se ajustam automaticamente
3. Não afeta as porcentagens (só conta aulas que tiveram presença marcada)

### Cenário 6: Erro na marcação
1. Vá em "Marcar Presença"
2. Selecione a data correta
3. Marque novamente (sobrescreve a marcação anterior)

## 📈 Exemplos de Uso

**Exemplo de Cálculo:**
- Módulo com 16 sábados registrados
- Aluno presente em 12 aulas
- Ausente em 4 aulas
- Taxa de presença: 75%
- Taxa de faltas: 25% → **AVISO** 🟠

**Quando repetir módulo:**
- 16 sábados registrados
- Ausente em 7 ou mais aulas
- Taxa de faltas ≥ 40% → **CRÍTICO** 🔴

## 🆘 Solução de Problemas

**Não consigo fazer login:**
- Verifique se configurou o Firebase corretamente
- Veja o arquivo FIREBASE_SETUP.md
- Certifique-se que ativou "Email/Senha" no Firebase Auth

**Firebase não está funcionando:**
- Verifique suas credenciais em `js/firebase-config.js`
- O sistema usará localStorage como fallback
- Abra o Console (F12) para ver erros

**Dados não sincronizam entre dispositivos:**
- Verifique sua conexão com internet
- Certifique-se de estar usando a mesma conta
- Verifique as regras do Realtime Database

**Os dados sumiram:**
- Se usando Firebase, faça login novamente
- Se usando localStorage, verifique se não limpou cache
- Sempre faça backup exportando em JSON

**Alerta não aparece:**
- Certifique-se que há pelo menos 1 presença registrada no módulo
- Os alertas são calculados apenas quando há dados

**Botão P/F não funciona:**
- Verifique se selecionou uma data válida
- Certifique-se de estar autenticado
- Recarregue a página (F5)

**Esqueci minha senha:**
- Na tela de login, clique em "Esqueci minha senha"
- Digite seu email
- Verifique sua caixa de entrada

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Exporte os dados antes de fazer alterações
3. Use o console do navegador (F12) para ver erros

---

**Desenvolvido com ❤️ para facilitar o controle de presença em aulas musicais**
