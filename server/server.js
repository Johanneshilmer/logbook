const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const moment = require('moment-timezone');
const cors = require('cors');
const { db, selektivDb } = require('./database');
const PORT = 3001;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
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
  const { parent, name, workOrder, program, radios, workTime, solderTest, comment, solderResult = '-' } = req.body; // default to 'Good' if solderResult is not provided

  let changeOver = '00:00:00';

  try {
    // Use Swedish time zone for current date and time
    const currentDateTime = moment().tz('Europe/Stockholm');
    const time = currentDateTime.format('HH:mm:ss'); // Ensure to include seconds in time
    const date = currentDateTime.format('YYYY/MM/DD');
    const stopTime = time;

    // Get the latest form from the correct database
    const dbToUse = ['Augustiner', 'Franziskaner', 'Mackmyra'].includes(parent) ? db : selektivDb;

    const prevForm = dbToUse.prepare('SELECT * FROM forms WHERE parent = ? ORDER BY date DESC, time DESC LIMIT 1').get(parent);

    if (prevForm) {
      // Parse the previous stop time and current start time
      const prevStopTime = moment(prevForm.stopTime || prevForm.time, 'HH:mm:ss'); // Use stopTime if available, fallback to time
      const currentStartTime = moment(time, 'HH:mm:ss'); // Parse current time only

      // If crossing midnight, adjust by adding a day to the current start time
      if (currentStartTime.isBefore(prevStopTime)) {
        currentStartTime.add(1, 'day'); // Midnight cross-over
      }

      // Calculate the changeOver
      const changeOverMs = currentStartTime.diff(prevStopTime);
      const changeOverDuration = moment.duration(changeOverMs);

      const hours = Math.floor(changeOverDuration.asHours()).toString().padStart(2, '0');
      const minutes = changeOverDuration.minutes().toString().padStart(2, '0');
      const seconds = changeOverDuration.seconds().toString().padStart(2, '0');
      changeOver = `${hours}:${minutes}:${seconds}`;
    }

    // Insert the new form data into the correct database
    const stmt = dbToUse.prepare('INSERT INTO forms (parent, name, workOrder, program, radios, changeOver, workTime, solderTest, solderResult, comment, date, time, stopTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(parent, name, workOrder, program, radios, changeOver, workTime, solderTest ? 1 : 0, solderResult, comment, date, time, stopTime);

    const newForm = { ...req.body, id: info.lastInsertRowid, changeOver, date, time, stopTime, solderResult };
    io.emit('newForm', { parent, ...newForm });

    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    console.error('Error inserting form:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create form' });
  }
});


