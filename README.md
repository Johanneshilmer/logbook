# Manufacturing Work Order Tracker
## Overview
The **Manufacturing Work Order Tracker** is a comprehensive tool designed to help users efficiently log work orders, record work time, manage comments, and track solderability test statuses. The tracker supports a range of features including form submission, time tracking, data management, and advanced search capabilities. The project is built using **React** for the frontend, **Node.js** with **Express** for the backend, and **SQLite** as the database.

## Features
- **Form Submission:** Users can easily submit work orders through a user-friendly form interface.
- **Timer:** Integrated timer functionality allows users to record work time with start, pause, and stop controls.
- **Data Table:** Logged work orders are displayed in a data table, providing a clear overview of all entries.
- **Search Functionality:** 
  - Search through logged work orders by machine name.
  - Filter work orders based on date ranges, allowing users to locate records within specific time frames.
- **Edit and Delete:** Users have the ability to edit and delete existing work orders, ensuring the data remains accurate and up-to-date.
- **Logbook Tracking:** The system simultaneously tracks work orders for three machines, offering a streamlined process for managing multiple units.

## Technology Stack
- **Frontend:** [React](https://reactjs.org/), [React Bootstrap](https://react-bootstrap.github.io/)
- **Backend:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database:** [SQLite](https://www.sqlite.org/)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [npm (Node Package Manager)](https://www.npmjs.com/)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/johanneshilmer/logbook.git

2. **Install backend dependencies:**

```
cd server
npm install
```
3. Install frontend dependencies:
```
cd ../client
npm install
```

## Database Setup
The project uses SQLite as the database. The database file will be created automatically if it doesn't exist.

### Running the Application
1. Start the backend server:

```
cd server
node server.js
```
2. Start the frontend development server:

```
cd ../client
npm start
```
3. Open your browser and navigate to http://localhost:3000 to see the application in action.

## API Endpoints
### Create a new form
**- URL: /api/forms**

**- Method: POST**

**Body:**
```
{
  "parent": "parent_value",
  "name": "John Doe",
  "workOrder": "WO123456",
  "program": "Program A",
  "radios": "TOP",
  "workTime": "00:00:00",
  "solderTest": false,
  "comment": "Initial work order",
  "date": "2023/07/18",
  "time": "12:34"
}
```
### Retrieve forms
**- URL: /api/forms**

**- Method: GET**

**- Query Parameters:**
parent (optional): Filter by parent

## Update a form
**- URL: /api/forms/:id**

**- Method: PUT**

**Body:**
```
{
  "parent": "parent_value",
  "name": "John Doe",
  "workOrder": "WO123456",
  "program": "Program A",
  "radios": "TOP",
  "workTime": "00:00:00",
  "solderTest": false,
  "comment": "Updated comment",
  "date": "2023/07/18",
  "time": "12:34"
}
```
### Delete a form
**- URL: /api/forms/:id**

**- Method: DELETE**

### Search forms
**- URL: /api/search**

**- Method: GET**

**- Query Parameters:**
      parent (optional): Filter by parent
      query: Search query string

## Frontend Structure
**App.jsx:** Main application component that includes routing.
**Forms.jsx:** Form component to handle work order submissions.
**Timer.jsx:** Timer component to record work time.
**Tables.jsx:** Table component to display logged work orders.
**EditModal.jsx:** Modal component to edit existing work orders.

## Backend Structure
**server.js:** Main server file that handles API requests.
**database.js:** Database setup and initialization using SQLite.

## Troubleshooting
**404 Errors:** Ensure that the backend server is running and accessible. Check that the API endpoints are correctly defined and the frontend is pointing to the correct backend URL.
**Database Issues:** Verify that the SQLite database is properly set up and the forms table exists.


## License
**This project is licensed under the MIT License. See the LICENSE file for details.**
