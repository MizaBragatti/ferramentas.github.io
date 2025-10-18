const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Criar diretório do banco de dados se não existir
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Conectar ao banco de dados (será criado se não existir)
const db = new sqlite3.Database('./database/biblia.db', (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
        return;
    }
    console.log('Conectado ao banco de dados SQLite');
});

// Criar tabelas
db.serialize(() => {
    // Tabela de livros da Bíblia
    db.run(`CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        ordem INTEGER NOT NULL,
        testamento TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela livros:', err.message);
        } else {
            console.log('Tabela livros criada com sucesso');
        }
    });

    // Tabela de versos
    db.run(`CREATE TABLE IF NOT EXISTS versos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro_id INTEGER NOT NULL,
        capitulo INTEGER NOT NULL,
        versiculo INTEGER NOT NULL,
        texto TEXT NOT NULL,
        FOREIGN KEY (livro_id) REFERENCES livros (id),
        UNIQUE(livro_id, capitulo, versiculo)
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela versos:', err.message);
        } else {
            console.log('Tabela versos criada com sucesso');
        }
    });

    // Inserir todos os 66 livros da Bíblia
    const livros = [
        // Antigo Testamento
        { nome: 'Gênesis', ordem: 1, testamento: 'Antigo' },
        { nome: 'Êxodo', ordem: 2, testamento: 'Antigo' },
        { nome: 'Levítico', ordem: 3, testamento: 'Antigo' },
        { nome: 'Números', ordem: 4, testamento: 'Antigo' },
        { nome: 'Deuteronômio', ordem: 5, testamento: 'Antigo' },
        { nome: 'Josué', ordem: 6, testamento: 'Antigo' },
        { nome: 'Juízes', ordem: 7, testamento: 'Antigo' },
        { nome: 'Rute', ordem: 8, testamento: 'Antigo' },
        { nome: '1 Samuel', ordem: 9, testamento: 'Antigo' },
        { nome: '2 Samuel', ordem: 10, testamento: 'Antigo' },
        { nome: '1 Reis', ordem: 11, testamento: 'Antigo' },
        { nome: '2 Reis', ordem: 12, testamento: 'Antigo' },
        { nome: '1 Crônicas', ordem: 13, testamento: 'Antigo' },
        { nome: '2 Crônicas', ordem: 14, testamento: 'Antigo' },
        { nome: 'Esdras', ordem: 15, testamento: 'Antigo' },
        { nome: 'Neemias', ordem: 16, testamento: 'Antigo' },
        { nome: 'Ester', ordem: 17, testamento: 'Antigo' },
        { nome: 'Jó', ordem: 18, testamento: 'Antigo' },
        { nome: 'Salmos', ordem: 19, testamento: 'Antigo' },
        { nome: 'Provérbios', ordem: 20, testamento: 'Antigo' },
        { nome: 'Eclesiastes', ordem: 21, testamento: 'Antigo' },
        { nome: 'Cantares', ordem: 22, testamento: 'Antigo' },
        { nome: 'Isaías', ordem: 23, testamento: 'Antigo' },
        { nome: 'Jeremias', ordem: 24, testamento: 'Antigo' },
        { nome: 'Lamentações', ordem: 25, testamento: 'Antigo' },
        { nome: 'Ezequiel', ordem: 26, testamento: 'Antigo' },
        { nome: 'Daniel', ordem: 27, testamento: 'Antigo' },
        { nome: 'Oséias', ordem: 28, testamento: 'Antigo' },
        { nome: 'Joel', ordem: 29, testamento: 'Antigo' },
        { nome: 'Amós', ordem: 30, testamento: 'Antigo' },
        { nome: 'Obadias', ordem: 31, testamento: 'Antigo' },
        { nome: 'Jonas', ordem: 32, testamento: 'Antigo' },
        { nome: 'Miqueias', ordem: 33, testamento: 'Antigo' },
        { nome: 'Naum', ordem: 34, testamento: 'Antigo' },
        { nome: 'Habacuque', ordem: 35, testamento: 'Antigo' },
        { nome: 'Sofonias', ordem: 36, testamento: 'Antigo' },
        { nome: 'Ageu', ordem: 37, testamento: 'Antigo' },
        { nome: 'Zacarias', ordem: 38, testamento: 'Antigo' },
        { nome: 'Malaquias', ordem: 39, testamento: 'Antigo' },
        
        // Novo Testamento
        { nome: 'Mateus', ordem: 40, testamento: 'Novo' },
        { nome: 'Marcos', ordem: 41, testamento: 'Novo' },
        { nome: 'Lucas', ordem: 42, testamento: 'Novo' },
        { nome: 'João', ordem: 43, testamento: 'Novo' },
        { nome: 'Atos', ordem: 44, testamento: 'Novo' },
        { nome: 'Romanos', ordem: 45, testamento: 'Novo' },
        { nome: '1 Coríntios', ordem: 46, testamento: 'Novo' },
        { nome: '2 Coríntios', ordem: 47, testamento: 'Novo' },
        { nome: 'Gálatas', ordem: 48, testamento: 'Novo' },
        { nome: 'Efésios', ordem: 49, testamento: 'Novo' },
        { nome: 'Filipenses', ordem: 50, testamento: 'Novo' },
        { nome: 'Colossenses', ordem: 51, testamento: 'Novo' },
        { nome: '1 Tessalonicenses', ordem: 52, testamento: 'Novo' },
        { nome: '2 Tessalonicenses', ordem: 53, testamento: 'Novo' },
        { nome: '1 Timóteo', ordem: 54, testamento: 'Novo' },
        { nome: '2 Timóteo', ordem: 55, testamento: 'Novo' },
        { nome: 'Tito', ordem: 56, testamento: 'Novo' },
        { nome: 'Filemom', ordem: 57, testamento: 'Novo' },
        { nome: 'Hebreus', ordem: 58, testamento: 'Novo' },
        { nome: 'Tiago', ordem: 59, testamento: 'Novo' },
        { nome: '1 Pedro', ordem: 60, testamento: 'Novo' },
        { nome: '2 Pedro', ordem: 61, testamento: 'Novo' },
        { nome: '1 João', ordem: 62, testamento: 'Novo' },
        { nome: '2 João', ordem: 63, testamento: 'Novo' },
        { nome: '3 João', ordem: 64, testamento: 'Novo' },
        { nome: 'Judas', ordem: 65, testamento: 'Novo' },
        { nome: 'Apocalipse', ordem: 66, testamento: 'Novo' }
    ];

    const insertLivro = db.prepare(`INSERT OR IGNORE INTO livros (nome, ordem, testamento) VALUES (?, ?, ?)`);
    
    livros.forEach(livro => {
        insertLivro.run(livro.nome, livro.ordem, livro.testamento);
    });
    
    insertLivro.finalize();

    // Inserir alguns versos de exemplo
    const versosExemplo = [
        { livro_id: 1, capitulo: 1, versiculo: 1, texto: 'No princípio criou Deus os céus e a terra.' },
        { livro_id: 1, capitulo: 1, versiculo: 2, texto: 'E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.' },
        { livro_id: 1, capitulo: 1, versiculo: 3, texto: 'E disse Deus: Haja luz; e houve luz.' },
        { livro_id: 40, capitulo: 5, versiculo: 3, texto: 'Bem-aventurados os pobres de espírito, porque deles é o reino dos céus.' },
        { livro_id: 40, capitulo: 5, versiculo: 4, texto: 'Bem-aventurados os que choram, porque eles serão consolados.' },
        { livro_id: 43, capitulo: 3, versiculo: 16, texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.' },
        { livro_id: 19, capitulo: 23, versiculo: 1, texto: 'O Senhor é o meu pastor; nada me faltará.' },
        { livro_id: 45, capitulo: 8, versiculo: 28, texto: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.' }
    ];

    const insertVerso = db.prepare(`INSERT OR IGNORE INTO versos (livro_id, capitulo, versiculo, texto) VALUES (?, ?, ?, ?)`);
    
    versosExemplo.forEach(verso => {
        insertVerso.run(verso.livro_id, verso.capitulo, verso.versiculo, verso.texto);
    });
    
    insertVerso.finalize();

    console.log('Dados de exemplo inseridos com sucesso');
});

// Fechar conexão
db.close((err) => {
    if (err) {
        console.error('Erro ao fechar banco de dados:', err.message);
    } else {
        console.log('Banco de dados inicializado com sucesso!');
    }
});