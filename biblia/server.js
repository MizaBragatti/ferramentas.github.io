const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

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