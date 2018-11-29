console.log('Environment: ' + process.env.NODE_ENV);
console.log('API_URL: ' + process.env.API_URL);

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import App from './app'

const root = document.querySelector('#root')
ReactDOM.render(<App />, root)
