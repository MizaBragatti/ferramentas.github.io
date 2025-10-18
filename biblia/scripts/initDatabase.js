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

    // Inserir alguns livros da Bíblia para exemplo
    const livros = [
        { nome: 'Gênesis', ordem: 1, testamento: 'Antigo' },
        { nome: 'Êxodo', ordem: 2, testamento: 'Antigo' },
        { nome: 'Levítico', ordem: 3, testamento: 'Antigo' },
        { nome: 'Números', ordem: 4, testamento: 'Antigo' },
        { nome: 'Deuteronômio', ordem: 5, testamento: 'Antigo' },
        { nome: 'Mateus', ordem: 40, testamento: 'Novo' },
        { nome: 'Marcos', ordem: 41, testamento: 'Novo' },
        { nome: 'Lucas', ordem: 42, testamento: 'Novo' },
        { nome: 'João', ordem: 43, testamento: 'Novo' },
        { nome: 'Atos', ordem: 44, testamento: 'Novo' }
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
        { livro_id: 6, capitulo: 5, versiculo: 3, texto: 'Bem-aventurados os pobres de espírito, porque deles é o reino dos céus.' },
        { livro_id: 6, capitulo: 5, versiculo: 4, texto: 'Bem-aventurados os que choram, porque eles serão consolados.' },
        { livro_id: 9, capitulo: 3, versiculo: 16, texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.' }
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