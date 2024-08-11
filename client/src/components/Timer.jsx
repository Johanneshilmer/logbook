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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerId = useRef(null);

  const startTimer = useCallback(() => {
    if (!startTime) return;
    timerId.current = setInterval(() => {
      const currentTime = Date.now();
      const totalElapsedTime = currentTime - startTime + elapsedTime;
      const formattedTime = formatTime(totalElapsedTime);
      setTime(formattedTime);
      onUpdate(formattedTime);
    }, 1000);
  }, [startTime, elapsedTime, onUpdate]);

  useEffect(() => {
    if (timerRunning) {
      startTimer();
    } else {
      clearInterval(timerId.current);
      timerId.current = null;
    }

    return () => clearInterval(timerId.current);
  }, [timerRunning, startTimer]);

  useEffect(() => {
    const handleTimerStatusUpdate = ({ status, elapsedTime: newElapsedTime, parentIdentifier: id }) => {
      if (id === parentIdentifier) {
        if (status === 'started') {
          const now = Date.now();
          setStartTime(now);
          setElapsedTime(newElapsedTime || 0);
          setTimerRunning(true);
          localStorage.setItem(`${parentIdentifier}_timerStartTime`, now);
          localStorage.setItem(`${parentIdentifier}_elapsedTime`, newElapsedTime || 0);
        } else if (status === 'resumed') {
          const savedElapsedTime = parseInt(localStorage.getItem(`${parentIdentifier}_elapsedTime`), 10) || 0;
          const now = Date.now();
          setStartTime(now);
          setElapsedTime(savedElapsedTime); // Keep the accumulated elapsedTime
          setTimerRunning(true);
        } else if (status === 'stopped') {
          setTimerRunning(false);
          setStartTime(null);
          setElapsedTime(0);
          setTime("00:00:00");
          localStorage.removeItem(`${parentIdentifier}_timerStartTime`);
          localStorage.removeItem(`${parentIdentifier}_elapsedTime`);
        } else if (status === 'paused') {
          const currentTime = Date.now();
          const newElapsedTime = elapsedTime + (currentTime - startTime);
          setElapsedTime(newElapsedTime);
          setTimerRunning(false);
          localStorage.setItem(`${parentIdentifier}_elapsedTime`, newElapsedTime);
          clearInterval(timerId.current);
          timerId.current = null;
        }
      }
    };

    socket.on("timerStatusUpdate", handleTimerStatusUpdate);

    return () => {
      socket.off("timerStatusUpdate", handleTimerStatusUpdate);
    };
  }, [socket, startTime, elapsedTime, parentIdentifier]);

  useEffect(() => {
    const savedStartTime = localStorage.getItem(`${parentIdentifier}_timerStartTime`);
    const savedElapsedTime = parseInt(localStorage.getItem(`${parentIdentifier}_elapsedTime`), 10) || 0;

    if (savedStartTime && start) {
      const now = Date.now();
      const elapsed = now - parseInt(savedStartTime, 10) + savedElapsedTime;
      setStartTime(parseInt(savedStartTime, 10));
      setElapsedTime(savedElapsedTime);
      setTime(formatTime(elapsed));
      setTimerRunning(true);
    } else if (!timerRunning && savedElapsedTime) {
      setTime(formatTime(savedElapsedTime));
      setElapsedTime(savedElapsedTime);
    }
  }, [parentIdentifier, timerRunning, start]);

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
