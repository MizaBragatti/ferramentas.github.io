# 💰 Sistema de Controle de Gastos

Um sistema simples e eficiente para controlar gastos mensais, desenvolvido com HTML, CSS e JavaScript puro.

## 🚀 Funcionalidades

### ✅ CRUD Completo
- **Create**: Adicionar novos gastos com descrição, valor, data de vencimento e status de pagamento
- **Read**: Visualizar lista completa de gastos com status visual
- **Update**: Editar gastos existentes e marcar como pago/pendente
- **Delete**: Remover gastos individuais ou todos de uma vez

### 📊 Resumo Financeiro
- Total de gastos em tempo real
- Total de valores pagos
- Total de valores pendentes
- Contador de itens cadastrados
- Formatação em moeda brasileira (R$)

### 🔍 Filtros e Pesquisa
- Pesquisa por descrição
- Filtros por status: Todos, Pagos, Pendentes, Vencidos
- Ordenação por:
  - Data (mais recentes/antigos)
  - Valor (maior/menor)
  - Nome (A-Z/Z-A)
  - Vencimento (próximo/distante)

### 💾 Persistência Local
- Dados salvos automaticamente no navegador
- Carregamento automático na próxima visita

### 🎨 Interface Moderna
- Design responsivo para mobile e desktop
- Animações suaves e feedback visual
- Modal de confirmação para exclusões
- Notificações de sucesso
- Tema com gradientes modernos
- Indicadores visuais de status (pago, pendente, vencido)
- Destacar gastos vencidos
- Checkbox interativo para marcar pagamentos
- Texto tachado para gastos já pagos

## 📱 Como Usar

### 1. Adicionar Gasto
1. Preencha a descrição (ex: "Cartão NuBank")
2. Insira o valor (ex: 2437.63)
3. Selecione a data de vencimento
4. Marque se já foi pago (opcional)
5. Clique em "Adicionar Gasto"

### 2. Editar Gasto
1. Clique no botão "✏️ Editar" do item desejado
2. Modifique os dados no formulário
3. Clique em "Atualizar Gasto"

### 3. Excluir Gasto
1. Clique no botão "🗑️ Excluir"
2. Confirme a exclusão no modal

### 4. Marcar como Pago/Pendente
1. Clique no **checkbox** ao lado de cada gasto para marcar como pago
2. Gastos pagos ficam **tachados** e com visual diferenciado
3. Clique novamente no checkbox para voltar ao status pendente

### 5. Pesquisar e Filtrar
- Use a caixa de pesquisa para filtrar por descrição
- Selecione o filtro de status (Todos, Pagos, Pendentes, Vencidos)
- Selecione a ordenação desejada no dropdown

## ⌨️ Atalhos de Teclado

- **ESC**: Cancelar edição ou fechar modal
- **Ctrl+N**: Focar no campo de descrição para novo gasto

## 📁 Estrutura do Projeto

```
gastos-mensais/
├── index.html      # Estrutura da página
├── styles.css      # Estilos e responsividade
├── script.js       # Lógica da aplicação
└── README.md       # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com flexbox/grid
- **JavaScript ES6+**: Lógica da aplicação
- **LocalStorage API**: Persistência de dados

## 📊 Exemplo de Dados

O sistema inclui uma opção para carregar dados de exemplo com diferentes status:

- Cartão NuBank - R$ 2.437,63 (Vence em 5 dias - Pendente)
- Cartão Itaú - R$ 1.859,80 (Vence em 8 dias - ✅ Pago)
- Internet(17) - R$ 77,73 (🔴 Vencido há 2 dias)
- Casa - R$ 4.000,00 (Vence amanhã - Pendente)
- Consórcio - R$ 533,67 (✅ Pago)
- Água - R$ 227,21 (Vence em 7 dias)
- Luz - R$ 191,66 (🔴 Vencido há 5 dias)
- Celular - R$ 59,00 (Vence em 3 dias)
- Carro - R$ 1.759,47 (✅ Pago)

## 🌟 Recursos Especiais

### Formatação Inteligente
- Valores zerados aparecem em cinza
- Datas formatadas em português brasileiro
- Moeda formatada automaticamente
- Status visual com cores e ícones
- Gastos vencidos destacados em vermelho
- Gastos pagos com visual diferenciado

### Validações
- Campos obrigatórios (descrição, valor, data de vencimento)
- Valores numéricos apenas
- Datas válidas obrigatórias
- Prevenção contra XSS

### Feedback Visual
- Item sendo editado fica destacado
- Animações de entrada para novos itens
- Notificações temporárias de sucesso
- Estados de hover interativos
- Indicação visual de gastos vencidos
- Checkbox com animação para marcar pagamentos
- Texto tachado automaticamente para gastos pagos
- Cards de resumo com cores temáticas

## 🚀 Como Executar

1. Faça o download ou clone os arquivos
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Comece a adicionar seus gastos!

## 📱 Compatibilidade

- ✅ Chrome/Edge/Safari/Firefox (versões recentes)
- ✅ Dispositivos móveis (responsivo)
- ✅ Tablets e desktops
- ✅ Funciona offline após o primeiro carregamento

## 🎯 Próximas Melhorias

- [ ] Categorias de gastos
- [ ] Gráficos de visualização
- [ ] Exportar dados para CSV
- [ ] Backup na nuvem
- [ ] Múltiplos orçamentos
- [ ] Relatórios mensais

---

**Desenvolvido com ❤️ para facilitar o controle de gastos pessoais**