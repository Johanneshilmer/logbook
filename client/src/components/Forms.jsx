import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { FloatingLabel } from 'react-bootstrap';

// Top-Bot-Setup
import { useState } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

// Form 

export default function Forms() {
  
  // Button TOP/BOT/SETUP
  const [radioValue, setRadioValue] = useState('1');
  const radios = [
    { name: 'TOP', value: 'TOP' },
    { name: 'BOTTOM', value: 'BOTTOM' },
    { name: 'SETUP', value: 'SETUP' },
  ];

  //Form data 
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      name: event.target.elements.name.value,
      workOrder: event.target.elements.workOrder.value,
      program: event.target.elements.program.value,
      radios: event.target.elements.radio.value,
      ST: event.target.elements.ST.value,
      comment: event.target.elements.comment.value,
    };
    const serializedBody = JSON.stringify(formData);
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serializedBody,
    };
    fetch("/register", fetchOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Handle successful response
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  };
  


  return (
    <Form onSubmit={handleSubmit} method="POST">
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formId">
          <FloatingLabel label="Enter Your ID">
            <Form.Control type="text" placeholder="Your ID" name="name" />
          </FloatingLabel>
        </Form.Group>

        <Form.Group as={Col} controlId="formWordOrder">
          <FloatingLabel label="Work Order">
            <Form.Control type="text" placeholder="Work Order" name="workOrder" />
          </FloatingLabel>
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formProgram">
        <FloatingLabel label="Seplace Program">
          <Form.Control placeholder="Siplace Program" name="program" />
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
                name="radio"
                value={radio.value}
                checked={radioValue === radio.value}
                onChange={(e) => setRadioValue(e.currentTarget.value)}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </Col>
        <Col>
          <Form.Check className='mt-2' type="switch" id="custom-switch" label="Solderability Test" name="ST" />
        </Col>
      </Row>
      

    {/* Comment */}
      <Form.Group className='mb-3' controlId="floatingTextarea">
        <FloatingLabel label="Comments">
          <Form.Control as="textarea" placeholder="Comments" style={{ height: '80px' }} name="comment" />
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