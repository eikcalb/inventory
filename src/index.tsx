import 'antd/dist/antd.css';
import 'firebase';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { APPLICATION_CONTEXT, DEFAULT_APPLICATION } from './lib';
import reportWebVitals from './reportWebVitals';

export const electron = window.require('electron')

export const log = window.require('electron-log')
log.transports.console.level = 'silly'
log.transports.file.level = 'silly'

electron.remote.getCurrentWindow().webContents.openDevTools()

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename='/'  >
      <APPLICATION_CONTEXT.Provider value={DEFAULT_APPLICATION}>
        <App />
      </APPLICATION_CONTEXT.Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
