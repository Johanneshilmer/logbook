import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function useWebSocket(url) {
  const [socket, setSocket] = useState(null);
  const [timerValue, setTimerValue] = useState("00:00:00");
  const [timerStatus, setTimerStatus] = useState("stopped");

  useEffect(() => {
    const newSocket = io(url, { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('timerUpdate', ({ formattedTime, status }) => {
      setTimerValue(formattedTime);
      setTimerStatus(status);
    });

    return () => newSocket.close();
  }, [url]);

  const updateTimer = (formattedTime, status) => {
    if (socket) {
      socket.emit('timerUpdate', { formattedTime, status });
    }
  };

  return {
    timerValue,
    timerStatus,
    updateTimer,
  };
};