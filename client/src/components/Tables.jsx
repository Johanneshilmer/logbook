import Table from 'react-bootstrap/Table';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import EditModal from './EditModal'; // Import the EditModal component

export default function Tables({ dataForms, setDataForms }) {  // Added setDataForms here
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const deleteHandler = id => {
    const newList = dataForms.filter(item => item.id !== id);
    setDataForms(newList);
  };

  const startEditHandler = id => {
    const itemToEdit = dataForms.find(item => item.id === id);
    setEditingItem(itemToEdit);
    setShowModal(true);
  };

  const handleSaveEdit = updatedItem => {
    const updatedList = dataForms.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setDataForms(updatedList);
    setShowModal(false);
  };

  const tableRows = dataForms.map(items => (
    <tr key={items.id}>
      <td>{items.date}</td>
      <td>{items.time}</td>
      <td>{items.workOrder}</td>
      <td>{items.program}</td>
      <td>{items.radios}</td>
      <td>Worktime</td>
      <td>{items.solderTest ? "Y" : "N"}</td>
      <td>{items.name}</td>
      <td>{items.comment}</td>
      <td>
        <Button className='editbtn' variant="secondary" onClick={() => startEditHandler(items.id)}>Edit</Button>
        <Button className='deletebtn' variant="danger" onClick={() => deleteHandler(items.id)}>Delete</Button>
      </td>
    </tr>
  ));

  return (
    <div>
      {editingItem && (
        <EditModal 
          show={showModal}
          onHide={() => setShowModal(false)}
          item={editingItem}
          handleSaveEdit={handleSaveEdit}
        />
      )}
      <Table striped bordered hover responsive="xl">
        <thead>
          <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>Order</th>
            <th>Program</th>
            <th>TOP/BOT/SETUP</th>
            <th>Work Time</th>
            <th>ST</th>
            <th>ID</th>
            <th>Comment</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </Table>
    </div>
  );
}
