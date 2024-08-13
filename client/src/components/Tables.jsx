import React, { useState, useContext, useEffect, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import EditModal from './EditModal';
import SocketContext from '../socket/SocketContext';
import axios from 'axios';


export default function Tables({ dataForms, setDataForms, timerStatus, setTimerStatus, parentIdentifier, editColor }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const socket = useContext(SocketContext);

  const handleNewForm = useCallback((newForm) => {
    if (newForm.parent === parentIdentifier) {
      setDataForms((prevDataForms) => {
        const exists = prevDataForms.some(item => item.id === newForm.id);
        if (exists) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Duplicate form detected, skipping:', JSON.stringify(newForm, null, 2));
          }
          return prevDataForms;
        }

        let updatedData = [newForm, ...prevDataForms];
        
        if (updatedData.length > 6) {
          updatedData = updatedData.slice(0, 6);
        }
        return updatedData;
      });
    }
  }, [parentIdentifier, setDataForms]);

  const handleUpdatedForm = useCallback((updatedForm) => {
    if (updatedForm.parent === parentIdentifier) {
      setDataForms((prevDataForms) => {
        return prevDataForms.map((item) => 
          item.id === updatedForm.id ? updatedForm : item
        );
      });
    }
  }, [parentIdentifier, setDataForms]);

  const handleDeletedForm = useCallback((deletedForm) => {
    if (deletedForm.parent === parentIdentifier) {
      setDataForms((prevDataForms) =>
        prevDataForms.filter((item) => item.id !== deletedForm.id)
      );
    }
  }, [parentIdentifier, setDataForms]);

  const handleTimerStatusUpdate = useCallback((data) => {
    if (data.parentIdentifier === parentIdentifier) {
      setTimerStatus(data.status);
    }
  }, [parentIdentifier, setTimerStatus]);

  useEffect(() => {
    // Register event listeners
    socket.on('newForm', handleNewForm);
    socket.on('formUpdated', handleUpdatedForm);
    socket.on('formDeleted', handleDeletedForm);
    socket.on('timerStatusUpdate', handleTimerStatusUpdate);

    // Cleanup event listeners when component unmounts
    return () => {
      socket.off('newForm', handleNewForm);
      socket.off('formUpdated', handleUpdatedForm);
      socket.off('formDeleted', handleDeletedForm);
      socket.off('timerStatusUpdate', handleTimerStatusUpdate);
    };
  }, [socket, handleNewForm, handleUpdatedForm, handleDeletedForm, handleTimerStatusUpdate]);

  const deleteHandler = async (id) => {
    if ((timerStatus === 'started' || timerStatus === 'paused' || timerStatus === 'resumed') && dataForms.length > 0 && dataForms[0].id === id) {
      alert("Cannot delete the first row while the timer is running or paused.");
      return;
    }
  
    try {
      await axios.delete(`/api/forms/${id}`, { params: { parent: parentIdentifier } });
      setDataForms((prevDataForms) => prevDataForms.filter((item) => item.id !== id));
      socket.emit('deleteForm', { parent: parentIdentifier, id });
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
      const updatedItem = { ...existingItem, ...updatedFields, parent: parentIdentifier };

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

  const displayedDataForms = sortedDataForms.slice(0, 6);

  return (
    <div className="table-responsive">
      <Table striped bordered hover className="custom-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Work Order</th>
            <th>Program</th>
            <th>Site</th>
            <th>Work Time</th>
            <th>Solder Test</th>
            <th>Name</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedDataForms.map((items, index) => (
            <tr key={`${items.id}-${index}`}>
              <td>{items.date}</td>
              <td>{items.time}</td>
              <td>{items.workOrder}</td>
              <td className='table-program'>{items.program}</td>
              <td>{items.radios}</td>
              <td>{items.workTime}</td>
              <td>{items.solderTest ? "Y" : "N"}</td>
              <td>{items.name}</td>
              <td className='table-comment'>{items.comment}</td>
              <td>
                <div className='action-buttons'>
                  <Button className='editbtn' variant={editColor} onClick={() => startEditHandler(items.id)}>
                    Edit
                  </Button>
                  <Button
                    className='deletebtn'
                    variant="danger"
                    onClick={() => deleteHandler(items.id)}
                    disabled={(timerStatus === 'started' || timerStatus === 'paused' || timerStatus === 'resumed') && index === 0}
                  >
                    X
                  </Button>
                </div>
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
    </div>
  );
}
