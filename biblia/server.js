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

// Função para buscar verso online apenas
async function buscarVersoExterno(referencia) {
    try {
        console.log(`Buscando verso online: ${referencia}`);
        
        // Buscar diretamente online
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

// Buscar verso na Bíblia Online com headers completos
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
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'referer': `https://www.bibliaonline.com.br/nvi/${livroAbrev}/${capitulo}`,
                'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        // Buscar o versículo específico usando diferentes seletores
        const possibleSelectors = [
            `span[data-verse="${versiculo}"]`,
            `[data-verse="${versiculo}"]`,
            `.verse-${versiculo}`,
            `#verse-${versiculo}`,
            `.v${versiculo}`,
            `span:contains("${versiculo}")`,
            `.verse:nth-child(${versiculo})`
        ];
        
        let texto = null;
        
        for (const selector of possibleSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                texto = element.text().trim();
                
                // Limpar o texto removendo números e formatação desnecessária
                texto = texto.replace(/^\d+\s*/, ''); // Remove número do versículo no início
                texto = texto.replace(/\s+/g, ' ').trim(); // Normaliza espaços
                
                if (texto && texto.length > 10) { // Verifica se o texto tem tamanho razoável
                    console.log(`Verso encontrado com seletor ${selector}: ${texto.substring(0, 50)}...`);
                    return texto;
                }
            }
        }
        
        // Se não encontrou com seletores específicos, tentar buscar todo o conteúdo do capítulo
        const chapterContent = $('.chapter-content, .bible-text, .verses, .content').text();
        if (chapterContent) {
            // Tentar extrair o versículo do texto completo
            const lines = chapterContent.split('\n');
            for (const line of lines) {
                if (line.includes(`${versiculo} `) || line.startsWith(`${versiculo}`)) {
                    texto = line.replace(/^\d+\s*/, '').trim();
                    if (texto && texto.length > 10) {
                        console.log(`Verso encontrado no conteúdo completo: ${texto.substring(0, 50)}...`);
                        return texto;
                    }
                }
            }
        }
        
        console.log('Verso não encontrado na página');
        console.log('HTML da resposta (primeiros 500 caracteres):', response.data.substring(0, 500));
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