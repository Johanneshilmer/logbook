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

  const parentIdentifier = 'augustiner';  // Unique identifier for this parent

  const handleStartTimer = () => {
    setTimerStart(true);

    if (!localStorage.getItem(`${parentIdentifier}_timerStartTime`)) {
      localStorage.setItem(`${parentIdentifier}_timerStartTime`, Date.now().toString());
    }
  };

  const handlePauseTimer = () => {
    setTimerStart(false);
    
    const startTime = localStorage.getItem(`${parentIdentifier}_timerStartTime`);
    if (startTime) {
      const elapsedTime = Date.now() - parseInt(startTime, 10);
      localStorage.setItem(`${parentIdentifier}_elapsedTime`, (parseInt(localStorage.getItem(`${parentIdentifier}_elapsedTime`) || '0') + elapsedTime).toString());
      localStorage.removeItem(`${parentIdentifier}_timerStartTime`);
    }
  };

  const handleStopTimer = () => {
    setTimerStart(false);
    setTimerValue("00:00:00");
    localStorage.removeItem(`${parentIdentifier}_timerStartTime`);
    localStorage.removeItem(`${parentIdentifier}_elapsedTime`);
  };

  const handleTimerUpdate = (newTime) => {
    setTimerValue(newTime);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/forms', { params: { parent: parentIdentifier } });
        const sortedData = response.data.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB - dateA;
        });
        setDataForms(sortedData);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    fetchData();

    const startTime = localStorage.getItem(`${parentIdentifier}_timerStartTime`);
    const storedElapsedTime = localStorage.getItem(`${parentIdentifier}_elapsedTime`);

    if (startTime) {
      const elapsedTime = Date.now() - parseInt(startTime, 10) + (parseInt(storedElapsedTime) || 0);
      handleTimerUpdate(formatTime(elapsedTime));
      setTimerStart(true);
    } else if (storedElapsedTime) {
      handleTimerUpdate(formatTime(parseInt(storedElapsedTime, 10)));
    }
  }, []);

  const formatTime = (elapsedTime) => {
    const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, "0");
    const minutes = Math.floor((elapsedTime / 1000 / 60) % 60).toString().padStart(2, "0");
    const hours = Math.floor(elapsedTime / 1000 / 60 / 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div>
      <Header />
      <Container className="mt-4">
        <Row>
          <Col>
            <Forms
              parent={parentIdentifier}
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
            <Timer 
              text="Augustiner" 
              start={timerStart} 
              onUpdate={handleTimerUpdate} 
              socket={socket} 
              initialValue={timerValue}
              parentIdentifier={parentIdentifier}  // Pass unique identifier
            />
          </Col>
        </Row>
        <Row className="mt-5">
          <Tables
            parent={parentIdentifier}
            dataForms={dataForms}
            setDataForms={setDataForms}
          />
        </Row>
      </Container>
    </div>
  );
}
