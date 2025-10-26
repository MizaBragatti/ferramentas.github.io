const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint para receber agendamentos
app.post('/agendamentos', (req, res) => {
  const { nome, telefone, servico, data, hora } = req.body;
  if (!nome || !telefone || !servico || !data || !hora) {
    return res.status(400).json({ mensagem: 'Dados incompletos.' });
  }
  db.run(
    `INSERT INTO agendamentos (nome, telefone, servico, data, hora) VALUES (?, ?, ?, ?, ?)`,
    [nome, telefone, servico, data, hora],
    function (err) {
      if (err) {
        console.error('Erro ao salvar agendamento:', err);
        return res.status(500).json({ mensagem: 'Erro ao salvar agendamento.' });
      }
      res.status(201).json({ mensagem: 'Agendamento recebido com sucesso!', id: this.lastID });
    }
  );
});

// Endpoint para listar agendamentos
app.get('/agendamentos', (req, res) => {
  const { data, status } = req.query;
  let query = 'SELECT * FROM agendamentos';
  let params = [];
  
  if (data || status) {
    query += ' WHERE';
    const conditions = [];
    
    if (data) {
      conditions.push(' data = ?');
      params.push(data);
    }
    
    if (status) {
      conditions.push(' status = ?');
      params.push(status);
    }
    
    query += conditions.join(' AND');
  }
  
  query += ' ORDER BY data ASC, hora ASC';
  
  console.log('Query SQL:', query, 'Params:', params);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro na consulta SQL:', err);
      return res.status(500).json({ 
        mensagem: 'Erro ao buscar agendamentos.',
        erro: err.message 
      });
    }
    console.log('Resultados encontrados:', rows ? rows.length : 0);
    // Garantir que sempre retorna um array
    res.json(Array.isArray(rows) ? rows : []);
  });
});

// Endpoint para atualizar status do agendamento
app.patch('/agendamentos/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pendente', 'confirmado', 'cancelado'].includes(status)) {
    return res.status(400).json({ mensagem: 'Status inválido.' });
  }
  
  db.run(
    "UPDATE agendamentos SET status = ?, atualizado_em = datetime('now') WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        console.error('Erro na atualização:', err);
        return res.status(500).json({ mensagem: 'Erro ao atualizar agendamento.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
      }
      res.json({ mensagem: 'Status atualizado com sucesso!' });
    }
  );
});

// Endpoint para deletar agendamento
app.delete('/agendamentos/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM agendamentos WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ mensagem: 'Erro ao deletar agendamento.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
    }
    res.json({ mensagem: 'Agendamento deletado com sucesso!' });
  });
});

// Endpoints para dias indisponíveis
app.get('/dias-indisponiveis', (req, res) => {
  db.all('SELECT * FROM dias_indisponiveis ORDER BY data', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar dias indisponíveis:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    console.log('📅 Dias indisponíveis retornados:', JSON.stringify(rows, null, 2));
    res.json(Array.isArray(rows) ? rows : []);
  });
});

app.post('/dias-indisponiveis', (req, res) => {
  const { data, hora_inicio, hora_fim, motivo } = req.body;
  
  console.log('📝 Recebendo POST para indisponibilidade:', { data, hora_inicio, hora_fim, motivo });
  
  if (!data) {
    return res.status(400).json({ error: 'Data é obrigatória' });
  }

  // Se hora_inicio e hora_fim são fornecidos, validar
  if ((hora_inicio && !hora_fim) || (!hora_inicio && hora_fim)) {
    return res.status(400).json({ error: 'Ambos hora_inicio e hora_fim devem ser fornecidos ou omitidos' });
  }

  db.run(
    'INSERT INTO dias_indisponiveis (data, hora_inicio, hora_fim, motivo) VALUES (?, ?, ?, ?)',
    [data, hora_inicio || null, hora_fim || null, motivo || 'Indisponível'],
    function(err) {
      if (err) {
        console.error('Erro ao adicionar indisponibilidade:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      console.log('✅ Indisponibilidade salva com ID:', this.lastID);
      res.json({ 
        id: this.lastID, 
        data, 
        hora_inicio,
        hora_fim,
        motivo: motivo || 'Indisponível',
        message: hora_inicio ? 'Horário marcado como indisponível' : 'Dia marcado como indisponível' 
      });
    }
  );
});

// Endpoint para atualizar indisponibilidade
app.put('/dias-indisponiveis/:id', (req, res) => {
  const { id } = req.params;
  const { data, hora_inicio, hora_fim, motivo } = req.body;
  
  console.log('📝 Recebendo PUT para atualizar indisponibilidade:', { id, data, hora_inicio, hora_fim, motivo });
  
  if (!data) {
    return res.status(400).json({ error: 'Data é obrigatória' });
  }

  // Se hora_inicio e hora_fim são fornecidos, validar
  if ((hora_inicio && !hora_fim) || (!hora_inicio && hora_fim)) {
    return res.status(400).json({ error: 'Ambos hora_inicio e hora_fim devem ser fornecidos ou omitidos' });
  }

  // Primeiro verificar se o registro existe
  db.get('SELECT * FROM dias_indisponiveis WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao verificar indisponibilidade:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Indisponibilidade não encontrada' });
    }

    // Atualizar o registro
    db.run(
      'UPDATE dias_indisponiveis SET data = ?, hora_inicio = ?, hora_fim = ?, motivo = ? WHERE id = ?',
      [data, hora_inicio || null, hora_fim || null, motivo || 'Indisponível', id],
      function(err) {
        if (err) {
          console.error('Erro ao atualizar indisponibilidade:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        console.log('✅ Indisponibilidade atualizada com ID:', id);
        res.json({ 
          id: parseInt(id),
          data,
          hora_inicio,
          hora_fim,
          motivo: motivo || 'Indisponível',
          message: 'Indisponibilidade atualizada com sucesso' 
        });
      }
    );
  });
});

app.delete('/dias-indisponiveis/:id', (req, res) => {
  const { id } = req.params;
  console.log('Tentando deletar indisponibilidade com ID:', id);
  
  // Primeiro verificar se o registro existe
  db.get('SELECT * FROM dias_indisponiveis WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao verificar indisponibilidade:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!row) {
      console.log('Indisponibilidade não encontrada com ID:', id);
      return res.status(404).json({ error: 'Indisponibilidade não encontrada' });
    }
    
    console.log('Indisponibilidade encontrada:', row);
    
    // Agora deletar
    db.run('DELETE FROM dias_indisponiveis WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Erro ao remover indisponibilidade:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      console.log('Indisponibilidade removida com sucesso, changes:', this.changes);
      res.json({ message: 'Indisponibilidade removida com sucesso' });
    });
  });
});

// Endpoint de debug para verificar a estrutura da tabela
app.get('/debug/dias-indisponiveis-structure', (req, res) => {
  db.all("PRAGMA table_info(dias_indisponiveis)", (err, columns) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.all('SELECT * FROM dias_indisponiveis', (err2, rows) => {
      if (err2) {
        return res.status(500).json({ error: err2.message });
      }
      
      res.json({
        structure: columns,
        data: rows
      });
    });
  });
});

app.get('/', (req, res) => {
  res.send('API do sistema de agendamento do salão está online!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
