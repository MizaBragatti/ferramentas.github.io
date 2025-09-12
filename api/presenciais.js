
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM presenciais');
      rows.forEach(r => r.dias = JSON.parse(r.dias));
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const { nome, dias } = req.body;
    if (!nome || !dias || !Array.isArray(dias) || dias.length !== 2)
      return res.status(400).json({ error: "Nome e 2 dias obrigatórios" });
    try {
      const result = await pool.query(
        'INSERT INTO presenciais (nome, dias) VALUES ($1, $2) RETURNING *',
        [nome, JSON.stringify(dias)]
      );
      const row = result.rows[0];
      row.dias = JSON.parse(row.dias);
      res.status(201).json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'PUT') {
    const { nome, dias, id } = req.body;
    if (!nome || !dias || !Array.isArray(dias) || dias.length !== 2 || !id)
      return res.status(400).json({ error: "Nome, id e 2 dias obrigatórios" });
    try {
      const result = await pool.query(
        'UPDATE presenciais SET nome=$1, dias=$2 WHERE id=$3 RETURNING *',
        [nome, JSON.stringify(dias), id]
      );
      const row = result.rows[0];
      row.dias = JSON.parse(row.dias);
      res.status(200).json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Id obrigatório" });
    try {
      await pool.query('DELETE FROM presenciais WHERE id=$1', [id]);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
