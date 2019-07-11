import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

if (process.env.NODE_ENV !== 'production') console.log(`Environment: ${process.env.NODE_ENV}`);
// console.log(`API_URL: ${process.env.API_URL}`);

const root = document.querySelector('#root'); // eslint-disable-line no-undef
ReactDOM.render(<App />, root);
