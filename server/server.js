const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require('./database');
const PORT = 3001;
require('dotenv').config();

const dbHost = process.env.DB_HOST

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: dbHost,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// API Endpoints

// Create a new form
app.post('/api/forms', (req, res) => {
  const { parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time } = req.body;

  try {
    const stmt = db.prepare('INSERT INTO forms (parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(parent, name, workOrder, program, radios, workTime, solderTest ? 1 : 0, comment, date, time);
    const newForm = { ...req.body, id: info.lastInsertRowid };
    io.emit('newForm', { parent, ...newForm });
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    console.error('Error inserting form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Get forms data
app.get('/api/forms', (req, res) => {
  const parent = req.query.parent;

  try {
    const stmt = parent 
    ? db.prepare('SELECT * FROM forms WHERE parent = ? ORDER BY date DESC, time DESC')
    : db.prepare('SELECT * FROM forms ORDER BY date DESC, time DESC');

    const forms = parent ? stmt.all(parent) : stmt.all();
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to retrieve forms' });
  }
});

// Update a form
app.put('/api/forms/:id', (req, res) => {
  const { id } = req.params;
  const { parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time } = req.body;

  try {
    const stmt = db.prepare('UPDATE forms SET parent = ?, name = ?, workOrder = ?, program = ?, radios = ?, workTime = ?, solderTest = ?, comment = ?, date = ?, time = ? WHERE id = ?');
    stmt.run(parent, name, workOrder, program, radios, workTime, solderTest ? 1 : 0, comment, date, time, id);
    const updatedForm = { id, parent, name, workOrder, program, radios, workTime, solderTest, comment, date, time };
    io.emit('formUpdated', updatedForm);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete a form by ID
app.delete('/api/forms/:id', (req, res) => {
  const { id } = req.params;
  const parent = req.query.parent;

  try {
    const stmt = db.prepare('DELETE FROM forms WHERE id = ?');
    stmt.run(id);
    io.emit('formDeleted', { parent, id });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});


// Search functionality with correct date and time handling
app.get('/api/search', (req, res) => {
  const { parent, query, startDate, endDate } = req.query;

  let baseQuery = 'SELECT * FROM forms WHERE (name LIKE ? OR workOrder LIKE ? OR program LIKE ? OR radios LIKE ? OR comment LIKE ? OR date LIKE ?)';
  let params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

  if (parent) {
    baseQuery += ' AND parent = ?';
    params.push(parent);
  }

  // Function to convert date to the correct format (yyyy/mm/dd) and adjust to start or end of the day
  const convertDateForSQL = (dateString, isEndDate = false) => {
    let date = new Date(dateString);

    if (isEndDate) {
      // end of the day
      date.setHours(23, 59, 59, 999);
    } else {
      // start of the day
      date.setHours(0, 0, 0, 0);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JS
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
  };

  if (startDate && endDate) {
    const startDateFormatted = convertDateForSQL(startDate); // Convert startDate yyyy/mm/dd starting at 00:00:00
    const endDateFormatted = convertDateForSQL(endDate, true); // Convert endDate yyyy/mm/dd ending at 23:59:59
    baseQuery += ' AND date BETWEEN ? AND ?';
    params.push(startDateFormatted, endDateFormatted);
  } else if (startDate) {
    const startDateFormatted = convertDateForSQL(startDate); // Convert startDate yyyy/mm/dd starting at 00:00:00
    baseQuery += ' AND date >= ?';
    params.push(startDateFormatted);
  } else if (endDate) {
    const endDateFormatted = convertDateForSQL(endDate, true); // Convert endDate yyyy/mm/dd ending at 23:59:59
    baseQuery += ' AND date <= ?';
    params.push(endDateFormatted);
  }

  baseQuery += ' ORDER BY date DESC, time DESC';

  try {
    const stmt = db.prepare(baseQuery);
    const results = stmt.all(...params);
    res.json(results);
  } catch (error) {
    console.error('Error searching forms:', error);
    res.status(500).json({ error: 'Failed to search forms' });
  }
});


// Socket.IO Connections
io.on('connection', (socket) => {

  // Handle timer actions
  socket.on('timerAction', (data) => {
    const { action, elapsedTime, parentIdentifier } = data;
  
    switch (action) {
      case 'start':
        io.emit('timerStatusUpdate', { status: 'started', elapsedTime, parentIdentifier });
        break;
      case 'stop':
        io.emit('timerStatusUpdate', { status: 'stopped', elapsedTime: 0, parentIdentifier });
        break;
      case 'pause':
        io.emit('timerStatusUpdate', { status: 'paused', elapsedTime, parentIdentifier });
        break;
      case 'resume':
        io.emit('timerStatusUpdate', { status: 'resumed', elapsedTime, parentIdentifier });
        break;
      default:
        console.log('Unknown timer action:', action);
    }
  });

  // Broadcast the new form to all clients
  socket.on('createForm', (formData) => {
    io.emit('newForm', formData);
  });

  // Update form
  socket.on('updateForm', (formData) => {
    io.emit('formUpdated', formData);
  });

  // Delete form by ID
  socket.on('deleteForm', (formId) => {
    io.emit('formDeleted', formId);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
