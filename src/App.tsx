import React from 'react';
import './App.css';

import logo from './images/burningAce.png';

import GameSwitch, { ComponentsMap } from './components/GameSwitch';
import Blackjack from './components/Blackjack';
import TexasHoldEm from './components/Poker';

const gameMap: ComponentsMap = {
  'BlackJack': () => <Blackjack />,
  'Poker': () => <TexasHoldEm/>,
};


function App() {
  return (
    <div className="App">

      <header className="App-header">
        <h1>Wildcard</h1>
      </header>

      <img src={logo} className="App-logo" alt="card games app logo" />
      <GameSwitch cmap={gameMap} />
    
    </div>
  );
}

export default App;
