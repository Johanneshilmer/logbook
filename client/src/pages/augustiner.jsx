import { Container, Row, Col } from "react-bootstrap";
import React, { useState } from "react";

// Components
import Header from  '../components/Header'
import Forms from '../components/Forms'
import Timer from '../components/Timer'
import Tables from '../components/Tables'



const dataForms = [
]

export default function Augustiner() {

  const [dataForms, setDataForms] = useState([]);


  const [timerStart, setTimerStart] = useState(false);

  const handleStartTimer = () => {
    setTimerStart(true); // Set timerStart to true to start the timer
  };


  return(
    <div>
      <Header />
      
      <Container className="mt-4">
        <Row>
          <Col>
          {/* Form here */}
            <Forms dataForms={dataForms} setDataForms={setDataForms} handleStartTimer={handleStartTimer} />
          </Col>
          <Col>
          {/* Timer here */}
            <Timer text="Augustiner" start={timerStart} />
          </Col>
        </Row>

        <Row className="mt-5">
          {/* Table */}
          <Tables dataForms={dataForms} setDataForms={setDataForms} />
        </Row>
      </Container>
    </div>
  )
};