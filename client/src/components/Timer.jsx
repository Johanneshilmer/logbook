import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import SocketContext from '../socket/SocketContext';

const formatTime = (elapsedTime) => {
  const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, "0");
  const minutes = Math.floor((elapsedTime / 1000 / 60) % 60).toString().padStart(2, "0");
  const hours = Math.floor(elapsedTime / 1000 / 60 / 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export default function Timer({ text, start, onUpdate, initialValue, parentIdentifier }) {
  const socket = useContext(SocketContext);
  const [time, setTime] = useState(initialValue || "00:00:00");
  const [startTime, setStartTime] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerId = useRef(null);

  const startTimer = useCallback(() => {
    if (!startTime) return;
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
        localStorage.setItem(`${parentIdentifier}_timerStartTime`, now);
      }
      startTimer();
    } else {
      clearInterval(timerId.current);
      timerId.current = null;
    }

    return () => clearInterval(timerId.current);
  }, [timerRunning, startTimer]);

  useEffect(() => {
    const handleTimerStatusUpdate = ({ status, elapsedTime, parentIdentifier: id }) => {
      if (id === parentIdentifier) {  // Only handle events relevant to this parent
        if (status === 'started') {
          const start = Date.now() - elapsedTime;
          setStartTime(start);
          setTimerRunning(true);
          localStorage.setItem(`${parentIdentifier}_timerStartTime`, start);
        } else if (status === 'stopped') {
          setTimerRunning(false);
          setStartTime(null);
          setTime("00:00:00");
          localStorage.removeItem(`${parentIdentifier}_timerStartTime`);
        } else if (status === 'paused') {
          setTimerRunning(false);
        }
      }
    };

    socket.on("timerStatusUpdate", handleTimerStatusUpdate);

    return () => {
      socket.off("timerStatusUpdate", handleTimerStatusUpdate);
    };
  }, [socket, parentIdentifier]);

  useEffect(() => {
    const savedStartTime = localStorage.getItem(`${parentIdentifier}_timerStartTime`);
    if (savedStartTime) {
      const elapsed = Date.now() - parseInt(savedStartTime);
      setStartTime(parseInt(savedStartTime));
      setTime(formatTime(elapsed));
      setTimerRunning(true);
    }
  }, [parentIdentifier]);

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
