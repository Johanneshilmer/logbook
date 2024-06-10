import { Container, Row, Col } from "react-bootstrap";
import React, { useState } from "react";

// Components
import Header from  '../components/Header'
import Forms from '../components/Forms'
import Timer from '../components/Timer'
import Tables from '../components/Tables'



export default function Augustiner() {

  const [dataForms, setDataForms] = useState([]);


  const [timerStart, setTimerStart] = useState(false);
  const [timerValue, setTimerValue] = useState("00:00:00");

  const handleStartTimer = () => {
    setTimerStart(true);
  };

  const handlePauseTimer = () => {
    setTimerStart(false);
  };

  const handleStopTimer = () => {
    setTimerStart(false);
    handleFormSubmit();
  };

  const handleTimerUpdate = (newTime) => {
    setTimerValue(newTime);
  };

  const handleFormSubmit = () => {
    // Save timerValue to the table or perform any other action needed
    // Here you can update your table dataForms state with the timerValue
    console.log("Form Submitted with Timer Value: ", timerValue);
  };


  return(
    <div>
      <Header />
      
      <Container className="mt-4">
        <Row>
          <Col>
          {/* Form here */}
            <Forms 
              dataForms={dataForms} 
              setDataForms={setDataForms} 
              handleStartTimer={handleStartTimer} 
              handlePauseTimer={handlePauseTimer}
              handleStopTimer={handleStopTimer}
              timerValue={timerValue}
            />
          </Col>
          <Col>
          {/* Timer here */}
            <Timer text="Augustiner" start={timerStart} onUpdate={handleTimerUpdate} />
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