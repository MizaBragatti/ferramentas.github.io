# Whiteboard Estilo Miro

Um whiteboard interativo inspirado no Miro, desenvolvido com HTML5 Canvas, CSS e JavaScript puro.

## 🚀 Funcionalidades

### Ferramentas de Desenho
- **Caneta**: Desenho livre com diferentes espessuras e cores
- **Borracha**: Apagar elementos do canvas
- **Formas Geométricas**: 
  - Básicas: Retângulo, Retângulo Arredondado, Círculo, Oval
  - Polígonos: Triângulo, Losango, Paralelogramo, Trapézio
  - Regulares: Pentágono, Hexágono, Octógono
  - Especiais: Estrela
  - Linhas: Linha reta e Setas
- **Texto**: Adicionar texto customizável
- **Notas Adesivas**: Criar notas coloridas e movíveis

### Navegação
- **Pan**: Arrastar o canvas com Ctrl+Click, botão do meio do mouse, ou ferramenta de mão
- **Zoom**: Usar Ctrl+Scroll do mouse para aproximar/afastar
- **Pan com Scroll**: Scroll vertical para mover para cima/baixo, Shift+Scroll para esquerda/direita
- **Controles de Zoom**: Botões para zoom in, zoom out e reset

### Seleção e Edição
- **Ferramenta de Seleção**: Selecionar e manipular objetos
- **Redimensionamento**: Handles ao redor do objeto selecionado para redimensionar
- **Movimentação**: Arrastar objetos selecionados para mover
- **Propriedades Avançadas**: 
  - Cor, espessura e opacidade editáveis
  - Controle de tamanho em pixels (largura/altura)
  - Tamanho de fonte para textos
- **Copiar/Colar**: Duplicar elementos selecionados
- **Excluir**: Remover elementos selecionados
- **Undo/Redo**: Sistema completo de desfazer/refazer (até 50 ações)

### Persistência
- **Salvar**: Exportar o whiteboard em formato JSON
- **Carregar**: Importar whiteboard salvo
- **Limpar**: Limpar todo o conteúdo

## 🎯 Como Usar

### Ferramentas Básicas

1. **Desenhar**:
   - Selecione a ferramenta "Caneta"
   - Escolha cor e espessura na barra de ferramentas
   - Clique e arraste para desenhar

2. **Criar Formas**:
   - Selecione uma ferramenta de forma (retângulo, círculo, triângulo, etc.)
   - Clique e arraste para criar a forma
   - A forma será criada do ponto inicial até onde você soltar
   - Disponível: 12 formas diferentes incluindo polígonos regulares

3. **Selecionar e Redimensionar**:
   - Use a ferramenta de seleção para clicar em objetos
   - Handles aparecerão ao redor do objeto selecionado
   - Arraste os handles para redimensionar
   - Arraste o objeto para mover

4. **Navegar no Canvas**:
   - Use a ferramenta de mão para arrastar o canvas
   - Ctrl+Scroll para zoom in/out
   - Scroll simples para pan vertical
   - Shift+Scroll para pan horizontal

5. **Adicionar Texto**:
   - Clique na ferramenta "Texto"
   - Digite o texto no modal que aparecer
   - Clique "Adicionar" para inserir no canvas

6. **Criar Notas Adesivas**:
   - Clique na ferramenta "Nota Adesiva"
   - Digite o conteúdo da nota
   - Escolha uma cor
   - Clique "Criar Nota"
   - Arraste a nota para posicioná-la

### Navegação no Canvas

- **Ferramenta de Mão**: Clique na ferramenta de mão e arraste para mover o canvas
- **Atalhos de Pan**: Mantenha Ctrl pressionado e arraste, ou use o botão do meio do mouse
- **Zoom**: Ctrl+Scroll do mouse ou os botões de zoom na toolbar
- **Pan com Scroll**: 
  - Scroll vertical: move para cima/baixo
  - Shift+Scroll: move para esquerda/direita
- **Reset**: Clique no botão "Home" para voltar à posição inicial

### Edição Avançada de Propriedades

1. Selecione um objeto
2. Use o painel de propriedades à direita para ajustar:
   - **Cor**: Seletor de cor
   - **Espessura**: Controle deslizante
   - **Opacidade**: De 0 (transparente) a 1 (opaco)
   - **Tamanho**: Defina largura e altura em pixels
   - **Fonte**: Para textos, ajuste o tamanho da fonte
3. Mudanças são aplicadas em tempo real

### Sistema Undo/Redo

- **Histórico Completo**: Até 50 ações são lembradas
- **Botões na Toolbar**: Undo e Redo visíveis
- **Atalhos Rápidos**: Ctrl+Z e Ctrl+Y
- **Estados Visuais**: Botões ficam semi-transparentes quando indisponíveis

### Atalhos de Teclado

- `Ctrl+Z`: Desfazer última ação
- `Ctrl+Y`: Refazer ação desfeita
- `Ctrl+C`: Copiar objeto selecionado
- `Ctrl+V`: Colar objeto copiado
- `Ctrl+A`: Selecionar todos os objetos
- `Ctrl+S`: Salvar whiteboard
- `Ctrl+Scroll`: Zoom in/out
- `Shift+Scroll`: Pan horizontal
- `Delete/Backspace`: Excluir objeto selecionado
- `Esc`: Cancelar seleção

## 🎨 Personalização

### Cores e Espessuras
- Use o seletor de cor na toolbar para escolher cores
- Ajuste a espessura com o controle deslizante
- As configurações se aplicam a novos elementos criados

### Notas Adesivas
- 9 cores predefinidas disponíveis
- Notas são redimensionáveis e editáveis
- Clique duplo para editar o conteúdo

## 📱 Responsividade

O whiteboard é totalmente responsivo e funciona em:
- Desktop (com mouse e teclado)
- Tablets (com touch)
- Smartphones (interface adaptada)

### Recursos Touch
- Toque único: Desenhar/selecionar
- Arrastar: Pan do canvas
- Pinch-to-zoom: Zoom in/out (em desenvolvimento)

## 🔧 Tecnologias Utilizadas

- **HTML5 Canvas**: Para renderização gráfica
- **CSS3**: Estilização moderna e responsiva
- **JavaScript ES6+**: Lógica da aplicação
- **Font Awesome**: Ícones da interface

## 📁 Estrutura do Projeto

```
whiteboard/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS
├── whiteboard.js       # Lógica JavaScript
└── README.md          # Este arquivo
```

## 🚀 Como Executar

1. Faça o download ou clone os arquivos
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Comece a usar o whiteboard!

Não é necessário servidor web - o projeto roda completamente no lado cliente.

## 🌟 Próximas Funcionalidades

- [ ] Layers/camadas
- [ ] Exportação para PNG/SVG
- [ ] Colaboração em tempo real
- [ ] Conectores entre objetos
- [ ] Templates predefinidos
- [ ] Grouping de objetos
- [ ] Alinhamento automático
- [ ] Preenchimento de formas (fill)
- [ ] Gradientes e padrões
- [ ] Importação de imagens

## 🐛 Problemas Conhecidos

- O undo/redo atualmente só funciona para o último elemento
- Seleção de texto pode ser melhorada
- Performance pode ser otimizada para muitos objetos

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**Divirta-se criando com seu novo whiteboard!** 🎨