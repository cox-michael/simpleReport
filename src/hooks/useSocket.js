import { useState, useEffect, useContext } from 'react';
import socketIOClient from 'socket.io-client';
import { SessionContext } from '../Session';

const useSocket = namespace => {
  const [socket, setSocket] = useState(null);
  const { openSnack } = useContext(SessionContext);

  useEffect(() => {
    const s = socketIOClient(`http://${process.env.FULL_URL}/${namespace}`, { path: '/socket.io' });

    s.on('openSnack', body => openSnack(body.messages[0], body.type));

    setSocket(s);
    return () => s.disconnect();
  }, []);

  return [socket];
};

export default useSocket;
