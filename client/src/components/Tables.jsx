import Table from 'react-bootstrap/Table';
import React, { useState, useEffect, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import EditModal from './EditModal';
import axios from 'axios';
import SocketContext from '../socket/SocketContext';


export default function Tables({ dataForms, setDataForms, parent }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const socket = useContext(SocketContext);


  const deleteHandler = async id => {
    try {
      await axios.delete(`/api/forms/${id}`);
      const newList = dataForms.filter(item => item.id !== id);
      setDataForms(newList);
      socket.emit('deleteForm', id);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const startEditHandler = id => {
    const itemToEdit = dataForms.find(item => item.id === id);
    setEditingItem(itemToEdit);
    setShowModal(true);
  };

  const handleSaveEdit = async (id, updatedFields) => {
    try {
      const existingItem = dataForms.find(item => item.id === id);
      const updatedItem = { ...existingItem, ...updatedFields };

      await axios.put(`/api/forms/${updatedItem.id}`, updatedItem);
      const updatedList = dataForms.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      );
      setDataForms(updatedList);
      setShowModal(false);
      socket.emit('updateForm', updatedItem);
    } catch (error) {
      console.error('Error updating form:', error);
    }
  };

  // Sorting data
  const sortedDataForms = [...dataForms].sort((a, b) => {
    const dateA = new Date(`${a.date.replaceAll("/","-")}T${a.time}`);
    const dateB = new Date(`${b.date.replaceAll("/","-")}T${b.time}`);

    return dateB - dateA;
  });

  const tableRows = sortedDataForms.map(items => (
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
        <Button variant="danger" onClick={() => deleteHandler(items.id)}>
          Delete
        </Button>
      </td>

    </tr>
  ));

  // Load data from parent value
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/forms', { params: { parent } });
        setDataForms(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [setDataForms, parent]);


  // Listen for Socket.IO events to update table data
  useEffect(() => {
    socket.on("newForm", (newForm) => {
      setDataForms((prevForms) => [newForm, ...prevForms]);
    });

    socket.on("formUpdated", (updatedForm) => {
      setDataForms((prevForms) =>
        prevForms.map((form) => (form.id === updatedForm.id ? updatedForm : form))
      );
    });

    socket.on("formDeleted", (deletedFormId) => {
      setDataForms((prevForms) =>
        prevForms.filter((form) => form.id !== deletedFormId)
      );
    });

    return () => {
      socket.off("newForm");
      socket.off("formUpdated");
      socket.off("formDeleted");
    };
  }, [socket, setDataForms]);

  return (
    <div>
      <Table striped bordered hover responsive="xl">
        <thead>
          <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>Work Order</th>
            <th>Program</th>
            <th>Site</th>
            <th>Work Time</th>
            <th>Solder</th>
            <th>Employee</th>
            <th>Comments</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </Table>
      <EditModal show={showModal} onHide={() => setShowModal(false)} item={editingItem} handleSaveEdit={handleSaveEdit} />
    </div>
  );
}
