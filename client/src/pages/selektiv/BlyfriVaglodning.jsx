import { Container, Row, Col } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import SelektivHeader from '../../components/SelektivHeader';
import SelektivForm from '../../components/SelektivForm';
import Timer from '../../components/Timer';
import SelektivTables from '../../components/SelektivTables';
import axios from 'axios';

export default function BlyfriVaglodning({ socket }) {
  const [dataForms, setDataForms] = useState([]);
  const [timerStart, setTimerStart] = useState(false);
  const [timerValue, setTimerValue] = useState("00:00:00");
  const [timerStatus, setTimerStatus] = useState('stopped');
  const [elapsedTime, setElapsedTime] = useState(0);

  const parentIdentifier = 'Blyfi Våglödning';  // Unique identifier for this parent

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

  useEffect(() => {
    fetchData();

    const startTime = localStorage.getItem(`${parentIdentifier}_timerStartTime`);
    const storedElapsedTime = localStorage.getItem(`${parentIdentifier}_elapsedTime`);

    if (startTime) {
      const elapsedTime = Date.now() - parseInt(startTime, 10) + (parseInt(storedElapsedTime) || 0);
      handleTimerUpdate(formatTime(elapsedTime));
      setTimerStart(true);
      setTimerStatus('started');
      setElapsedTime(elapsedTime);
    } else if (storedElapsedTime) {
      handleTimerUpdate(formatTime(parseInt(storedElapsedTime, 10)));
      setTimerStatus('paused');
      setElapsedTime(parseInt(storedElapsedTime, 10));
    }
  }, []);

  const handleStartTimer = () => {
    setTimerStart(true);
    setTimerStatus('started');

    if (!localStorage.getItem(`${parentIdentifier}_timerStartTime`)) {
      localStorage.setItem(`${parentIdentifier}_timerStartTime`, Date.now().toString());
    }
  };

  const handlePauseTimer = () => {
    setTimerStart(false);
    setTimerStatus('paused');
    
    const startTime = localStorage.getItem(`${parentIdentifier}_timerStartTime`);
    if (startTime) {
      const elapsedTime = Date.now() - parseInt(startTime, 10);
      localStorage.setItem(`${parentIdentifier}_elapsedTime`, (parseInt(localStorage.getItem(`${parentIdentifier}_elapsedTime`) || '0') + elapsedTime).toString());
      localStorage.removeItem(`${parentIdentifier}_timerStartTime`);
    }
  };

  const handleStopTimer = () => {
    setTimerStart(false);
    setTimerStatus('stopped');
    setTimerValue("00:00:00");
    localStorage.removeItem(`${parentIdentifier}_timerStartTime`);
    localStorage.removeItem(`${parentIdentifier}_elapsedTime`);
  };

  const handleTimerUpdate = (newTime) => {
    setTimerValue(newTime);
  };

  const formatTime = (elapsedTime) => {
    const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, "0");
    const minutes = Math.floor((elapsedTime / 1000 / 60) % 60).toString().padStart(2, "0");
    const hours = Math.floor(elapsedTime / 1000 / 60 / 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const toggleButton = 'outline-primary';
  const editButton = 'primary';

  return (
    <div>
      <SelektivHeader />
      <Container fluid className="mt-4">
        <Row className="d-flex justify-content-center">
          <Col className="fixed-width" md={4}>
            <SelektivForm
              editColor={editButton}
              toggleColor={toggleButton}
              parent={parentIdentifier}
              dataForms={dataForms}
              setDataForms={setDataForms}
              handleStartTimer={handleStartTimer}
              handlePauseTimer={handlePauseTimer}
              handleStopTimer={handleStopTimer}
              timerValue={timerValue}
              timerStatus={timerStatus}
              socket={socket}
              elapsedTime={elapsedTime}
            />
          </Col>
          <Col md={5} className="timer-container">
            <Timer 
              text="Blyfi Våglödning"
              start={timerStart} 
              onUpdate={handleTimerUpdate} 
              socket={socket} 
              initialValue={timerValue}
              parentIdentifier={parentIdentifier}
              setElapsedTimeInParent={setElapsedTime}
            />
          </Col>
        </Row>
        <Row className="mt-5 d-flex justify-content-center">
          <Col md={11}>
            <SelektivTables 
              editColor={editButton}
              dataForms={dataForms}
              setDataForms={setDataForms}
              timerStatus={timerStatus}
              parentIdentifier={parentIdentifier}
              setTimerStatus={setTimerStatus}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
