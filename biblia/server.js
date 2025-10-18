const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./database/biblia.db', (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite');
    }
});

// Rotas da API

// GET - Listar todos os versos
app.get('/api/versos', (req, res) => {
    const query = `
        SELECT v.id, l.nome as livro, v.capitulo, v.versiculo, v.texto 
        FROM versos v 
        JOIN livros l ON v.livro_id = l.id 
        ORDER BY l.ordem, v.capitulo, v.versiculo
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - Buscar verso por ID
app.get('/api/versos/:id', (req, res) => {
    const query = `
        SELECT v.id, v.livro_id, l.nome as livro, v.capitulo, v.versiculo, v.texto 
        FROM versos v 
        JOIN livros l ON v.livro_id = l.id 
        WHERE v.id = ?
    `;
    
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Verso não encontrado' });
        }
    });
});

// POST - Criar novo verso
app.post('/api/versos', (req, res) => {
    const { livro_id, capitulo, versiculo, texto } = req.body;
    
    if (!livro_id || !capitulo || !versiculo || !texto) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const query = `INSERT INTO versos (livro_id, capitulo, versiculo, texto) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [livro_id, capitulo, versiculo, texto], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Verso criado com sucesso' });
    });
});

// PUT - Atualizar verso
app.put('/api/versos/:id', (req, res) => {
    const { livro_id, capitulo, versiculo, texto } = req.body;
    
    if (!livro_id || !capitulo || !versiculo || !texto) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const query = `UPDATE versos SET livro_id = ?, capitulo = ?, versiculo = ?, texto = ? WHERE id = ?`;
    
    db.run(query, [livro_id, capitulo, versiculo, texto, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes > 0) {
            res.json({ message: 'Verso atualizado com sucesso' });
        } else {
            res.status(404).json({ error: 'Verso não encontrado' });
        }
    });
});

// DELETE - Excluir verso
app.delete('/api/versos/:id', (req, res) => {
    const query = `DELETE FROM versos WHERE id = ?`;
    
    db.run(query, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes > 0) {
            res.json({ message: 'Verso excluído com sucesso' });
        } else {
            res.status(404).json({ error: 'Verso não encontrado' });
        }
    });
});

