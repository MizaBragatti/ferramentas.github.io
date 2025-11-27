# 🪒 Sistema de Controle de Serviços - Barbearia

Sistema simples para controle diário de serviços prestados em barbearia com controle individual por barbeiro.

## 📋 Funcionalidades

- ✅ Dois perfis de acesso: Sérgio (proprietário, acesso total) e Hélio (funcionário, acesso restrito ao próprio painel)
- ✅ Registro rápido de serviços com um toque
- ✅ Contador automático por tipo de serviço
- ✅ Controle individual por barbeiro
- ✅ Valores monetários calculados automaticamente
- ✅ Histórico dos últimos 10 serviços com exclusão
- ✅ Relatório completo do dia com valores em R$
- ✅ Relatório individual por barbeiro
- ✅ Armazenamento local (LocalStorage) por data
- ✅ Design responsivo mobile-first
- ✅ Tema old school (preto, cinza, marrom e dourado)
- ✅ Foto personalizada dos barbeiros

## 🎯 Serviços Disponíveis

1. **Corte Masculino** - R$ 40,00 (30 min)
2. **Corte Feminino** - R$ 50,00 (45 min)
3. **Barba** - R$ 30,00 (20 min)
4. **Sombrancelha** - R$ 15,00 (10 min)
5. **Pezinho** - R$ 15,00 (10 min)
6. **Relaxamento** - R$ 60,00 (30 min)

## 🚀 Como Usar

1. Abra o arquivo `index.html` no navegador (de preferência no celular/tablet)
2. Faça login como **Sérgio** (proprietário) ou **Hélio** (funcionário)
  - Sérgio tem acesso a todos os dados, relatórios e histórico
  - Hélio só visualiza e registra seus próprios serviços
3. Toque no card do serviço que foi prestado
4. O serviço será registrado com feedback visual instantâneo
5. Veja o resumo do dia com totais individuais e geral (conforme o perfil)
6. Histórico mostra os últimos 10 serviços registrados
7. Use o botão 🗑️ para excluir serviços registrados por engano
8. Acesse "📊 Ver Relatório Completo" para detalhes gerais (Sérgio)
9. Acesse "👥 Relatório por Barbeiro" para detalhes individuais
10. Consulte o roteiro de testes em [`ROTEIRO_TESTES.md`](./ROTEIRO_TESTES.md)

## 💾 Armazenamento

- Os dados são salvos automaticamente no **LocalStorage** do navegador
- Cada dia tem seus próprios dados independentes (chave: `servicos_YYYY-MM-DD`)
- Os dados persistem mesmo ao fechar o navegador
- Estrutura de dados inclui:
  - Contadores gerais por serviço
  - Contadores individuais por barbeiro (barbeiro1 e barbeiro2)
  - Histórico com timestamp de até 50 registros
- Use "🗑️ Limpar Dados do Dia" para resetar o dia (com confirmação)

## 📱 Mobile-First

- Interface otimizada para dispositivos móveis
- Toque rápido para registrar serviços
- Visual limpo e intuitivo
- Animações de feedback em tempo real
- Seleção visual do barbeiro ativo
- Touch targets otimizados (mínimo 44px)

## 🎨 Design

- Paleta de cores: Preto (#1a1a1a), Cinza, Marrom (#8b4513) e Dourado (#d4af37)
- Tema old school barbershop
- Gradientes elegantes
- Destaques em dourado para valores e ações importantes
- Animações suaves (hover, seleção, feedback)
- Responsivo para todos os tamanhos de tela
- Foto personalizada do Sérgio no botão de seleção

## 📊 Relatórios

### Relatório Completo
- Quantidade de cada tipo de serviço realizado
- Tempo total gasto por tipo de serviço
- Valor unitário e total por serviço
- Total geral de serviços do dia
- Valor total arrecadado no dia
- Tempo total trabalhado em minutos

### Relatório por Barbeiro
- Detalhamento individual de Sérgio e Hélio
- Serviços realizados por cada um
- Quantidade e valores por serviço
- Total de serviços e valor em R$ por barbeiro
- Tempo total trabalhado por cada barbeiro
- Comparação lado a lado dos desempenhos

## 🔧 Tecnologias

- HTML5
- CSS3 (variáveis CSS, animações, grid/flexbox)
- JavaScript vanilla (ES6+)
- LocalStorage API

## 📁 Estrutura de Arquivos

```
backend/           # Backend (Node.js, integração futura)
frontend/          # Frontend (Next.js, React, CSS)
README.md          # Documentação principal
ROTEIRO_TESTES.md  # Roteiro de testes do sistema
funcionalidades.txt # Lista de funcionalidades
```

## 👥 Perfis de Usuário

- **Sérgio** (Proprietário): acesso total a todos os dados, relatórios e histórico
- **Hélio** (Funcionário): acesso restrito ao próprio painel, só visualiza e registra seus serviços

## 🔧 Estrutura de Dados

```javascript
{
  "data": "2025-11-22",
  "servicos": {
    "Corte Masculino": 5,
    "Barba": 3,
    // ... outros serviços
  },
  "barbeiro1": {  // Sérgio
    "Corte Masculino": 3,
    "Barba": 2,
    // ... contadores individuais
  },
  "barbeiro2": {  // Hélio
    "Corte Masculino": 2,
    "Barba": 1,
    // ... contadores individuais
  },
  "historico": [
    {
      "servico": "Corte Masculino",
      "barbeiro": 1,
      "hora": "14:30",
      "timestamp": 1700668200000
    },
    // ... últimos 50 registros
  ]
}
```

## 🌐 Instalação

Não requer instalação! Basta abrir o `index.html` no navegador (versão legacy) ou acessar o frontend Next.js.

Para melhor experiência mobile:
1. Adicione à tela inicial do celular
2. Use em modo retrato
3. Recomendado usar Chrome ou Safari

## ✨ Funcionalidades em Destaque

### Feedback Visual
- ✓ Confirmação instantânea ao registrar serviço
- ✓ Animação de pulso ao selecionar barbeiro
- ✓ Badge com nome do barbeiro e serviço

### Exclusão de Serviços
- 🗑️ Botão de lixeira em cada registro do histórico
- ⚠️ Modal de confirmação antes de excluir
- ♻️ Atualização automática de contadores e valores

### Cálculos Automáticos
- 💰 Valores calculados em tempo real
- 📊 Totais por barbeiro atualizados instantaneamente
- 🧮 Soma geral do dia sempre visível

## 🎯 Casos de Uso

- **Registrar Serviço**: Barbeiro seleciona seu nome e toca no serviço realizado
- **Corrigir Erro**: Clicar em 🗑️ no histórico para remover serviço incorreto
- **Ver Desempenho**: Verificar quanto cada barbeiro fez no dia
- **Fechar Caixa**: Consultar relatório completo para valores totais
- **Resetar Dia**: Limpar dados ao final do expediente

---

Desenvolvido para facilitar o controle diário de serviços em barbearias com múltiplos profissionais.
Consulte o roteiro de testes em [`ROTEIRO_TESTES.md`](./ROTEIRO_TESTES.md).
