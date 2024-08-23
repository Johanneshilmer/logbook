import React, { useState, useContext, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { FloatingLabel } from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import axios from 'axios';
import SocketContext from '../socket/SocketContext';


export default function Forms({ 
  dataForms, 
  setDataForms, 
  parent,
  toggleColor,
  editColor,
  elapsedTime  // Receive elapsedTime from the Timer component
}) {
  const radios = [
    { name: 'TOP', value: 'TOP' },
    { name: 'BOTTOM', value: 'BOT' },
    { name: 'SETUP', value: 'SETUP' },
  ];

  const formatTime = (elapsedTime) => {
    if (isNaN(elapsedTime) || elapsedTime < 0) {
      return "00:00:00"; // Default to zero time if the input is invalid
    }
    const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, "0");
    const minutes = Math.floor((elapsedTime / 1000 / 60) % 60).toString().padStart(2, "0");
    const hours = Math.floor(elapsedTime / 1000 / 60 / 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };
  

  const socket = useContext(SocketContext);

  const [dataForm, setForm] = useState({
    parent: parent,
    name: "",
    workOrder: "",
    program: "",
    changeOver: "00:00:00",
    workTime: "00:00:00",
    radios: radios[0].value,
    solderTest: false,
    comment: "",
  });

  const [timerStatus, setTimerStatus] = useState(() => {
    return localStorage.getItem(`${parent}_timerStatus`) || 'stopped';
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStartSubmit = async e => {
    e.preventDefault();

    if (!dataForm.name || !dataForm.name.toLowerCase().startsWith('t')) {
      alert("Please enter a valid ID.");
      return;
    }

    setTimerStatus('started');
    localStorage.setItem(`${parent}_timerStatus`, 'started');
    socket.emit('timerAction', { action: 'start', parentIdentifier: parent });

    try {
      const response = await axios.post('/api/forms', dataForm);
      socket.emit("createForm", response.data);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleStopSubmit = async (e) => {
    e.preventDefault();
  
    setTimerStatus('stopped');
    localStorage.setItem(`${parent}_timerStatus`, 'stopped');
    socket.emit('timerAction', { action: 'stop', parentIdentifier: parent });
  
    const stopTime = new Date().toTimeString().split(' ')[0]; // Capture the current stop time
    const updatedWorkTime = formatTime(elapsedTime);  // Use elapsedTime passed from Timer
  
    try {
      const mostRecentForm = dataForms[0];  // Assume dataForms is sorted with the most recent form first
  
      if (mostRecentForm) {
        const updatedForm = {
          ...mostRecentForm,
          workTime: updatedWorkTime,
          stopTime: stopTime,  // Update the stop time
        };
  
        // Update the form in the database
        await axios.put(`/api/forms/${updatedForm.id}`, updatedForm);
  
        // Notify other parts of the application about the form update
        socket.emit('updateForm', updatedForm);
  
        // Update local state
        setDataForms(prevDataForms => prevDataForms.map(item => (item.id === updatedForm.id ? updatedForm : item)));
      }
    } catch (error) {
      console.error('Error updating the stopTime:', error);
    }
  };
  



  const handlePauseSubmit = e => {
    e.preventDefault();
    setTimerStatus('paused');
    localStorage.setItem(`${parent}_timerStatus`, 'paused');
    socket.emit('timerAction', { action: 'pause', parentIdentifier: parent });
  };

  const handleResumeSubmit = e => {
    e.preventDefault();
    setTimerStatus('resumed'); // Update to resumed state
    localStorage.setItem(`${parent}_timerStatus`, 'resumed');
    socket.emit('timerAction', { action: 'resume', parentIdentifier: parent });
  };

  const resetForm = () => {
    setForm({
      parent: parent,
      name: "",
      workOrder: "",
      program: "",
      changeOver: "00:00:00",
      workTime: "00:00:00",
      radios: radios[0].value,
      solderTest: false,
      comment: "",
    });
  };

  useEffect(() => {
    socket.on('timerStatusUpdate', (data) => {
      if (data.parentIdentifier === parent) {
        setTimerStatus(data.status);
        localStorage.setItem(`${parent}_timerStatus`, data.status);
      }
    });

    return () => {
      socket.off('timerStatusUpdate');
    };
  }, [socket, parent]);

  function handleEnterKey(e, nextElementId) {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the form from submitting when Enter is pressed
      const nextElement = document.querySelector(`[name="${nextElementId}"]`);
      if (nextElement) {
        nextElement.focus(); // Move focus to the next element
      }
    }
  }

  return (
    <Form method="POST">
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formId">
          <FloatingLabel label="Enter Your ID">
            <Form.Control type="text" placeholder="Your ID" value={dataForm.name} name="name" onChange={handleChange} onKeyDown={(e) => handleEnterKey(e, 'workOrder')}/>
          </FloatingLabel>
        </Form.Group>

        <Form.Group as={Col} controlId="formWordOrder">
          <FloatingLabel label="Work Order">
            <Form.Control type="text" placeholder="Work Order" value={dataForm.workOrder} name="workOrder" onChange={handleChange} onKeyDown={(e) => handleEnterKey(e, 'program')}/>
          </FloatingLabel>
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formProgram">
        <FloatingLabel label="Siplace Program">
          <Form.Control placeholder="Siplace Program" name="program" value={dataForm.program} onChange={handleChange} onKeyDown={(e) => handleEnterKey(e, 'comment')}/>
        </FloatingLabel>
      </Form.Group>

      <Row>
        <Col>
          <ButtonGroup className='mt-1 mb-4'>
            {radios.map((radio, idx) => (
              <ToggleButton
                key={radio.value}
                id={`radio-${idx}`}
                type="radio"
                variant={toggleColor}
                name="radios"
                value={radio.value}
                checked={dataForm.radios === radio.value}
                onChange={handleChange}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </Col>
        <Col>
          <Form.Check
            className='mt-2' 
            type="switch" 
            checked={dataForm.solderTest} 
            id="custom-switch" 
            label="Solderability Test" 
            name="solderTest" 
            onChange={handleChange}
          />
        </Col>
      </Row>

      <Form.Group className='mb-3' controlId="floatingTextarea">
        <FloatingLabel label="Comments">
          <Form.Control as="textarea" placeholder="Comments" style={{ height: '80px' }} value={dataForm.comment} name="comment" onChange={handleChange} />
        </FloatingLabel>
      </Form.Group>

      <Form.Group className='d-flex flex-row-reverse'>
        {timerStatus === 'stopped' && (
          <Button variant={editColor} type="button" onClick={handleStartSubmit}>
            START
          </Button>
        )}
        {timerStatus === 'paused' && (
          <div>
            <Button variant="danger" type="button" onClick={handleStopSubmit}>
              STOP
            </Button>
            <Button variant='success' type="button" onClick={handleResumeSubmit}>
              RESUME
            </Button>
          </div>
        )}
        {(timerStatus === 'started' || timerStatus === 'resumed') && (
          <div>
            <Button variant="danger" type="button" onClick={handleStopSubmit}>
              STOP
            </Button>
            {(timerStatus === 'started' || timerStatus === 'resumed') && (
              <Button variant="secondary" type="button" onClick={handlePauseSubmit}>
                PAUSE
              </Button>
            )}
          </div>
        )}
      </Form.Group>
    </Form>
  );
}
