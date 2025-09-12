const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./presenciais.db');

app.use(cors());
app.use(express.json());

// Cria tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS presenciais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    dias TEXT NOT NULL
)`);

// Listar todos
app.get('/presenciais', (req, res) => {
    db.all("SELECT * FROM presenciais", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Converte dias para array
        rows.forEach(r => r.dias = JSON.parse(r.dias));
        res.json(rows);
    });
});

// Criar novo
app.post('/presenciais', (req, res) => {
    const { nome, dias } = req.body;
    if (!nome || !dias || !Array.isArray(dias) || dias.length !== 2)
        return res.status(400).json({ error: "Nome e 2 dias obrigatórios" });
    db.run("INSERT INTO presenciais (nome, dias) VALUES (?, ?)", [nome, JSON.stringify(dias)], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, nome, dias });
    });
});

// Editar
app.put('/presenciais/:id', (req, res) => {
    const { nome, dias } = req.body;
    const { id } = req.params;
    if (!nome || !dias || !Array.isArray(dias) || dias.length !== 2)
        return res.status(400).json({ error: "Nome e 2 dias obrigatórios" });
    db.run("UPDATE presenciais SET nome=?, dias=? WHERE id=?", [nome, JSON.stringify(dias), id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, nome, dias });
    });
});

// Excluir
app.delete('/presenciais/:id', (req, res) => {
    db.run("DELETE FROM presenciais WHERE id=?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));