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

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

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

io.on('connection', (socket) => {
  console.log('A user connected, id: ' + socket.id);

  // get data "sendTime" from frontend
  socket.on('sendTime', (timeData) => {
    //console.log(timeData);
    // send data "sendbacktime" to frontend
    io.emit("sendBackTime", timeData);
  });


  socket.on('timerAction', (data) => {
    const { action } = data;
    console.log(`Received timer action: ${action}`);

    // Broadcast the status to all clients
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
        console.log('Unknown action:', action);
    }
  });



  socket.on('disconnect', () => {
    console.log('User disconnected id: ' + socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
