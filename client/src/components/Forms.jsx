import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { FloatingLabel } from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import React, { useState, useEffect } from 'react';

export default function Forms({ dataForms, setDataForms, handleStartTimer, handlePauseTimer, handleStopTimer, timerValue, resetTimer }) {

  // Top, bot, setup
  const radios = [
    { name: 'TOP', value: 'TOP' },
    { name: 'BOTTOM', value: 'BOTTOM' },
    { name: 'SETUP', value: 'SETUP' },
  ];

  // Date
  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  // Time
  const showTime = newDate.getHours() + ':' + newDate.getMinutes();

  // Full datatable
  const [dataForm, setForm] = useState({
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

  useEffect(() => {
    setForm(prevForm => ({
      ...prevForm,
      workTime: timerValue
    }));
  }, [timerValue]);

  // e == "event"
  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStartSubmit = e => {
    e.preventDefault();
    handleStartTimer();
    setDataForms([dataForm, ...dataForms]);
    // Reset the form after submission
    setForm({
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
  };

  const handleStopSubmit = e => {
    e.preventDefault();
    handleStopTimer();
    // Find the last entry and update the workTime
    const updatedDataForms = [...dataForms];
    if (updatedDataForms.length > 0) {
      updatedDataForms[0] = {
        ...updatedDataForms[0],
        workTime: timerValue,
      };
      setDataForms(updatedDataForms);
    }
    resetTimer();  // Reset the timer
  };

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

      {/* Button  */}
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
      
      {/* Comment */}
      <Form.Group className='mb-3' controlId="floatingTextarea">
        <FloatingLabel label="Comments">
          <Form.Control as="textarea" placeholder="Comments" style={{ height: '80px' }} value={dataForm.comment} name="comment" onChange={handleChange} />
        </FloatingLabel>
      </Form.Group>

      <Form.Group className='d-flex flex-row-reverse'>
        <Button variant="success" type="button" onClick={handleStartSubmit}>
          START
        </Button>

        <Button variant="danger" type="button" onClick={handleStopSubmit}>
          STOP
        </Button>

        <Button variant="secondary" type="button" onClick={handlePauseTimer}>
          PAUSE
        </Button>
      </Form.Group>
    </Form>
  );
}