// Get forms data
app.get('/api/forms', (req, res) => {
  const parent = req.query.parent;
  try {
    // Choose the database based on the parent
    let chosenDb;
    if (['Augustiner', 'Franziskaner', 'Mackmyra'].includes(parent)) {
      chosenDb = db;
    } else {
      chosenDb = selektivDb;
    }
    // Prepare and execute the query on the selected database
    const query = parent
      ? 'SELECT * FROM forms WHERE parent = ? ORDER BY date DESC, time DESC'
      : 'SELECT * FROM forms ORDER BY date DESC, time DESC';

    const stmt = chosenDb.prepare(query);
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
  const { parent, name, workOrder, program, radios, changeOver, workTime, solderTest, solderResult, comment, date, time, stopTime } = req.body;

  try {
    // Determine which database to use based on parent value
    const dbToUse = ['Augustiner', 'Franziskaner', 'Mackmyra'].includes(parent) ? db : selektivDb;

    // Prepare the SQL statement to update all relevant fields
    const stmt = dbToUse.prepare(`
      UPDATE forms 
      SET parent = ?, 
          name = ?, 
          workOrder = ?, 
          program = ?, 
          radios = ?, 
          changeOver = ?, 
          workTime = ?, 
          solderTest = ?, 
          solderResult = ?, 
          comment = ?, 
          date = ?, 
          time = ?, 
          stopTime = ? 
      WHERE id = ?
    `);
    
    stmt.run(parent, name, workOrder, program, radios, changeOver, workTime, solderTest ? 1 : 0, solderResult, comment, date, time, stopTime, id);
    
    const updatedForm = { id, parent, name, workOrder, program, radios, changeOver, workTime, solderTest, solderResult, comment, date, time, stopTime };
    
    // Emit the update to connected clients
    io.emit('formUpdated', updatedForm);
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating form:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update form' });
  }
});




// Delete a form by ID
app.delete('/api/forms/:id', (req, res) => {
  const { id } = req.params;
  const parent = req.query.parent;

  try {
    // Choose the database based on the parent
    let chosenDb;
    if (['Augustiner', 'Franziskaner', 'Mackmyra'].includes(parent)) {
      chosenDb = db;
    } else {
      chosenDb = selektivDb;
    }
    const stmt = chosenDb.prepare('DELETE FROM forms WHERE id = ?');
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
  const { dbType ,parent, query, startDate, endDate, solderTest } = req.query;

  // Select the db based on dbType
  const selectedDb = dbType === 'selektiv' ? selektivDb : db;

  // Initialize the base query for searching
  let baseQuery = 'SELECT * FROM forms WHERE (name LIKE ? OR workOrder LIKE ? OR program LIKE ? OR radios LIKE ? OR comment LIKE ? OR date LIKE ? OR solderResult LIKE ?)';
  let params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

  // Add parent filter based on the parent parameter
  if (parent) {
    baseQuery += ' AND parent = ?';
    params.push(parent);
  }

  // Handle solderTest filter (Y or N)
  if (solderTest) {
    const solderTestValue = solderTest === 'Y' ? 1.0 : 0.0;
    baseQuery += ' AND solderTest = ?';
    params.push(solderTestValue);
  }

  // Function to convert date to the correct format (yyyy/mm/dd) and adjust to start or end of the day
  const convertDateForSQL = (dateString, isEndDate = false) => {
    let date = new Date(dateString);

    if (isEndDate) {
      // Adjust to the end of the day (23:59:59)
      date.setHours(23, 59, 59, 999);
    } else {
      // Adjust to the start of the day (00:00:00)
      date.setHours(0, 0, 0, 0);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JS
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
  };

  // Handle date range filters (startDate and endDate)
  if (startDate && endDate) {
    const startDateFormatted = convertDateForSQL(startDate); // Convert startDate to the correct format
    const endDateFormatted = convertDateForSQL(endDate, true); // Convert endDate to the correct format (end of the day)
    baseQuery += ' AND date BETWEEN ? AND ?';
    params.push(startDateFormatted, endDateFormatted);
  } else if (startDate) {
    const startDateFormatted = convertDateForSQL(startDate); // Convert startDate to the correct format (start of the day)
    baseQuery += ' AND date >= ?';
    params.push(startDateFormatted);
  } else if (endDate) {
    const endDateFormatted = convertDateForSQL(endDate, true); // Convert endDate to the correct format (end of the day)
    baseQuery += ' AND date <= ?';
    params.push(endDateFormatted);
  }

  // Final query sorting by date and time
  baseQuery += ' ORDER BY date DESC, time DESC';

  try {
    // Prepare and execute the query with the specified parameters using the selected database
    const stmt = selectedDb.prepare(baseQuery);
    const results = stmt.all(...params);
    res.json(results); // Return the results as a JSON response

    console.log('dbType:', dbType);
    console.log('Using Database:', dbType === 'selektiv' ? 'selektivDb' : 'db');
    console.log('Query:', baseQuery);

  } catch (error) {
    console.error('Error searching forms:', error);
    res.status(500).json({ error: 'Failed to search forms' });
  }
});

// Socket.IO Connections
const timerStates = {}; // Object to store timer state for each parent

io.on('connection', (socket) => {

  // Handle user joining a specific parentIdentifier
  socket.on('joinParent', (parentIdentifier) => {
    if (timerStates[parentIdentifier]) {
      const { status, startTime, elapsedTime } = timerStates[parentIdentifier];
      let currentElapsedTime = elapsedTime;

      if (status === 'started' || status === 'resumed') {
        currentElapsedTime += Date.now() - startTime;
      }

      socket.emit('timerStatusUpdate', {
        status,
        elapsedTime: currentElapsedTime,
        parentIdentifier
      });
    } else {
      socket.emit('timerStatusUpdate', {
        status: 'stopped',
        elapsedTime: 0,
        parentIdentifier
      });
    }
  });

  // Handle timer actions (start, stop, pause, resume)
  socket.on('timerAction', (data) => {
    const { action, elapsedTime, parentIdentifier } = data;

    if (!timerStates[parentIdentifier]) {
        timerStates[parentIdentifier] = {
            status: 'stopped',
            elapsedTime: 0,
            startTime: null,
        };
    }

    switch (action) {
        case 'start':
            timerStates[parentIdentifier].status = 'started';
            timerStates[parentIdentifier].startTime = Date.now();
            timerStates[parentIdentifier].elapsedTime = 0;
            break;
        case 'stop':
            timerStates[parentIdentifier].status = 'stopped';
            timerStates[parentIdentifier].elapsedTime = elapsedTime;
            timerStates[parentIdentifier].startTime = null;
            break;
        case 'pause':
            timerStates[parentIdentifier].status = 'paused';
            timerStates[parentIdentifier].elapsedTime += Date.now() - timerStates[parentIdentifier].startTime;
            timerStates[parentIdentifier].startTime = null;
            break;
        case 'resume':
            timerStates[parentIdentifier].status = 'resumed';
            timerStates[parentIdentifier].startTime = Date.now();
            break;
        default:
            console.log('Unknown timer action:', action);
    }

    io.emit('timerStatusUpdate', {
        status: timerStates[parentIdentifier].status,
        elapsedTime: timerStates[parentIdentifier].elapsedTime,
        parentIdentifier
    });
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
