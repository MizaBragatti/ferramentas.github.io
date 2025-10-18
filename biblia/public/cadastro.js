// Estado da aplicação
let currentEditingId = null;
let livros = [];
let searchedText = '';

// Elementos do DOM
const versoForm = document.getElementById('verso-form');
const livroSelect = document.getElementById('livro-select');
const capituloInput = document.getElementById('capitulo');
const versiculoInput = document.getElementById('versiculo');
const textoInput = document.getElementById('texto');
const versoIdInput = document.getElementById('verso-id');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const autoFillBtn = document.getElementById('auto-fill-btn');
const clearBtn = document.getElementById('clear-btn');
const charCounter = document.getElementById('char-counter');
const copyBtn = document.getElementById('copy-text');
const pasteBtn = document.getElementById('paste-text');
const versoPreview = document.getElementById('verso-preview');
const previewReference = document.getElementById('preview-reference');
const previewText = document.getElementById('preview-text');

// Modal de busca
const searchModal = document.getElementById('search-modal');
const closeSearchModal = document.getElementById('close-search-modal');
const searchReference = document.getElementById('search-reference');
const loadingSearch = document.getElementById('loading-search');
const searchResults = document.getElementById('search-results');
const searchResultText = document.getElementById('search-result-text');
const confirmSearchBtn = document.getElementById('confirm-search');
const cancelSearchBtn = document.getElementById('cancel-search');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    carregarLivros();
    configurarEventListeners();
    verificarParametrosURL();
});

function configurarEventListeners() {
    versoForm.addEventListener('submit', handleSubmitForm);
    cancelBtn.addEventListener('click', cancelarEdicao);
    autoFillBtn.addEventListener('click', abrirBuscaOnline);
    clearBtn.addEventListener('click', limparFormulario);
    
    // Eventos do modal de busca
    closeSearchModal.addEventListener('click', fecharModalBusca);
    confirmSearchBtn.addEventListener('click', confirmarBuscaOnline);
    cancelSearchBtn.addEventListener('click', fecharModalBusca);
    
    // Eventos de texto
    textoInput.addEventListener('input', atualizarContador);
    copyBtn.addEventListener('click', copiarTexto);
    pasteBtn.addEventListener('click', colarTexto);
    
    // Preview em tempo real
    livroSelect.addEventListener('change', atualizarPreview);
    capituloInput.addEventListener('input', atualizarPreview);
    versiculoInput.addEventListener('input', atualizarPreview);
    textoInput.addEventListener('input', atualizarPreview);
    
    // Fechar modal clicando fora
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            fecharModalBusca();
        }
    });
}

// Verificar se veio de edição pela URL
function verificarParametrosURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        carregarVersoParaEdicao(editId);
    }
}

// Carregar livros da API
async function carregarLivros() {
    try {
        const response = await fetch('/api/livros');
        if (!response.ok) throw new Error('Erro ao carregar livros');
        
        livros = await response.json();
        
        // Limpar o select de livros
        livroSelect.innerHTML = '<option value="">Selecione um livro</option>';
        
        // Separar livros por testamento
        const livrosAntigo = livros.filter(livro => livro.testamento === 'Antigo');
        const livrosNovo = livros.filter(livro => livro.testamento === 'Novo');
        
        // Criar optgroup para Antigo Testamento
        if (livrosAntigo.length > 0) {
            const optgroupAntigo = document.createElement('optgroup');
            optgroupAntigo.label = '📜 Antigo Testamento';
            
            livrosAntigo.forEach(livro => {
                const option = document.createElement('option');
                option.value = livro.id;
                option.textContent = livro.nome;
                optgroupAntigo.appendChild(option);
            });
            
            livroSelect.appendChild(optgroupAntigo);
        }
        
        // Criar optgroup para Novo Testamento
        if (livrosNovo.length > 0) {
            const optgroupNovo = document.createElement('optgroup');
            optgroupNovo.label = '✝️ Novo Testamento';
            
            livrosNovo.forEach(livro => {
                const option = document.createElement('option');
                option.value = livro.id;
                option.textContent = livro.nome;
                optgroupNovo.appendChild(option);
            });
            
            livroSelect.appendChild(optgroupNovo);
        }
        
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        mostrarMensagem('Erro ao carregar livros', 'error');
    }
}

