const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./database');
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// POST: Create a new form
app.post('/api/forms', (req, res) => {
  const { parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time } = req.body;
  
  try {
    const stmt = db.prepare('INSERT INTO forms (parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(parent, name, workOrder, program, radios, workTime, solderTest ? 1 : 0, comment, date, time);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    console.error('Error inserting form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// GET: Retrieve forms, optionally filtering by parent
app.get('/api/forms', (req, res) => {
  const parent = req.query.parent;
  
  try {
    const stmt = parent ? db.prepare('SELECT * FROM forms WHERE parent = ?') : db.prepare('SELECT * FROM forms');
    const forms = parent ? stmt.all(parent) : stmt.all();
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to retrieve forms' });
  }
});

// PUT: Update a form by ID
app.put('/api/forms/:id', (req, res) => {
  const { id } = req.params;
  const { parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time } = req.body;
  
  try {
    const stmt = db.prepare('UPDATE forms SET parent = ?, name = ?, workOrder = ?, program = ?, radios = ?, workTime = ?, solderTest = ?, comment = ?, date = ?, time = ? WHERE id = ?');
    stmt.run(parent, name, workOrder, program, radios, workTime, solderTest ? 1 : 0, comment, date, time, id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// DELETE: Delete a form by ID
app.delete('/api/forms/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare('DELETE FROM forms WHERE id = ?');
    stmt.run(id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// GET: Search for forms by query and optionally by parent
app.get('/api/search', (req, res) => {
  const { parent, query } = req.query;
  
  try {
    const stmt = parent
      ? db.prepare('SELECT * FROM forms WHERE parent = ? AND (name LIKE ? OR workOrder LIKE ? OR program LIKE ? OR comment LIKE ?)')
      : db.prepare('SELECT * FROM forms WHERE name LIKE ? OR workOrder LIKE ? OR program LIKE ? OR comment LIKE ?');
    const params = parent ? [parent, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`] : [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
    const results = stmt.all(...params);
    res.json(results);
  } catch (error) {
    console.error('Error searching forms:', error);
    res.status(500).json({ error: 'Failed to search forms' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