// GET - Listar todos os livros
app.get('/api/livros', (req, res) => {
    const query = `SELECT * FROM livros ORDER BY ordem`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - Buscar verso online
app.get('/api/buscar-verso', async (req, res) => {
    const { referencia } = req.query;
    
    if (!referencia) {
        return res.status(400).json({ error: 'Referência é obrigatória' });
    }
    
    try {
        const texto = await buscarVersoExterno(referencia);
        
        if (texto) {
            res.json({ texto, fonte: 'Web' });
        } else {
            res.status(404).json({ error: 'Verso não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar verso:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Função para buscar verso em fontes externas
async function buscarVersoExterno(referencia) {
    try {
        console.log(`Buscando verso: ${referencia}`);
        
        // Primeiro tentar a base local expandida
        const versoLocal = buscarVersoLocal(referencia);
        if (versoLocal) {
            console.log('Verso encontrado na base local');
            return versoLocal;
        }
        
        // Se não encontrar localmente, fazer web scraping
        const versoWeb = await buscarVersoBibliaOnline(referencia);
        if (versoWeb) {
            console.log('Verso encontrado via web scraping');
            return versoWeb;
        }
        
        return null;
        
    } catch (error) {
        console.error('Erro ao buscar verso externo:', error);
        return null;
    }
}

// Buscar verso na Bíblia Online
async function buscarVersoBibliaOnline(referencia) {
    try {
        const { livroAbrev, capitulo, versiculo } = parseReferencia(referencia);
        
        if (!livroAbrev) {
            console.log('Livro não mapeado:', referencia);
            return null;
        }
        
        const url = `https://www.bibliaonline.com.br/nvi/${livroAbrev}/${capitulo}`;
        console.log(`Fazendo requisição para: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Buscar o versículo específico
        const verseSelector = `span[data-verse="${versiculo}"]`;
        const verseElement = $(verseSelector);
        
        if (verseElement.length > 0) {
            // Extrair o texto do versículo
            let texto = verseElement.text().trim();
            
            // Limpar o texto removendo números e formatação desnecessária
            texto = texto.replace(/^\d+\s*/, ''); // Remove número do versículo no início
            texto = texto.trim();
            
            if (texto) {
                console.log(`Verso encontrado: ${texto.substring(0, 50)}...`);
                return texto;
            }
        }
        
        // Tentar método alternativo - buscar por classe ou id
        const alternativeSelector = `.verse-${versiculo}, #verse-${versiculo}, .v${versiculo}`;
        const altElement = $(alternativeSelector);
        
        if (altElement.length > 0) {
            let texto = altElement.text().trim();
            texto = texto.replace(/^\d+\s*/, '');
            texto = texto.trim();
            
            if (texto) {
                console.log(`Verso encontrado (método alternativo): ${texto.substring(0, 50)}...`);
                return texto;
            }
        }
        
        console.log('Verso não encontrado na página');
        return null;
        
    } catch (error) {
        console.error('Erro no web scraping:', error.message);
        return null;
    }
}

// Função para converter referência em formato da URL
function parseReferencia(referencia) {
    const [livro, capVerso] = referencia.split(' ');
    const [capitulo, versiculo] = capVerso.split(':');
    
    // Mapeamento dos livros para abreviações da Bíblia Online
    const livrosMap = {
        'Gênesis': 'gn', 'Genesis': 'gn',
        'Êxodo': 'ex', 'Exodo': 'ex',
        'Levítico': 'lv', 'Levitico': 'lv',
        'Números': 'nm', 'Numeros': 'nm',
        'Deuteronômio': 'dt', 'Deuteronomio': 'dt',
        'Josué': 'js', 'Josue': 'js',
        'Juízes': 'jz', 'Juizes': 'jz',
        'Rute': 'rt',
        '1 Samuel': '1sm', '1Samuel': '1sm',
        '2 Samuel': '2sm', '2Samuel': '2sm',
        '1 Reis': '1rs', '1Reis': '1rs',
        '2 Reis': '2rs', '2Reis': '2rs',
        '1 Crônicas': '1cr', '1Cronicas': '1cr',
        '2 Crônicas': '2cr', '2Cronicas': '2cr',
        'Esdras': 'ed',
        'Neemias': 'ne',
        'Ester': 'et',
        'Jó': 'jo', 'Jo': 'jo',
        'Salmos': 'sl',
        'Provérbios': 'pv', 'Proverbios': 'pv',
        'Eclesiastes': 'ec',
        'Cantares': 'ct', 'Cânticos': 'ct',
        'Isaías': 'is', 'Isaias': 'is',
        'Jeremias': 'jr',
        'Lamentações': 'lm', 'Lamentacoes': 'lm',
        'Ezequiel': 'ez',
        'Daniel': 'dn',
        'Oséias': 'os', 'Oseias': 'os',
        'Joel': 'jl',
        'Amós': 'am', 'Amos': 'am',
        'Obadias': 'ob',
        'Jonas': 'jn',
        'Miqueias': 'mq',
        'Naum': 'na',
        'Habacuque': 'hc',
        'Sofonias': 'sf',
        'Ageu': 'ag',
        'Zacarias': 'zc',
        'Malaquias': 'ml',
        'Mateus': 'mt',
        'Marcos': 'mc',
        'Lucas': 'lc',
        'João': 'jo', 'Joao': 'jo',
        'Atos': 'at',
        'Romanos': 'rm',
        '1 Coríntios': '1co', '1Corintios': '1co',
        '2 Coríntios': '2co', '2Corintios': '2co',
        'Gálatas': 'gl', 'Galatas': 'gl',
        'Efésios': 'ef', 'Efesios': 'ef',
        'Filipenses': 'fp',
        'Colossenses': 'cl',
        '1 Tessalonicenses': '1ts',
        '2 Tessalonicenses': '2ts',
        '1 Timóteo': '1tm', '1Timoteo': '1tm',
        '2 Timóteo': '2tm', '2Timoteo': '2tm',
        'Tito': 'tt',
        'Filemom': 'fm',
        'Hebreus': 'hb',
        'Tiago': 'tg',
        '1 Pedro': '1pe',
        '2 Pedro': '2pe',
        '1 João': '1jo', '1Joao': '1jo',
        '2 João': '2jo', '2Joao': '2jo',
        '3 João': '3jo', '3Joao': '3jo',
        'Judas': 'jd',
        'Apocalipse': 'ap'
    };
    
    const livroAbrev = livrosMap[livro];
    
    return {
        livroAbrev,
        capitulo: parseInt(capitulo),
        versiculo: parseInt(versiculo)
    };
}

// Base local expandida (para fallback)
function buscarVersoLocal(referencia) {
    try {
        // Base expandida de versos conhecidos
        const versosConhecidos = {
            // Adicionando mais versos populares
            'João 3:16': 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
            'Salmos 23:1': 'O Senhor é o meu pastor; nada me faltará.',
            'Mateus 28:19': 'Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo.',
            'Filipenses 4:13': 'Posso todas as coisas naquele que me fortalece.',
            'Romanos 8:28': 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.',
            'Gênesis 1:1': 'No princípio criou Deus os céus e a terra.'
        };
        
        const verso = versosConhecidos[referencia];
        return verso || null;
        
    } catch (error) {
        console.error('Erro ao buscar verso local:', error);
        return null;
    }
}

// Rota principal - servir a página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com o banco de dados fechada.');
        process.exit(0);
    });
});