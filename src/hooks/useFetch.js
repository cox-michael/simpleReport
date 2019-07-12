import { useState, useContext } from 'react';
import { SessionContext } from '../Session';

const useFetch = (endpoint, cb) => {
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);
  const { loginState, setLoginState, openSnack } = useContext(SessionContext);

  const call = payload => {
    setLoading(true);

    fetch(`${process.env.API_URL}api/${endpoint}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (response.status === 401) {
          setLoginState({ ...loginState, isLoggedIn: false });
        }
        response.json().then(({ data, messages, success }) => {
          const msg = messages.length ? messages[0] : 'An unknown error occurred';

          setDenied(!success);
          if (success && cb) cb(data);
          if (success && messages.length) openSnack(messages[0], 'success');
          if (!success) openSnack(msg, 'error');
          setLoading(false);
        });
      });
  };

  return [call, loading, denied];
};

export default useFetch;
