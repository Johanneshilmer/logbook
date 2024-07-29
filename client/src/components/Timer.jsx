import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import SocketContext from '../socket/SocketContext';

export default function Timer({ text, start, onUpdate }) {
  const socket = useContext(SocketContext);
  const [count, setCount] = useState(0);
  const [time, setTime] = useState("00:00:00");

  const showTimer = useCallback((hs) => {
    const second = Math.floor((hs / 1000) % 60).toString().padStart(2, "0");
    const minute = Math.floor((hs / 1000 / 60) % 60).toString().padStart(2, "0");
    const hour = Math.floor(hs / 1000 / 60 / 60).toString().padStart(2, "0");

    const formattedTime = `${hour}:${minute}:${second}`;
    setTime(formattedTime);
    onUpdate(formattedTime);
  }, [onUpdate]);

  useEffect(() => {
    let id;
    if (start) {
      const initTime = Date.now() - count;
      id = setInterval(() => {
        const elapsedTime = Date.now() - initTime;
        setCount(elapsedTime);
        showTimer(elapsedTime);
      }, 1000);
    } else if (!start) {
      clearInterval(id);
    }
    return () => clearInterval(id);
  }, [start, count, showTimer]);

  useEffect(() => {
    socket.emit("sendTime", { time });

    socket.on("sendBackTime", (timeData) => {
      setTime(timeData.time);
    });
    return () => {
      socket.off("sendBackTime");
    };
  }, [socket, time]);

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