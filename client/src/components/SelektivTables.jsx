import React, { useState, useContext, useEffect, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import SelektivEditModal from './SelektivEditModal';
import SocketContext from '../socket/SocketContext';
import axios from 'axios';

export default function SelektivTables({ dataForms, setDataForms, timerStatus, setTimerStatus, parentIdentifier, editColor }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const socket = useContext(SocketContext);

  const handleNewForm = useCallback((newForm) => {
    if (newForm.parent === parentIdentifier) {
      setDataForms((prevDataForms) => {
        const formExists = prevDataForms.some(item => item.id === newForm.id);
        if (!formExists) {
          return [newForm, ...prevDataForms].slice(0, 6);
        }
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Duplicate form detected, skipping:', JSON.stringify(newForm, null, 2));
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
      setDataForms(prevDataForms =>
        prevDataForms.map(item => item.id === updatedForm.id ? updatedForm : item)
      );
    }
  }, [parentIdentifier, setDataForms]);

  const handleDeletedForm = useCallback((deletedForm) => {
    if (deletedForm.parent === parentIdentifier) {
      setDataForms(prevDataForms => prevDataForms.filter(item => item.id !== deletedForm.id));
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

    return () => {
      // Cleanup event listeners when component unmounts
      socket.off('newForm', handleNewForm);
      socket.off('formUpdated', handleUpdatedForm);
      socket.off('formDeleted', handleDeletedForm);
      socket.off('timerStatusUpdate', handleTimerStatusUpdate);
    };
  }, [socket, handleNewForm, handleUpdatedForm, handleDeletedForm, handleTimerStatusUpdate]);

  const deleteHandler = (id) => {
    const itemToDelete = dataForms.find(item => item.id === id);
    setItemToDelete(itemToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if ((timerStatus === 'started' || timerStatus === 'paused' || timerStatus === 'resumed') && dataForms.length > 0 && dataForms[0].id === itemToDelete.id) {
      alert("Cannot delete the first row while the timer is running or paused.");
      return;
    }

    try {
      await axios.delete(`/api/forms/${itemToDelete.id}`, { params: { parent: parentIdentifier } });
      setDataForms(prevDataForms => prevDataForms.filter(item => item.id !== itemToDelete.id));
      socket.emit('deleteForm', { parent: parentIdentifier, id: itemToDelete.id });
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const startEditHandler = (id) => {
    const itemToEdit = dataForms.find(item => item.id === id);
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

  const formatTime = (time) => {
    return time ? time.slice(0, 5) : '';
  };


  return (
    <div className="table-responsive">
      <Table striped bordered hover className="custom-table">
        <thead>
          <tr>
            <th className='main-date'>Date</th>
            <th>Start Time</th>
            <th>Stop Time</th>
            <th>Work Order</th>
            <th className='main-program'>Program</th>
            <th>Work Time</th>
            <th>Site</th>
            <th>Changeover</th>
            <th>Solder Test</th>
            <th className='main-id'>ID</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedDataForms.map((items, index) => (
            <tr key={`${items.id}-${index}`}>
              <td className='table-date'>{items.date}</td>
              <td>{formatTime(items.time)}</td>
              <td>{formatTime(items.stopTime)}</td>
              <td>{items.workOrder}</td>
              <td id='responise-program' className='table-program'>{items.program}</td>
              <td>{items.workTime}</td>
              <td>{items.radios}</td>
              <td>{items.changeOver}</td>
              <td>{items.solderTest ? "Y" : "N"}</td>
              <td className='table-id'>{items.name}</td>
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
        <SelektivEditModal
          show={showModal}
          onHide={() => setShowModal(false)}
          item={editingItem}
          handleSaveEdit={handleSaveEdit}
        />
      )}

      {showDeleteModal && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Delete work order: {itemToDelete?.workOrder}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
