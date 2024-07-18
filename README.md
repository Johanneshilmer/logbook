# Manufacturing Work Order Tracker
Overview
This project is a Manufacturing Work Order Tracker that helps users log work orders, record work time, and manage comments and solderability test statuses. It includes a form submission feature, a timer, and a data table displaying the logged work orders. The project is built using React for the frontend and Node.js with Express for the backend, along with SQLite for the database.

Features
Form Submission: Users can submit work orders via a form.
Timer: A timer to record work time, with start, pause, and stop functionalities.
Data Table: Displays logged work orders.
Search Functionality: Allows users to search through logged work orders.
Edit and Delete: Users can edit and delete existing work orders.
Technology Stack
Frontend: React, React Bootstrap
Backend: Node.js, Express.js
Database: SQLite
Getting Started
Prerequisites
Node.js
npm (Node Package Manager)
Installation
1. Clone the repository:

```
git clone https://github.com/yourusername/work-order-tracker.git
cd work-order-tracker
```
2. Install backend dependencies:

```
cd backend
npm install
```
3. Install frontend dependencies:
```
cd ../frontend
npm install
```

## Database Setup
The project uses SQLite as the database. The database file will be created automatically if it doesn't exist.

### Running the Application
1. Start the backend server:

```
cd backend
node server.js
```
2. Start the frontend development server:

```
cd ../frontend
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
