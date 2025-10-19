# Lista de Compras - Mercado

Uma aplicação web completa para gerenciar listas de compras de mercado com funcionalidades avançadas de CRUD, histórico de preços e checklist de compras.

## ✨ Funcionalidades

### 📝 Gerenciamento de Itens
- **CRUD Completo**: Criar, visualizar, editar e excluir itens da lista
- **Campos Disponíveis**:
  - Código do produto
  - Descrição do item
  - Quantidade (unidades)
  - Valor unitário (R$)
  - Valor total (calculado automaticamente)

### 📊 Histórico de Preços
- Rastreamento automático de alterações de preços
- Visualização de tendências (aumento/diminuição)
- Histórico específico por item
- Armazenamento dos últimos 50 registros de alterações

### ✅ Checklist de Compras
- Marcar/desmarcar itens como comprados
- Filtro para mostrar apenas itens pendentes
- Visual diferenciado para itens já comprados
- Cálculo automático do total de itens pendentes

### 🧾 Consulta de Nota Fiscal (NFCe)
- Página integrada para consultar notas fiscais eletrônicas
- Interface via iframe com o site oficial da Fazenda de São Paulo
- Verificação de preços reais através do QR Code da nota
- Comparação de preços entre estabelecimentos
- Atualização precisa da lista com valores de mercado

### 💾 Persistência de Dados
- Armazenamento local no navegador (localStorage)
- Dados preservados entre sessões
- Backup automático das informações

## 🚀 Como Usar

### Instalação
1. Faça o download ou clone este repositório
2. Abra o arquivo `index.html` em seu navegador web
3. Comece a usar imediatamente!

### Adicionando Itens
1. Preencha os campos no formulário superior:
   - **Código**: Identificador único do produto
   - **Descrição**: Nome ou descrição do item
   - **Qtde UN**: Quantidade a ser comprada
   - **Vl Unitário**: Preço por unidade em reais
2. O valor total será calculado automaticamente
3. Clique em "Salvar" para adicionar o item à lista

### Dados de Exemplo
- **Importar Itens**: Interface para colar dados de produtos em formato específico
- **Parsing Automático**: Reconhece formato de notas fiscais e listas de compras
- **Limpar Tudo**: Remove todos os dados e histórico (irreversível)
- Na primeira execução, o aplicativo já vem com dados de exemplo carregados

### Gerenciando a Lista
- **Marcar como Comprado**: Use o checkbox ao lado de cada item
- **Editar Item**: Clique no botão "Editar" (ícone de lápis)
- **Excluir Item**: Clique no botão "Excluir" (ícone de lixeira)
- **Ver Histórico**: Clique no botão "Histórico" (ícone de relógio)

### Visualizando Histórico
- O histórico de preços é exibido automaticamente na parte inferior
- Para ver o histórico específico de um item, clique no botão "Histórico" do item
- As alterações são marcadas com setas indicando aumento (↗️) ou diminuição (↘️) de preço

### Consultando Notas Fiscais
- Clique no botão "Consultar NFCe" no cabeçalho da aplicação
- Use o QR Code da nota fiscal para verificar preços reais
- Compare preços entre diferentes estabelecimentos
- Atualize sua lista com informações precisas de preços

### Importando Itens
- Clique no botão "Importar Itens" no formulário
- Cole dados no formato: "PRODUTO (Código: 1234)" seguido de linha com quantidade e preços
- Use o botão "Carregar Dados de Exemplo" para ver o formato esperado
- Confirme a importação para substituir todos os itens atuais

## 🎨 Interface

A aplicação possui uma interface moderna e responsiva com:
- Design gradiente atrativo
- Ícones intuitivos (Font Awesome)
- Layout responsivo para dispositivos móveis
- Cores diferenciadas para ações (salvar, cancelar, editar, excluir)
- Animações suaves e efeitos hover

## 📱 Compatibilidade

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móveis e tablets (design otimizado)
- ✅ Layout responsivo com interface touch-friendly
- ✅ Modo card para telas pequenas (menos de 480px)
- ✅ Scroll horizontal intuitivo para tabelas em mobile
- ✅ Botões com tamanho adequado para toque
- ✅ Teclado numérico automático em campos de valor

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilização e layout responsivo
- **JavaScript**: Lógica da aplicação e manipulação de dados
- **LocalStorage**: Persistência de dados no navegador
- **Font Awesome**: Biblioteca de ícones

## 📂 Estrutura do Projeto

```
mercado/
├── index.html          # Página principal
├── nfce.html           # Consulta de Nota Fiscal Eletrônica
├── css/
│   └── styles.css      # Estilos da aplicação
├── js/
│   └── app.js          # Lógica da aplicação
├── .github/
│   └── copilot-instructions.md
└── README.md           # Esta documentação
```

## 🎯 Casos de Uso

### Para Compras Domésticas
- Planeje suas compras antes de ir ao mercado
- Acompanhe os preços dos produtos ao longo do tempo
- Marque itens conforme adiciona ao carrinho
- Controle seu orçamento com o total automático

### Para Controle de Estoque
- Gerencie produtos com códigos específicos
- Monitore variações de preços de fornecedores
- Mantenha histórico para análises futuras

### Para Verificação de Preços
- Consulte notas fiscais eletrônicas (NFCe) para obter preços reais
- Compare preços entre diferentes mercados e estabelecimentos
- Mantenha sua lista sempre atualizada com valores de mercado
- Identifique oportunidades de economia

## 🔮 Funcionalidades Futuras

- [ ] Categorias de produtos
- [ ] Exportação de listas para PDF
- [ ] Compartilhamento de listas
- [ ] Integração com APIs de preços
- [ ] Modo escuro
- [ ] Backup na nuvem
- [ ] Consulta NFCe para outros estados
- [ ] Scanner de código de barras
- [ ] Notificações de variação de preços

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.