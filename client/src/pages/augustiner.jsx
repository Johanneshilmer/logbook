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
    // Timer value is already updated through Timer component's onUpdate
  };

  const handleTimerUpdate = (newTime) => {
    setTimerValue(newTime);
  };

  const resetTimer = () => {
    setTimerValue("00:00:00");
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
              resetTimer={resetTimer}
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