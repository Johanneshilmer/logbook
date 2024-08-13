import React, { useState, useEffect, useContext } from 'react';
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
  handleStartTimer, 
  handlePauseTimer, 
  handleStopTimer, 
  timerValue, 
  parent,
  toggleColor,
  editColor
}) {
  const radios = [
    { name: 'TOP', value: 'TOP' },
    { name: 'BOTTOM', value: 'BOT' },
    { name: 'SETUP', value: 'SETUP' },
  ];

  const socket = useContext(SocketContext);

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  const minutes = newDate.getMinutes().toString().padStart(2, '0');
  const showTime = newDate.getHours() + ':' + minutes;

  const [dataForm, setForm] = useState({
    parent: parent,
    name: "",
    workOrder: "",
    program: "",
    radios: radios[0].value,
    workTime: "00:00:00",
    solderTest: false,
    comment: "",
    date: `${year}/${month < 10 ? `0${month}` : `${month}`}/${date}`,
    time: showTime,
  });

  const [timerStatus, setTimerStatus] = useState(() => {
    return localStorage.getItem(`${parent}_timerStatus`) || 'stopped';
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStartSubmit = async e => {
    e.preventDefault();

      // Validation check for ID and Work Order
    if (!dataForm.name) {
      alert("Please enter your ID.");
      return;
    }

    // Ensure the ID starts with the letter "t"
    if (!dataForm.name.toLowerCase().startsWith('t')) {
      alert("Please enter your ID.");
      return;
    }

    handleStartTimer();
    setTimerStatus('started');
    localStorage.setItem(`${parent}_timerStatus`, 'started');
    socket.emit('timerAction', { action: 'start', parentIdentifier: parent });
  
    try {
      const response = await axios.post('/api/forms', dataForm);
      const newDataForm = { ...dataForm, id: response.data.id };
      const sortedData = [newDataForm, ...dataForms].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      });
      setDataForms(sortedData);
      setForm({
        parent: parent,
        name: "",
        workOrder: "",
        program: "",
        radios: radios[0].value,
        workTime: "00:00:00",
        solderTest: false,
        comment: "",
        date: `${year}/${month < 10 ? `0${month}` : `${month}`}/${date}`,
        time: showTime,
      });
      socket.emit("createForm", newDataForm);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  const handleStopSubmit = async (e) => {
    e.preventDefault();
    handleStopTimer(timerValue);
    setTimerStatus('stopped');
    localStorage.setItem(`${parent}_timerStatus`, 'stopped');
    socket.emit('timerAction', { action: 'stop', parentIdentifier: parent });
  
    const updatedDataForms = [...dataForms];
    if (updatedDataForms.length > 0) {
      const updatedForm = {
        ...updatedDataForms[0],
        workTime: timerValue,
      };
  
      try {
        await axios.put(`/api/forms/${updatedForm.id}`, updatedForm);
        setDataForms(updatedDataForms.map(item => (item.id === updatedForm.id ? updatedForm : item)));
        socket.emit('updateForm', updatedForm);
      } catch (error) {
        console.error('Error updating the workTime:', error);
      }
    }
  };
  
  const handlePauseSubmit = e => {
    e.preventDefault();
    handlePauseTimer();
    setTimerStatus('paused');
    localStorage.setItem(`${parent}_timerStatus`, 'paused');
    socket.emit('timerAction', { action: 'pause', parentIdentifier: parent });
  };
  
  const handleResumeSubmit = e => {
    e.preventDefault();
    handleStartTimer();
    setTimerStatus('started');
    localStorage.setItem(`${parent}_timerStatus`, 'started');
    socket.emit('timerAction', { action: 'resume', parentIdentifier: parent });
  }

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

  return (
    <Form method="POST">
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formId">
          <FloatingLabel label="Enter Your ID">
            <Form.Control type="text" placeholder="Your ID" value={dataForm.name} name="name" onChange={handleChange} />
          </FloatingLabel>
        </Form.Group>

        <Form.Group as={Col} controlId="formWordOrder">
          <FloatingLabel label="Work Order">
            <Form.Control type="text" placeholder="Work Order" value={dataForm.workOrder} name="workOrder" onChange={handleChange} />
          </FloatingLabel>
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formProgram">
        <FloatingLabel label="Siplace Program">
          <Form.Control placeholder="Siplace Program" name="program" value={dataForm.program} onChange={handleChange} />
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
          <Button variant='success' type="button" onClick={handleResumeSubmit}>
            RESUME
          </Button>
        )}
        {(timerStatus === 'started' || timerStatus === 'paused' || timerStatus === 'resumed') && (
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
