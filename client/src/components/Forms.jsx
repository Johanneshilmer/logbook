import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { FloatingLabel } from 'react-bootstrap';

// Top-Bot-Setup
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

//Hooks
import React, { useState } from 'react';

export default function Forms() {
  
  // Button TOP/BOT/SETUP
  const [radioValue, setRadioValue] = useState('1');
  const radios = [
    { name: 'TOP', value: 'TOP' },
    { name: 'BOTTOM', value: 'BOTTOM' },
    { name: 'SETUP', value: 'SETUP' },
  ];

  const [dataForm, setForm] = useState({
    name: "",
    workOrder: "",
    program: "",
    radios: "",
    solderTest: false,
    comment: "",
  });
  // e == "event"
  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "switch" ? checked : value,
    }));

    if (type === "radio") {
      setRadioValue(value);
    }
  };
  
  const handleSubmit = e => {
    e.preventDefault()
    console.log(dataForm);
  }


  return (
    <Form onSubmit={handleSubmit} method="POST">
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
        <FloatingLabel label="Seplace Program">
          <Form.Control placeholder="Siplace Program" name="program" value={dataForm.program} onChange={handleChange} />
        </FloatingLabel>
      </Form.Group>

      {/* Button  */}
      <Row>
        <Col>
          <ButtonGroup className='mt-1 mb-4'>
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
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

        <Button variant="success" type="submit">
          START
        </Button>

        <Button variant="danger" type="submit">
          STOP
        </Button>

        <Button variant="secondary" type="submit">
          PAUSE
        </Button>

      </Form.Group>
    </Form>
  );
}