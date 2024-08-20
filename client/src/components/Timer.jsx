import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import SocketContext from '../socket/SocketContext';

// Default value for timer
const formatTime = (elapsedTime) => {
  if (isNaN(elapsedTime) || elapsedTime < 0) {
    return "00:00:00";
  }
  const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, "0");
  const minutes = Math.floor((elapsedTime / 1000 / 60) % 60).toString().padStart(2, "0");
  const hours = Math.floor(elapsedTime / 1000 / 60 / 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export default function Timer({ text, parentIdentifier, onUpdate, setElapsedTimeInParent }) {
  const socket = useContext(SocketContext);
  const [time, setTime] = useState("00:00:00");
  const [elapsedTime, setElapsedTimeState] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerId = useRef(null);

  const updateTimerDisplay = useCallback((newElapsedTime) => {
    const formattedTime = formatTime(newElapsedTime);
    setTime(formattedTime);
    setElapsedTimeState(newElapsedTime); // Update local state
    if (setElapsedTimeInParent) {
      setElapsedTimeInParent(newElapsedTime);
    }
    if (onUpdate) {
      onUpdate(formattedTime);
    }
  }, [setElapsedTimeInParent, onUpdate]);

  const startTimer = useCallback(() => {
    timerId.current = setInterval(() => {
      setElapsedTimeState((prevElapsedTime) => {
        const newElapsedTime = prevElapsedTime + 1000;
        updateTimerDisplay(newElapsedTime);
        return newElapsedTime;
      });
    }, 1000);
  }, [updateTimerDisplay]);

  useEffect(() => {
    socket.emit('joinParent', parentIdentifier);

    const handleTimerStatusUpdate = ({ status, elapsedTime: newElapsedTime, parentIdentifier: id }) => {
      if (id === parentIdentifier) {
        clearInterval(timerId.current); // Clear any existing intervals

        const timeToSet = newElapsedTime || 0;
        setElapsedTimeState(timeToSet);
        updateTimerDisplay(timeToSet);

        if (status === 'started' || status === 'resumed') {
          setTimerRunning(true);
          startTimer();
        } else {
          setTimerRunning(false);
          clearInterval(timerId.current);
        }
      }
    };

    socket.on("timerStatusUpdate", handleTimerStatusUpdate);

    return () => {
      socket.off("timerStatusUpdate", handleTimerStatusUpdate);
      clearInterval(timerId.current);
    };
  }, [socket, parentIdentifier, startTimer, updateTimerDisplay]);

  return (
    <Container>
      <Row>
        <Col sm={12} className='mb-5'>
          <h1 className='page-title'>{text}</h1>
        </Col>
        <Col className='d-flex justify-content-center mt-5'>
          <span className='timer'>{time}</span>
        </Col>
      </Row>
    </Container>
  );
}