// Carregar verso para edição
async function carregarVersoParaEdicao(id) {
    try {
        const response = await fetch(`/api/versos/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar verso');
        
        const verso = await response.json();
        
        // Preencher formulário
        versoIdInput.value = verso.id;
        livroSelect.value = verso.livro_id;
        capituloInput.value = verso.capitulo;
        versiculoInput.value = verso.versiculo;
        textoInput.value = verso.texto;
        
        // Atualizar interface
        currentEditingId = id;
        formTitle.textContent = 'Editar Verso';
        submitBtn.querySelector('.btn-text').textContent = 'Atualizar Verso';
        cancelBtn.style.display = 'inline-block';
        
        atualizarContador();
        atualizarPreview();
        
    } catch (error) {
        console.error('Erro ao carregar verso:', error);
        mostrarMensagem('Erro ao carregar verso para edição', 'error');
    }
}

// Manipular envio do formulário
async function handleSubmitForm(e) {
    e.preventDefault();
    
    const formData = {
        livro_id: parseInt(livroSelect.value),
        capitulo: parseInt(capituloInput.value),
        versiculo: parseInt(versiculoInput.value),
        texto: textoInput.value.trim()
    };

    // Validações
    if (!formData.livro_id || !formData.capitulo || !formData.versiculo || !formData.texto) {
        mostrarMensagem('Por favor, preencha todos os campos', 'error');
        return;
    }

    if (formData.texto.length < 10) {
        mostrarMensagem('O texto do verso deve ter pelo menos 10 caracteres', 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Salvando...</span>';
        
        const isEditing = currentEditingId !== null;
        const url = isEditing ? `/api/versos/${currentEditingId}` : '/api/versos';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro ao salvar verso');
        }

        mostrarMensagem(
            isEditing ? 'Verso atualizado com sucesso!' : 'Verso adicionado com sucesso!', 
            'success'
        );
        
        // Limpar formulário após 2 segundos
        setTimeout(() => {
            limparFormulario();
        }, 2000);

    } catch (error) {
        console.error('Erro ao salvar verso:', error);
        mostrarMensagem(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">Salvar Verso</span>';
    }
}

// Abrir modal de busca online
function abrirBuscaOnline() {
    const livroId = livroSelect.value;
    const capitulo = capituloInput.value;
    const versiculo = versiculoInput.value;
    
    if (!livroId || !capitulo || !versiculo) {
        mostrarMensagem('Selecione o livro, capítulo e versículo antes de buscar online', 'error');
        return;
    }
    
    const livroSelecionado = livros.find(l => l.id == livroId);
    const referencia = `${livroSelecionado.nome} ${capitulo}:${versiculo}`;
    
    searchReference.textContent = referencia;
    searchResults.style.display = 'none';
    confirmSearchBtn.disabled = true;
    searchModal.style.display = 'flex';
    
    // Simular busca online
    buscarVersoOnline(referencia);
}

// Buscar verso online usando múltiplas fontes
async function buscarVersoOnline(referencia) {
    loadingSearch.style.display = 'block';
    
    try {
        // Primeiro tentar nossa base local expandida
        const textoLocal = await buscarVersoLocal(referencia);
        if (textoLocal) {
            mostrarResultadoBusca(textoLocal, 'Local');
            return;
        }
        
        // Tentar buscar via backend (que fará web scraping)
        const textoWeb = await buscarViaWebScraping(referencia);
        if (textoWeb) {
            mostrarResultadoBusca(textoWeb, 'Web');
            return;
        }
        
        // Se nenhuma fonte funcionou
        mostrarErroNaoEncontrado();
        
    } catch (error) {
        console.error('Erro ao buscar verso:', error);
        mostrarErroBusca();
    }
}

// Base de dados local expandida com mais versos
async function buscarVersoLocal(referencia) {
    // Normalizar a referência para diferentes grafias
    const referenciaOriginal = referencia;
    const referenciaNormalizada = normalizarReferencia(referencia);
    
    const versosLocais = {
        // Gênesis - Capítulo 1
        'Genesis 1:1': 'No princípio criou Deus os céus e a terra.',
        'Genesis 1:2': 'E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.',
        'Genesis 1:3': 'E disse Deus: Haja luz; e houve luz.',
        'Genesis 1:26': 'E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; e domine sobre os peixes do mar, e sobre as aves dos céus, e sobre o gado, e sobre toda a terra, e sobre todo o réptil que se move sobre a terra.',
        'Genesis 1:27': 'E criou Deus o homem à sua imagem: à imagem de Deus o criou; homem e mulher os criou.',
        
        // Gênesis - Capítulo 2
        'Genesis 2:7': 'E formou o Senhor Deus o homem do pó da terra, e soprou em suas narinas o fôlego da vida; e o homem foi feito alma vivente.',
        'Genesis 2:18': 'E disse o Senhor Deus: Não é bom que o homem esteja só; far-lhe-ei uma ajudadora idônea para ele.',
        
        // Gênesis - Outros capítulos
        'Genesis 3:19': 'No suor do teu rosto comerás o teu pão, até que te tornes à terra; porque dela foste tomado; porquanto és pó e em pó te tornarás.',
        'Genesis 8:22': 'Enquanto a terra durar, sementeira e sega, e frio e calor, e verão e inverno, e dia e noite, não cessarão.',
        'Genesis 28:15': 'E eis que estou contigo, e te guardarei por onde quer que fores, e te farei tornar a esta terra; porque não te deixarei, até que tenha cumprido o que te tenho falado.',
        
        // Êxodo
        'Exodo 20:3': 'Não terás outros deuses diante de mim.',
        'Exodo 20:4': 'Não farás para ti imagem de escultura, nem alguma semelhança do que há em cima nos céus, nem em baixo na terra, nem nas águas debaixo da terra.',
        'Exodo 20:7': 'Não tomarás o nome do Senhor teu Deus em vão; porque o Senhor não terá por inocente o que tomar o seu nome em vão.',
        'Exodo 20:8': 'Lembra-te do dia do sábado, para o santificar.',
        'Exodo 20:12': 'Honra a teu pai e a tua mãe, para que se prolonguem os teus dias na terra que o Senhor teu Deus te dá.',
        'Exodo 20:13': 'Não matarás.',
        'Exodo 20:14': 'Não adulterarás.',
        'Exodo 20:15': 'Não furtarás.',
        'Exodo 20:16': 'Não dirás falso testemunho contra o teu próximo.',
        'Exodo 20:17': 'Não cobiçarás a casa do teu próximo, não cobiçarás a mulher do teu próximo, nem o seu servo, nem a sua serva, nem o seu boi, nem o seu jumento, nem coisa alguma do teu próximo.',
        'Exodo 3:14': 'E disse Deus a Moisés: EU SOU O QUE SOU. Disse mais: Assim dirás aos filhos de Israel: EU SOU me enviou a vós.',
        'Exodo 14:14': 'O Senhor pelejará por vós, e vos calareis.',
        
        // Levítico
        'Levitico 19:18': 'Não te vingarás nem guardarás ira contra os filhos do teu povo; mas amarás o teu próximo como a ti mesmo. Eu sou o Senhor.',
        
        // Números
        'Numeros 6:24': 'O Senhor te abençoe e te guarde.',
        'Numeros 6:25': 'O Senhor faça resplandecer o seu rosto sobre ti, e tenha misericórdia de ti.',
        'Numeros 6:26': 'O Senhor sobre ti levante o seu rosto, e te dê a paz.',
        
        // Deuteronômio
        'Deuteronomio 6:5': 'Amarás, pois, o Senhor teu Deus de todo o teu coração, e de toda a tua alma, e de todas as tuas forças.',
        'Deuteronomio 31:6': 'Esforçai-vos e tende bom ânimo; não temais, nem vos aterrorizeis diante deles; porque o Senhor vosso Deus é o que vai convosco; não vos deixará nem vos desamparará.',
        
        // Salmos
        'Salmos 1:1': 'Bem-aventurado o varão que não anda segundo o conselho dos ímpios, nem se detém no caminho dos pecadores, nem se assenta na roda dos escarnecedores.',
        'Salmos 1:2': 'Antes tem o seu prazer na lei do Senhor, e na sua lei medita de dia e de noite.',
        'Salmos 1:3': 'Pois será como a árvore plantada junto a ribeiros de águas, a qual dá o seu fruto no seu tempo; as suas folhas não cairão, e tudo quanto fizer prosperará.',
        
        // Salmo 23 - Completo
        'Salmos 23:1': 'O Senhor é o meu pastor; nada me faltará.',
        'Salmos 23:2': 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.',
        'Salmos 23:3': 'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.',
        'Salmos 23:4': 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.',
        'Salmos 23:5': 'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.',
        'Salmos 23:6': 'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias.',
        
        // Outros Salmos populares
        'Salmos 27:1': 'O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?',
        'Salmos 37:4': 'Deleita-te também no Senhor, e te concederá os desejos do teu coração.',
        'Salmos 37:5': 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.',
        'Salmos 46:1': 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.',
        'Salmos 46:10': 'Aquietai-vos, e sabei que eu sou Deus; serei exaltado entre os hereges, serei exaltado sobre a terra.',
        'Salmos 51:10': 'Cria em mim, ó Deus, um coração puro, e renova em mim um espírito reto.',
        'Salmos 91:1': 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.',
        'Salmos 91:2': 'Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.',
        'Salmos 91:11': 'Porque aos seus anjos dará ordem a teu respeito, para te guardarem em todos os teus caminhos.',
        'Salmos 100:4': 'Entrai pelas portas dele com gratidão, e em seus átrios com louvor; louvai-o, e bendizei o seu nome.',
        'Salmos 103:8': 'Misericordioso e piedoso é o Senhor; longanimo e grande em benignidade.',
        'Salmos 118:24': 'Este é o dia que fez o Senhor; regozijemo-nos, e alegremo-nos nele.',
        'Salmos 119:105': 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.',
        'Salmos 139:14': 'Eu te louvarei, porque de um modo assombrososo, e tão maravilhoso fui feito; maravilhosas são as tuas obras, e a minha alma o sabe muito bem.',
        
        // Provérbios
        'Proverbios 3:5': 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.',
        'Proverbios 3:6': 'Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
        'Proverbios 16:3': 'Confia ao Senhor as tuas obras, e teus pensamentos serão estabelecidos.',
        'Proverbios 16:9': 'O coração do homem projeta o seu caminho, mas o Senhor lhe dirige os passos.',
        'Proverbios 18:10': 'Torre forte é o nome do Senhor; a ele correrá o justo, e estará seguro.',
        'Proverbios 22:6': 'Ensina a criança no caminho em que deve andar; e até quando envelhecer não se desviará dele.',
        'Proverbios 27:17': 'Ferro com ferro se afia, assim o homem afia o rosto do seu amigo.',
        'Proverbios 31:25': 'A força e a honra são seu vestido, e se alegrará com o dia futuro.',
        'Proverbios 31:30': 'Enganosa é a graça e vaidade a formosura, mas a mulher que teme ao Senhor essa será louvada.',
        
        // Eclesiastes
        'Eclesiastes 3:1': 'Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu.',
        'Eclesiastes 3:11': 'Tudo fez formoso em seu tempo; também pôs a eternidade no coração do homem, sem que este possa descobrir a obra que Deus fez desde o princípio até ao fim.',
        'Eclesiastes 12:13': 'De tudo o que se tem ouvido, o fim é: Teme a Deus, e guarda os seus mandamentos; porque isto é o dever de todo o homem.',
        
        // Josué
        'Josue 1:9': 'Não to mandei eu? Esforça-te, e tem bom ânimo; não te atemorizes, nem te espantes; porque o Senhor teu Deus é contigo, por onde quer que andares.',
        'Josue 24:15': 'Porém, se vos parece mal aos vossos olhos servir ao Senhor, escolhei hoje a quem sirvais; se aos deuses a quem serviram vossos pais, que estavam além do rio, ou aos deuses dos amorreus, em cuja terra habitais; porém eu e a minha casa serviremos ao Senhor.',
        
        // Isaías
        'Isaías 40:31': 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.',
        'Isaías 55:8': 'Porque os meus pensamentos não são os vossos pensamentos, nem os vossos caminhos os meus caminhos, diz o Senhor.',
        'Isaías 53:5': 'Mas ele foi ferido por causa das nossas transgressões, e moído por causa das nossas iniquidades; o castigo que nos traz a paz estava sobre ele, e pelas suas pisaduras fomos sarados.',
        
        // Jeremias
        'Jeremias 29:11': 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.',
        
        // Mateus - Bem-aventuranças (Capítulo 5)
        'Mateus 5:3': 'Bem-aventurados os pobres de espírito, porque deles é o reino dos céus.',
        'Mateus 5:4': 'Bem-aventurados os que choram, porque eles serão consolados.',
        'Mateus 5:5': 'Bem-aventurados os mansos, porque eles herdarão a terra.',
        'Mateus 5:6': 'Bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos.',
        'Mateus 5:7': 'Bem-aventurados os misericordiosos, porque eles alcançarão misericórdia.',
        'Mateus 5:8': 'Bem-aventurados os limpos de coração, porque eles verão a Deus.',
        'Mateus 5:9': 'Bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus.',
        'Mateus 5:14': 'Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte.',
        'Mateus 5:16': 'Assim resplandeça a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem a vosso Pai, que está nos céus.',
        
        // Mateus - Oração do Pai Nosso (Capítulo 6)
        'Mateus 6:9': 'Portanto, vós orareis assim: Pai nosso, que estás nos céus, santificado seja o teu nome.',
        'Mateus 6:10': 'Venha o teu reino, seja feita a tua vontade, tanto na terra como no céu.',
        'Mateus 6:11': 'O pão nosso de cada dia nos dá hoje.',
        'Mateus 6:12': 'E perdoa-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores.',
        'Mateus 6:13': 'E não nos induzas à tentação; mas livra-nos do mal; porque teu é o reino, e o poder, e a glória, para sempre. Amém.',
        'Mateus 6:19': 'Não ajunteis tesouros na terra, onde a traça e a ferrugem tudo consomem, e onde os ladrões minam e roubam.',
        'Mateus 6:20': 'Mas ajuntai tesouros no céu, onde nem a traça nem a ferrugem consomem, e onde os ladrões não minam nem roubam.',
        'Mateus 6:26': 'Olhai para as aves do céu, que nem semeiam, nem segam, nem ajuntam em celeiros; e vosso Pai celestial as alimenta. Não tendes vós muito mais valor do que elas?',
        'Mateus 6:33': 'Mas, buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.',
        'Mateus 6:34': 'Não vos inquieteis, pois, pelo dia de amanhã, porque o dia de amanhã cuidará de si mesmo. Basta a cada dia o seu mal.',
        
        // Outros capítulos de Mateus
        'Mateus 7:7': 'Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á.',
        'Mateus 7:12': 'Portanto, tudo o que vós quereis que os homens vos façam, fazei-lho também vós, porque esta é a lei e os profetas.',
        'Mateus 11:28': 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.',
        'Mateus 11:29': 'Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração; e encontrareis descanso para as vossas almas.',
        'Mateus 16:24': 'Então disse Jesus aos seus discípulos: Se alguém quiser vir após mim, renuncie-se a si mesmo, tome sobre si a sua cruz, e siga-me.',
        'Mateus 18:3': 'E disse: Em verdade vos digo que, se não vos converterdes e não vos fizerdes como meninos, de modo algum entrareis no reino dos céus.',
        'Mateus 22:37': 'E Jesus disse-lhe: Amarás o Senhor teu Deus de todo o teu coração, e de toda a tua alma, e de todo o teu pensamento.',
        'Mateus 22:39': 'E o segundo, semelhante a este, é: Amarás o teu próximo como a ti mesmo.',
        'Mateus 28:18': 'E, chegando-se Jesus, falou-lhes, dizendo: É-me dado todo o poder no céu e na terra.',
        'Mateus 28:19': 'Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo.',
        'Mateus 28:20': 'Ensinando-as a guardar todas as coisas que eu vos tenho mandado; e eis que eu estou convosco todos os dias, até a consumação dos séculos. Amém.',
        
        // Marcos
        'Marcos 16:15': 'E disse-lhes: Ide por todo o mundo, pregai o evangelho a toda criatura.',
        'Marcos 12:30': 'Amarás, pois, ao Senhor teu Deus de todo o teu coração, e de toda a tua alma, e de todo o teu entendimento, e de todas as tuas forças; este é o primeiro mandamento.',
        
        // Lucas
        'Lucas 2:10': 'E o anjo lhes disse: Não temais, porque eis aqui vos trago novas de grande gozo, que será para todo o povo.',
        'Lucas 2:11': 'Pois, na cidade de Davi, vos nasceu hoje o Salvador, que é Cristo, o Senhor.',
        'Lucas 6:31': 'E como vós quereis que os homens vos façam, da mesma maneira lhes fazei vós, também.',
        'Lucas 12:25': 'E qual de vós, sendo solícito, pode acrescentar à sua estatura um côvado?',
        'Lucas 19:10': 'Porque o Filho do homem veio buscar e salvar o que se havia perdido.',
        
        // João
        'João 3:16': 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
        'João 14:6': 'Disse-lhe Jesus: Eu sou o caminho, e a verdade e a vida; ninguém vem ao Pai, senão por mim.',
        'João 1:1': 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.',
        'João 8:32': 'E conhecereis a verdade, e a verdade vos libertará.',
        'João 10:10': 'O ladrão não vem senão a roubar, a matar, e a destruir; eu vim para que tenham vida, e a tenham com abundância.',
        
        // Atos
        'Atos 1:8': 'Mas recebereis a virtude do Espírito Santo, que há de vir sobre vós; e ser-me-eis testemunhas, tanto em Jerusalém como em toda a Judéia e Samaria, e até aos confins da terra.',
        
        // Romanos
        'Romanos 8:28': 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.',
        'Romanos 3:23': 'Porque todos pecaram e destituídos estão da glória de Deus.',
        'Romanos 6:23': 'Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna, por Cristo Jesus nosso Senhor.',
        'Romanos 10:9': 'A saber: Se com a tua boca confessares ao Senhor Jesus, e em teu coração creres que Deus o ressuscitou dentre os mortos, serás salvo.',
        
        // 1 Coríntios
        '1 Coríntios 13:4': 'O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbece.',
        '1 Coríntios 13:13': 'Agora, pois, permanecem a fé, a esperança e o amor, estes três; mas o maior destes é o amor.',
        '1 Coríntios 10:13': 'Não veio sobre vós tentação, senão humana; mas fiel é Deus, que não vos deixará tentar acima do que podeis, antes com a tentação dará também o escape, para que a possais suportar.',
        
        // Filipenses
        'Filipenses 4:13': 'Posso todas as coisas naquele que me fortalece.',
        'Filipenses 4:19': 'O meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus.',
        'Filipenses 4:6': 'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplicas, com ação de graças.',
        
        // 2 Timóteo
        '2 Timóteo 3:16': 'Toda a Escritura é divinamente inspirada, e proveitosa para ensinar, para redargüir, para corrigir, para instruir em justiça.',
        
        // Hebreus
        'Hebreus 11:1': 'Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não vêem.',
        'Hebreus 13:8': 'Jesus Cristo é o mesmo, ontem, e hoje, e eternamente.',
        
        // 1 Pedro
        '1 Pedro 5:7': 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.',
        
        // 1 João
        '1 João 4:8': 'Aquele que não ama não conhece a Deus; porque Deus é amor.',
        '1 João 1:9': 'Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados, e nos purificar de toda a injustiça.',
        
        // Apocalipse
        'Apocalipse 21:4': 'E Deus limpará de seus olhos toda a lágrima; e não haverá mais morte, nem pranto, nem clamor, nem dor; porque já as primeiras coisas são passadas.'
    };
    
    // Buscar primeiro com a referência original
    let verso = versosLocais[referenciaOriginal];
    if (verso) return verso;
    
    // Buscar com a referência normalizada
    verso = versosLocais[referenciaNormalizada];
    if (verso) return verso;
    
    return null;
}

// Função para normalizar referências (remover acentos, padronizar grafia)
function normalizarReferencia(referencia) {
    const mapeamentos = {
        'Gênesis': 'Genesis',
        'Êxodo': 'Exodo', 
        'Levítico': 'Levitico',
        'Números': 'Numeros',
        'Deuteronômio': 'Deuteronomio',
        'Juízes': 'Juizes',
        'Crônicas': 'Cronicas',
        'Neemias': 'Neemias',
        'Jó': 'Jo',
        'Provérbios': 'Proverbios',
        'Cânticos': 'Canticos',
        'Cantares': 'Canticos',
        'Isaías': 'Isaias',
        'Lamentações': 'Lamentacoes',
        'Oséias': 'Oseias',
        'Miqueias': 'Miqueias',
        'Sofonias': 'Sofonias',
        'Ageu': 'Ageu',
        'Zacarias': 'Zacarias',
        'Malaquias': 'Malaquias',
        'Coríntios': 'Corintios',
        'Gálatas': 'Galatas',
        'Efésios': 'Efesios',
        'Colossenses': 'Colossenses',
        'Tessalonicenses': 'Tessalonicenses',
        'Timóteo': 'Timoteo',
        'Filemom': 'Filemom',
        'Hebreus': 'Hebreus'
    };
    
    let referenciaNormalizada = referencia;
    
    // Aplicar mapeamentos
    for (const [original, normalizado] of Object.entries(mapeamentos)) {
        referenciaNormalizada = referenciaNormalizada.replace(original, normalizado);
    }
    
    return referenciaNormalizada;
}

// Tentar buscar via API Bible (gratuita)
async function buscarViaApiBible(referencia) {
    try {
        // Converter referência para formato da API
        const [livro, capVerso] = referencia.split(' ');
        const [capitulo, versiculo] = capVerso.split(':');
        
        // Mapeamento de nomes de livros para códigos da API
        const livrosCodigos = {
            'Gênesis': 'GEN', 'Êxodo': 'EXO', 'Levítico': 'LEV', 'Números': 'NUM', 'Deuteronômio': 'DEU',
            'Josué': 'JOS', 'Juízes': 'JDG', 'Rute': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
            '1 Reis': '1KI', '2 Reis': '2KI', '1 Crônicas': '1CH', '2 Crônicas': '2CH', 'Esdras': 'EZR',
            'Neemias': 'NEH', 'Ester': 'EST', 'Jó': 'JOB', 'Salmos': 'PSA', 'Provérbios': 'PRO',
            'Eclesiastes': 'ECC', 'Cantares': 'SNG', 'Isaías': 'ISA', 'Jeremias': 'JER', 'Lamentações': 'LAM',
            'Ezequiel': 'EZK', 'Daniel': 'DAN', 'Oséias': 'HOS', 'Joel': 'JOL', 'Amós': 'AMO',
            'Obadias': 'OBA', 'Jonas': 'JON', 'Miqueias': 'MIC', 'Naum': 'NAM', 'Habacuque': 'HAB',
            'Sofonias': 'ZEP', 'Ageu': 'HAG', 'Zacarias': 'ZEC', 'Malaquias': 'MAL',
            'Mateus': 'MAT', 'Marcos': 'MRK', 'Lucas': 'LUK', 'João': 'JHN', 'Atos': 'ACT',
            'Romanos': 'ROM', '1 Coríntios': '1CO', '2 Coríntios': '2CO', 'Gálatas': 'GAL', 'Efésios': 'EPH',
            'Filipenses': 'PHP', 'Colossenses': 'COL', '1 Tessalonicenses': '1TH', '2 Tessalonicenses': '2TH',
            '1 Timóteo': '1TI', '2 Timóteo': '2TI', 'Tito': 'TIT', 'Filemom': 'PHM', 'Hebreus': 'HEB',
            'Tiago': 'JAS', '1 Pedro': '1PE', '2 Pedro': '2PE', '1 João': '1JN', '2 João': '2JN',
            '3 João': '3JN', 'Judas': 'JUD', 'Apocalipse': 'REV'
        };
        
        const codigoLivro = livrosCodigos[livro];
        if (!codigoLivro) return null;
        
        // Simular chamada da API (em produção, usaria uma chave real)
        // Por enquanto, retornar null para prosseguir com outras fontes
        return null;
        
    } catch (error) {
        console.error('Erro na API Bible:', error);
        return null;
    }
}

// Busca alternativa via backend (agora com web scraping real)
async function buscarViaWebScraping(referencia) {
    try {
        const response = await fetch(`/api/buscar-verso?referencia=${encodeURIComponent(referencia)}`);
        
        if (response.ok) {
            const data = await response.json();
            return data.texto;
        }
        
        return null;
    } catch (error) {
        console.error('Erro na busca via backend:', error);
        return null;
    }
}

// Funções auxiliares para mostrar resultados
function mostrarResultadoBusca(texto, fonte = 'Base local') {
    loadingSearch.style.display = 'none';
    searchedText = texto;
    searchResultText.textContent = texto;
    
    const fonteTexto = fonte === 'Web' ? 'Bíblia Online (Web Scraping)' : 'Base de dados local';
    
    searchResults.innerHTML = `
        <h4>✅ Resultado encontrado:</h4>
        <div class="search-result-text">${texto}</div>
        <p class="result-source">Fonte: ${fonteTexto}</p>
    `;
    searchResults.style.display = 'block';
    confirmSearchBtn.disabled = false;
}

function mostrarErroNaoEncontrado() {
    loadingSearch.style.display = 'none';
    
    // Sugestões de versos populares
    const sugestoes = [
        'João 3:16', 'Salmos 23:1', 'Mateus 28:19', 'Filipenses 4:13', 
        'Romanos 8:28', 'Provérbios 3:5', 'Isaías 40:31', 'Gênesis 1:1',
        'Mateus 11:28', 'Hebreus 11:1', '1 Coríntios 13:4', 'Salmos 119:105'
    ];
    
    const sugestoesHtml = sugestoes.map(verso => 
        `<button class="btn-suggestion" onclick="buscarSugestao('${verso}')">${verso}</button>`
    ).join('');
    
    searchResults.innerHTML = `
        <div class="no-results">
            <p>❌ <strong>Verso não encontrado automaticamente</strong></p>
            <p>Possíveis motivos:</p>
            <ul style="text-align: left; margin: 10px 0;">
                <li>Verifique se a referência está correta</li>
                <li>Alguns livros podem ter grafias diferentes</li>
                <li>O verso pode não estar na base de dados</li>
            </ul>
            <p><strong>💡 Dica:</strong> Você pode digitar o verso manualmente no campo de texto.</p>
            
            <div class="suggestions-container">
                <h4>📖 Versos populares disponíveis:</h4>
                <div class="suggestions-grid">
                    ${sugestoesHtml}
                </div>
            </div>
        </div>
    `;
    searchResults.style.display = 'block';
}

// Função para buscar uma sugestão clicada
function buscarSugestao(referencia) {
    searchReference.textContent = referencia;
    
    // Atualizar os campos do formulário
    const [livro, capVerso] = referencia.split(' ');
    const [capitulo, versiculo] = capVerso.split(':');
    
    // Encontrar o livro correspondente
    const livroEncontrado = livros.find(l => l.nome === livro);
    if (livroEncontrado) {
        livroSelect.value = livroEncontrado.id;
        capituloInput.value = capitulo;
        versiculoInput.value = versiculo;
    }
    
    // Buscar o verso
    buscarVersoOnline(referencia);
}

function mostrarErroBusca() {
    loadingSearch.style.display = 'none';
    searchResults.innerHTML = `
        <div class="error-results">
            <p>⚠️ <strong>Erro ao buscar verso online</strong></p>
            <p>Problemas de conexão ou serviço temporariamente indisponível.</p>
            <p><strong>Solução:</strong> Digite o verso manualmente no campo de texto.</p>
        </div>
    `;
    searchResults.style.display = 'block';
}

// Confirmar uso do texto da busca online
function confirmarBuscaOnline() {
    if (searchedText) {
        textoInput.value = searchedText;
        atualizarContador();
        atualizarPreview();
        mostrarMensagem('Texto preenchido automaticamente!', 'success');
    }
    fecharModalBusca();
}

// Fechar modal de busca
function fecharModalBusca() {
    searchModal.style.display = 'none';
    searchedText = '';
}

// Cancelar edição
function cancelarEdicao() {
    limparFormulario();
    // Remover parâmetros da URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Limpar formulário
function limparFormulario() {
    versoForm.reset();
    versoIdInput.value = '';
    currentEditingId = null;
    formTitle.textContent = 'Adicionar Novo Verso';
    submitBtn.querySelector('.btn-text').textContent = 'Salvar Verso';
    cancelBtn.style.display = 'none';
    versoPreview.style.display = 'none';
    atualizarContador();
}

// Atualizar contador de caracteres
function atualizarContador() {
    const length = textoInput.value.length;
    charCounter.textContent = `${length} caracteres`;
    
    if (length > 500) {
        charCounter.style.color = '#e53e3e';
    } else if (length > 300) {
        charCounter.style.color = '#dd6b20';
    } else {
        charCounter.style.color = '#718096';
    }
}

// Copiar texto
async function copiarTexto() {
    if (textoInput.value) {
        try {
            await navigator.clipboard.writeText(textoInput.value);
            mostrarMensagem('Texto copiado!', 'success');
        } catch (err) {
            mostrarMensagem('Erro ao copiar texto', 'error');
        }
    }
}

// Colar texto
async function colarTexto() {
    try {
        const text = await navigator.clipboard.readText();
        textoInput.value = text;
        atualizarContador();
        atualizarPreview();
        mostrarMensagem('Texto colado!', 'success');
    } catch (err) {
        mostrarMensagem('Erro ao colar texto', 'error');
    }
}

// Atualizar preview
function atualizarPreview() {
    const livroId = livroSelect.value;
    const capitulo = capituloInput.value;
    const versiculo = versiculoInput.value;
    const texto = textoInput.value.trim();
    
    if (livroId && capitulo && versiculo && texto) {
        const livroSelecionado = livros.find(l => l.id == livroId);
        if (livroSelecionado) {
            previewReference.textContent = `${livroSelecionado.nome} ${capitulo}:${versiculo}`;
            previewText.textContent = `"${texto}"`;
            versoPreview.style.display = 'block';
        }
    } else {
        versoPreview.style.display = 'none';
    }
}

// Mostrar mensagens para o usuário
function mostrarMensagem(mensagem, tipo = 'info') {
    // Remover mensagens anteriores
    const mensagensAnteriores = document.querySelectorAll('.error-message, .success-message');
    mensagensAnteriores.forEach(msg => msg.remove());
    
    const div = document.createElement('div');
    div.className = tipo === 'error' ? 'error-message' : 'success-message';
    div.textContent = mensagem;
    
    // Inserir após o cabeçalho do formulário
    const formSection = document.querySelector('.form-section-full');
    const formHeader = formSection.querySelector('.form-header');
    formHeader.parentNode.insertBefore(div, formHeader.nextSibling);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 5000);
}

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // ESC para cancelar ou fechar modal
    if (e.key === 'Escape') {
        if (searchModal.style.display === 'flex') {
            fecharModalBusca();
        } else if (currentEditingId !== null) {
            cancelarEdicao();
        }
    }
    
    // Ctrl+Enter para submeter formulário
    if (e.ctrlKey && e.key === 'Enter') {
        if (document.activeElement.closest('#verso-form')) {
            versoForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Ctrl+L para limpar formulário
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        limparFormulario();
    }
});