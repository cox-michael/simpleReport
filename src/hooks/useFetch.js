import { useState, useContext } from 'react';
import { SessionContext } from '../Session';

const useFetch = (endpoint, cb, method = 'POST') => {
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);
  const { loginState, setLoginState, openSnack } = useContext(SessionContext);

  const call = payload => new Promise((resolve, reject) => {
    setLoading(true);

    const request = {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    let url = `${process.env.API_URL}api/${endpoint}`;

    if (method === 'POST' && payload) request.body = JSON.stringify(payload);
    if (method === 'GET' && payload) {
      url += '?';
      url += Object.entries(payload).map(([key, val]) => `${key}=${val}`).join('&');
    }

    fetch(url, request)
      .then(response => {
        if (response.status === 401) {
          setLoginState({ ...loginState, isLoggedIn: false });
        }
        if (response.status === 404) {
          openSnack('API not found', 'error');
          setLoading(false);
        }
        if (response.status === 500) {
          openSnack('Internal Server Error', 'error');
          setLoading(false);
        }
        response.json().then(({ data, messages, success }) => {
          const errorMsg = messages.length ? messages[0] : 'An unknown error occurred';
          const successMsg = messages.length ? messages[0] : 'Success';

          setDenied(!success);
          if (success && cb) cb(data);
          if (success && messages.length) openSnack(messages[0], 'success');
          if (!success) openSnack(errorMsg, 'error');
          setLoading(false);

          if (success) { resolve(successMsg); return; }
          reject(new Error(errorMsg));
        });
      })
      .catch(err => console.error(err.message));
  });

  return [call, loading, denied];
};

export default useFetch;
