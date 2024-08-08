import { Container, Row, Col } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import Header from '../components/Header';
import Forms from '../components/Forms';
import Timer from '../components/Timer';
import Tables from '../components/Tables';
import axios from 'axios';

export default function Augustiner({ socket }) {
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
    setTimerValue("00:00:00");
  };

  const handleTimerUpdate = (newTime) => {
    setTimerValue(newTime);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/forms', { params: { parent: 'augustiner' } });
        setDataForms(response.data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    fetchData();
  }, []); //Fetch data once component loads

  return (
    <div>
      <Header />
      <Container className="mt-4">
        <Row>
          <Col>
            <Forms
              parent="augustiner"
              dataForms={dataForms}
              setDataForms={setDataForms}
              handleStartTimer={handleStartTimer}
              handlePauseTimer={handlePauseTimer}
              handleStopTimer={handleStopTimer}
              timerValue={timerValue}
              socket={socket}
            />
          </Col>
          <Col>
            <Timer text="Augustiner" start={timerStart} onUpdate={handleTimerUpdate} socket={socket} />
          </Col>
        </Row>
        <Row className="mt-5">
          <Tables
            parent="augustiner"
            dataForms={dataForms}
            setDataForms={setDataForms}
          />
        </Row>
      </Container>
    </div>
  );
}