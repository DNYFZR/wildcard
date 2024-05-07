import React from 'react';
import './App.css';

import logo from './images/poker_chip.png';

import GameSwitch, { ComponentsMap } from './components/GameSwitch';
import Blackjack from './components/Blackjack';
import HoldEmDealer from './components/HoldEm';

const gameMap: ComponentsMap = {
  'BlackJack': () => <Blackjack />,
  'Texas Hold Em': () => <HoldEmDealer />,
};


function App() {
  return (
    <div className="App">

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>WILDCARD </h1>
      </header>

      <GameSwitch cmap={gameMap} />
      
    </div>
  );
}

export default App;
