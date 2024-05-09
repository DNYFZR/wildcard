import React, { useState } from 'react';
import axios from 'axios';

import { PokerHand, parseHand } from './Poker';
import DisplayHand, { PlayingCardSet } from '../Cards';

const TexasHoldEm: React.FC = () => {  
  const [deckID, setDeckID] = useState<string|null>();
  const [activeGame, setActiveGame] = useState<boolean>(false);
  const [betRound, setBetRound] = useState<number>(0);

  const [playerCards, setPlayerCards] = useState<PlayingCardSet>({cards: []} as PlayingCardSet);
  const [dealerCards, setDealerCards] = useState<PlayingCardSet>({cards: []} as PlayingCardSet);
  const [tableCards, setTableCards] = useState<PlayingCardSet>({cards: []} as PlayingCardSet);

  const [playerHand, setPlayerHand] = useState<string>("");
  const [dealerHand, setDealerHand] = useState<string>("");
  
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [dealerScore, setDealerScore] = useState<number>(0);

  const [winningPlayer, setWinningPlayer] = useState<string>("");
  const celebration = "🥳🥳🥳 WINNER 🥳🥳🥳";

  const setupDeck = async() => {
    // Set game state to active
    setActiveGame(true);

    // Get Deck 
    if(deckID == null) {
      await axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
                ).then(res => setDeckID(res.data.deck_id)
                ).catch(error => console.error('Error:', error));
    }

    // Shuffle
    await axios.get(`https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`
              ).then(res => setDeckID(res.data.deck_id)
              ).catch(error => console.error('Error:', error));
  };

  const getACard = async(n:number) => {
    let useID = "";
    
    if(deckID == null){
      let res = await axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      useID = res.data.deck_id;
      setDeckID(useID);
    } 
    
    else {
      useID = deckID;
    }
    
    // Draw n-cards from the deck
    let res = await axios.get(`https://deckofcardsapi.com/api/deck/${useID}/draw/?count=${n}`);
    return {cards: res.data.cards} as PlayingCardSet;
    
  };

  const mergeHands = (hands: PlayingCardSet[]): PlayingCardSet => {
    return hands.reduce((acc: PlayingCardSet, hand: PlayingCardSet) => {
        return { cards: [...acc.cards, ...hand.cards] };
    }, { cards: [] });
};

  const clickNewGame = async() => {
    // Setup New Game
    setActiveGame(true);
    setBetRound(0);
    setWinningPlayer("");
    setPlayerScore(0);
    setDealerScore(0);
    setTableCards({cards: []} as PlayingCardSet);
    await setupDeck();
  
    // Get Cards
    let newCards = await getACard(4);
    let player = {cards: [newCards.cards[0], newCards.cards[2], ]} as PlayingCardSet;
    let dealer = {cards: [newCards.cards[1], newCards.cards[3], ]} as PlayingCardSet;

    // Update Hands    
    setPlayerCards(player);
    setDealerCards(dealer);

    setPlayerHand(parseHand(player));
    setDealerHand(parseHand(dealer));

  };

  const clickCheck = async() => {
    function scoreHand(hand: PokerHand): number {
      const handResult: Record<PokerHand, number> = {
        "Royal Flush": 10,
        "Straight Flush": 9,
        "Four of a Kind": 8, 
        "Full House": 7,
        "Flush": 6, 
        "Straight": 5,
        "Three of a Kind": 4,
        "Two Pair" : 3,
        "Pair": 2,
        "High Card": 1,
      };
    
      return handResult[hand];
    };
    
    let round = betRound + 1;
    
    if(round < 4){
      // Determine n-cards required for table    
      let n = 1;

      if(round === 1){
        n = 3;
      } 

      // Get cards
      let hand = await getACard(n);

      // Update hands
      let newTableCards = mergeHands([tableCards, hand]);
      setTableCards(newTableCards);
      setPlayerHand(parseHand(mergeHands([playerCards, newTableCards ])));
      setDealerHand(parseHand(mergeHands([dealerCards, newTableCards])));
    }

    // Determine if game finished
    if(round === 4){
      setActiveGame(false);
      setBetRound(0);
      
      // Report Winner
      let pScore = scoreHand(parseHand(mergeHands([playerCards, tableCards])) as PokerHand);
      let dScore = scoreHand(parseHand(mergeHands([dealerCards, tableCards])) as PokerHand);
      
      setPlayerScore(pScore);
      setDealerScore(dScore);
      
      if(pScore > dScore){
        setWinningPlayer("Player Wins");
      } else {
        setWinningPlayer("House Wins");
      }
    } 
    else{
      setBetRound(round);
    }    

  };

  
  return (
    <div className='game-table'>      
      <div className='game-controls'>
        <button className='App-button' onClick={clickNewGame}>New Game</button>
        {activeGame ? (
            <button className = 'App-button' onClick={clickCheck}>Check</button>
          ) : null}
      </div>

      <div className='game-hand'>
        {dealerCards && dealerCards.cards.length > 0 ? (
          <>
            <h4 className='game-winner'>Dealer ( {dealerHand} )</h4>
            <DisplayHand cards={dealerCards.cards} />

            <div className='game-winner'>
              {winningPlayer === "House Wins" ? (
                <>
                  <h4> {celebration}</h4>
                </>) : null}
            </div>

          </>
        ) : null}
      </div>
      
      <div className='game-cards'>
        {tableCards && tableCards.cards.length > 0 ? (
          <>
          <h4>Community Cards</h4>
            <DisplayHand cards={tableCards.cards} />
          </>
        ) : null}
      </div>
        
      <div className='game-hand'> 
        {playerCards && playerCards.cards.length > 0 ? (
          <> 
            <h4 className='game-winner'>Player ( {playerHand} )</h4>
            <DisplayHand cards={playerCards.cards} />

            <div className='game-winner'>
              {winningPlayer === "Player Wins" ? (
                <>
                  <h4>{celebration}</h4>
                </>) : null}
            </div>

          </>
        ) : null}
      </div>

    </div>
  );
};

export default TexasHoldEm;
