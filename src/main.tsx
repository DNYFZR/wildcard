import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import GameApp from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <GameApp />
  </React.StrictMode>
);

