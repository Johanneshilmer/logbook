const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require('./database');
const PORT = 3001;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// API Endpoints
app.post('/api/forms', (req, res) => {
  const { parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time } = req.body;

  try {
    const existingRecord = db.prepare('SELECT id FROM forms WHERE parent = ? AND name = ? AND workOrder = ?').get(parent, name, workOrder);
    if (existingRecord) {
      return res.status(409).json({ error: 'Record already exists' });
    }
    const stmt = db.prepare('INSERT INTO forms (parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(parent, name, workOrder, program, radios, workTime, solderTest ? 1 : 0, comment, date, time);
    const newForm = { ...req.body, id: info.lastInsertRowid };
    io.emit('newForm', newForm);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    console.error('Error inserting form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});


// get data
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

// Update form
app.put('/api/forms/:id', (req, res) => {
  const { id } = req.params;
  const { parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time } = req.body;

  try {
    const stmt = db.prepare('UPDATE forms SET parent = ?, name = ?, workOrder = ?, program = ?, radios = ?, workTime = ?, solderTest = ?, comment = ?, date = ?, time = ? WHERE id = ?');
    stmt.run(parent, name, workOrder, program, radios, workTime, solderTest ? 1 : 0, comment, date, time, id);
    io.emit('formUpdated', { id, ...req.body }); // Emit the updated form
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});


// delete by id
app.delete('/api/forms/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM forms WHERE id = ?');
    stmt.run(id);
    io.emit('formDeleted', id); // Emit the deleted form ID
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// search
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

// Socket.IO Connections
io.on('connection', (socket) => {

  // get data "sendTime" from frontend
  socket.on('sendTime', (timeData) => {
    io.emit("sendBackTime", timeData);
  });

  // Button update
  socket.on('timerAction', (data) => {
    const { action } = data;

    switch (action) {
      case 'start':
        io.emit('timerStatusUpdate', { status: 'started' });
        break;
      case 'stop':
        io.emit('timerStatusUpdate', { status: 'stopped' });
        break;
      case 'pause':
        io.emit('timerStatusUpdate', { status: 'paused' });
        break;
      case 'resume':
        io.emit('timerStatusUpdate', { status: 'started' });
        break;
      default:
        console.log('error:', action);
    }
  });

  // update form
  socket.on('updateForm', (formData) => {
    io.emit('formUpdated', formData);
  });

  // delete formId
  socket.on('deleteForm', (formId) => {
    io.emit('formDeleted', formId);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
