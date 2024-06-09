import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

export default function Timer({ text, start }) {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState("00:00:00");

  useEffect(() => {
    let timerId;

    const initTime = new Date();

    const showTimer = (hs) => {
      const second = Math.floor((hs / 1000) % 60).toString().padStart(2, "0");
      const minute = Math.floor((hs / 1000 / 60) % 60).toString().padStart(2, "0");
      const hour = Math.floor(hs / 1000 / 60 / 60).toString().padStart(2, "0");

      setTime(hour + ":" + minute + ":" + second);
    };

    const clearTime = () => {
      setTime("00:00:00");
      setCount(0);
    };

    if (start) {
      timerId = setInterval(() => {
        const left = count + (new Date() - initTime);
        setCount(left);
        showTimer(left);
      }, 1000);
    }

    return () => clearInterval(timerId);
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
