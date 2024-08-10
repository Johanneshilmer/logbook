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

    if (!localStorage.getItem('timerStartTime')) {
      // Store the current time as the start time if not already stored
      localStorage.setItem('timerStartTime', Date.now().toString());
    }
  };

  const handlePauseTimer = () => {
    setTimerStart(false);
    
    const startTime = localStorage.getItem('timerStartTime');
    if (startTime) {
      const elapsedTime = Date.now() - parseInt(startTime, 10);
      localStorage.setItem('elapsedTime', (parseInt(localStorage.getItem('elapsedTime') || '0') + elapsedTime).toString());
      localStorage.removeItem('timerStartTime'); // Clear the start time
    }
  };

  const handleStopTimer = () => {
    setTimerStart(false);
    setTimerValue("00:00:00");
    localStorage.removeItem('timerStartTime');
    localStorage.removeItem('elapsedTime');
  };

  const handleTimerUpdate = (newTime) => {
    setTimerValue(newTime);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/forms', { params: { parent: 'augustiner' } });
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

    // On page reload, check if the timer was running
    const startTime = localStorage.getItem('timerStartTime');
    const storedElapsedTime = localStorage.getItem('elapsedTime');

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
            <Timer 
              text="Augustiner" 
              start={timerStart} 
              onUpdate={handleTimerUpdate} 
              socket={socket} 
              initialValue={timerValue}
            />
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
