import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { FloatingLabel } from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import React, { useState, useEffect, useContext } from 'react';
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
}) {
  const radios = [
    { name: 'TOP', value: 'TOP' },
    { name: 'BOTTOM', value: 'BOTTOM' },
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
    return localStorage.getItem('timerStatus') || 'stopped';
  });

  useEffect(() => {
    setForm(prevForm => ({
      ...prevForm,
      workTime: timerValue
    }));
  }, [timerValue]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStartSubmit = async e => {
    e.preventDefault();
    handleStartTimer();
    setTimerStatus('started');
    localStorage.setItem('timerStatus', 'started');
    socket.emit('timerAction', { action: 'start' });

    try {
      const response = await axios.post('/api/forms', dataForm);
      const newDataForm = { ...dataForm, id: response.data.id };
      setDataForms([newDataForm, ...dataForms]);
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
    localStorage.setItem('timerStatus', 'stopped');
    socket.emit('timerAction', { action: 'stop' });
  
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
    localStorage.setItem('timerStatus', 'paused');
    socket.emit('timerAction', { action: 'pause' });
  };

  const handleResumeSubmit = e => {
    e.preventDefault();
    handleStartTimer();
    setTimerStatus('started');
    localStorage.setItem('timerStatus', 'started');
    socket.emit('timerAction', { action: 'resume' });
  }

  useEffect(() => {
    socket.on('timerStatusUpdate', (data) => {
      setTimerStatus(data.status);
      localStorage.setItem('timerStatus', data.status);
    });
    return () => {
      socket.off('timerStatusUpdate');
    };
  }, [socket]);

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
                variant={idx % 2 ? 'outline-success' : 'outline-danger'}
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
          <Form.Check className='mt-2' type="switch" checked={dataForm.solderTest} id="custom-switch" label="Solderability Test" name="solderTest" onChange={handleChange} />
        </Col>
      </Row>

      <Form.Group className='mb-3' controlId="floatingTextarea">
        <FloatingLabel label="Comments">
          <Form.Control as="textarea" placeholder="Comments" style={{ height: '80px' }} value={dataForm.comment} name="comment" onChange={handleChange} />
        </FloatingLabel>
      </Form.Group>

      <Form.Group className='d-flex flex-row-reverse'>
        {timerStatus === 'stopped' && (
          <Button variant="success" type="button" onClick={handleStartSubmit}>
            START
          </Button>
        )}
        {timerStatus === 'paused' && (
          <Button variant='success' type="button" onClick={handleResumeSubmit}>
            RESUME
          </Button>
        )}
        {(timerStatus === 'started' || timerStatus === 'paused') && (
          <div>
            <Button variant="danger" type="button" onClick={handleStopSubmit}>
              STOP
            </Button>
            {timerStatus === 'started' && (
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