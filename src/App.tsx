import React from 'react';
import logo from './images/poker_chip.png';
import './App.css';

import TheCroupier from './components/Dealer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>WildCard</h1>
      </header>

      <TheCroupier />
    </div>
  );
}

export default App;
