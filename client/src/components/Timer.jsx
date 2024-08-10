import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import SocketContext from '../socket/SocketContext';

// Move the formatTime function outside the component
const formatTime = (elapsedTime) => {
  const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, "0");
  const minutes = Math.floor((elapsedTime / 1000 / 60) % 60).toString().padStart(2, "0");
  const hours = Math.floor(elapsedTime / 1000 / 60 / 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export default function Timer({ text, start, onUpdate, initialValue }) {
  const socket = useContext(SocketContext);
  const [time, setTime] = useState("00:00:00");
  const [startTime, setStartTime] = useState(null);  // Store the actual start time
  const [timerRunning, setTimerRunning] = useState(false);
  const timerId = useRef(null);

  // Start the timer and keep it running
  const startTimer = useCallback(() => {
    if (!startTime) return;  // Ensure we have a start time
    timerId.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const formattedTime = formatTime(elapsed);
      setTime(formattedTime);
      onUpdate(formattedTime);
    }, 1000);
  }, [startTime, onUpdate]);

  useEffect(() => {
    if (timerRunning) {
      if (!startTime) {
        const now = Date.now();
        setStartTime(now);
        localStorage.setItem('timerStartTime', now);
      }
      startTimer();
    } else {
      clearInterval(timerId.current);
      timerId.current = null;
    }

    return () => clearInterval(timerId.current);
  }, [timerRunning, startTime, startTimer]);

  useEffect(() => {
    const handleTimerStatusUpdate = ({ status, elapsedTime }) => {
      if (status === 'started') {
        const start = Date.now() - elapsedTime;
        setStartTime(start);
        setTimerRunning(true);
        localStorage.setItem('timerStartTime', start);
      } else if (status === 'stopped') {
        setTimerRunning(false);
        setStartTime(null);
        setTime("00:00:00");
        localStorage.removeItem('timerStartTime');
      } else if (status === 'paused') {
        setTimerRunning(false);
      }
    };

    socket.on("timerStatusUpdate", handleTimerStatusUpdate);

    return () => {
      socket.off("timerStatusUpdate", handleTimerStatusUpdate);
    };
  }, [socket]);

  useEffect(() => {
    const savedStartTime = localStorage.getItem('timerStartTime');
    if (savedStartTime) {
      const elapsed = Date.now() - parseInt(savedStartTime);
      setStartTime(parseInt(savedStartTime));
      setTime(formatTime(elapsed));
      setTimerRunning(true);
    }
  }, []);

  return (
    <Container>
      <Row>
        <Col sm={12} className='mb-5'>
          <h1>{text}</h1>
        </Col>
        <Col className='d-flex justify-content-center mt-5'>
          <span>{time}</span> {/* Render the time value */}
        </Col>
      </Row>
    </Container>
  );
}
