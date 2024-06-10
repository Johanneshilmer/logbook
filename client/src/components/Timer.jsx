import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

export default function Timer({ start, onUpdate }) {
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    let timerId;

    if (start) {
      const initTime = Date.now() - time;
      timerId = setInterval(() => {
        setTime(Date.now() - initTime);
      }, 1000);
      setIntervalId(timerId);
    } else if (!start && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => clearInterval(timerId);
  }, [start]);

  useEffect(() => {
    const formattedTime = formatTime(time);
    onUpdate(formattedTime);
  }, [time]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <Container>
      <Row>
        <Col sm={12} className='mb-5'>
          <h1>Timer</h1>
        </Col>
        <Col className='d-flex justify-content-center mt-5'>
          <span>{formatTime(time)}</span>
        </Col>
      </Row>
    </Container>
  );
}