import React, { useState, useContext, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import EditModal from './EditModal';
import axios from 'axios';
import SocketContext from '../socket/SocketContext';

export default function Tables({ dataForms, setDataForms, timerStatus }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on('formUpdated', (updatedForm) => {
      setDataForms((prevDataForms) => {
        // Check if the form already exists
        const exists = prevDataForms.some(item => item.id === updatedForm.id);
        if (!exists) {
          return [...prevDataForms, updatedForm];
        }
        // Replace the existing form with the updated one
        return prevDataForms.map((item) =>
          item.id === updatedForm.id ? updatedForm : item
        );
      });
    });

    socket.on('formDeleted', (deletedFormId) => {
      setDataForms((prevDataForms) =>
        prevDataForms.filter((item) => item.id !== deletedFormId)
      );
    });

    socket.on('newForm', (newForm) => {
      setDataForms((prevDataForms) => {
        // Validate that the form has a unique ID and is not a duplicate
        const exists = prevDataForms.some(item => item.id === newForm.id);
        if (exists) {
          console.warn('Duplicate form detected:', JSON.stringify(newForm, null, 2));
          return prevDataForms; // Avoid adding duplicate
        }
        return [newForm, ...prevDataForms];
      });
    });

    return () => {
      socket.off('formUpdated');
      socket.off('formDeleted');
      socket.off('newForm');
    };
  }, [socket, setDataForms]);

  const deleteHandler = async (id) => {
    // Check if the timer is running or paused and if this is the first row
    if ((timerStatus === 'started' || timerStatus === 'paused') && dataForms.length > 0 && dataForms[0].id === id) {
      alert("Cannot delete the first row while the timer is running or paused.");
      return;
    }
  
    try {
      await axios.delete(`/api/forms/${id}`);
      setDataForms((prevDataForms) => prevDataForms.filter((item) => item.id !== id));
      socket.emit('deleteForm', id); // Emit the delete event
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };
  
  

  const startEditHandler = (id) => {
    const itemToEdit = dataForms.find((item) => item.id === id);
    setEditingItem(itemToEdit);
    setShowModal(true);
  };

  const handleSaveEdit = async (id, updatedFields) => {
    try {
      const existingItem = dataForms.find((item) => item.id === id);
      const updatedItem = { ...existingItem, ...updatedFields };

      await axios.put(`/api/forms/${updatedItem.id}`, updatedItem);
      setDataForms((prevDataForms) =>
        prevDataForms.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      setShowModal(false);
      socket.emit('updateForm', updatedItem);
    } catch (error) {
      console.error('Error updating form:', error);
    }
  };

  const sortedDataForms = [...dataForms].sort((a, b) => {
    const dateA = new Date(`${a.date.replaceAll("/", "-")}T${a.time}`);
    const dateB = new Date(`${b.date.replaceAll("/", "-")}T${b.time}`);
    return dateB - dateA;
  });

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Work Order</th>
            <th>Program</th>
            <th>Radios</th>
            <th>Work Time</th>
            <th>Solder Test</th>
            <th>Name</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedDataForms.map((items, index) => (
            <tr key={items.id}>
              <td>{items.date}</td>
              <td>{items.time}</td>
              <td>{items.workOrder}</td>
              <td>{items.program}</td>
              <td>{items.radios}</td>
              <td>{items.workTime}</td>
              <td>{items.solderTest ? "Y" : "N"}</td>
              <td>{items.name}</td>
              <td>{items.comment}</td>
              <td>
                <Button variant="warning" onClick={() => startEditHandler(items.id)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deleteHandler(items.id)}
                  disabled={(timerStatus === 'started' || timerStatus === 'paused') && index === 0}
                >
                  X
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && editingItem && (
        <EditModal
          show={showModal}
          onHide={() => setShowModal(false)}
          item={editingItem}
          handleSaveEdit={handleSaveEdit}
        />
      )}
    </>
  );
}
