import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

export default function Timer({ text, start, onUpdate }) {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState("00:00:00");
  const [initTime, setInitTime] = useState(new Date());

  const showTimer = (hs) => {
    const second = Math.floor((hs / 1000) % 60).toString().padStart(2, "0");
    const minute = Math.floor((hs / 1000 / 60) % 60).toString().padStart(2, "0");
    const hour = Math.floor(hs / 1000 / 60 / 60).toString().padStart(2, "0");

    const formattedTime = `${hour}:${minute}:${second}`;
    setTime(formattedTime);
    onUpdate(formattedTime);
  };

  useEffect(() => {
    let id;
    if (start) {
      setInitTime(new Date() - count);
      id = setInterval(() => {
        const elapsedTime = new Date() - initTime;
        setCount(elapsedTime);
        showTimer(elapsedTime);
      }, 1000);
    }
    return () => clearInterval(id);
  }, [start]);

  return (
    <Container>
      <Row>
        <Col sm={12} className='mb-5'>
          <h1>{text}</h1>
        </Col>
        <Col className='d-flex justify-content-center mt-5'>
          <span>{time}</span>
        </Col>
      </Row>
    </Container>
  );
}