// Poker Minigame Component

import React, { useState } from 'react';
import axios from 'axios';
import DisplayHand, { PlayingCardSet } from './Cards';

const TexasHoldEm: React.FC = () => {  
  const [deckID, setDeckID] = useState<string|null>(null);
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
    let useID = deckID;

    // Get New Deck 
    if(deckID === null) {
      await axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
                ).then(res => useID = res.data.deck_id
                ).catch(error => console.error('Error:', error));
    }

    // Shuffle
    await axios.get(`https://deckofcardsapi.com/api/deck/${useID}/shuffle/`
              ).catch(error => console.error('Error:', error));

    // Updated deckID
    setDeckID(useID);
  };

  const getACard = async(n:number) => {
    // Draw n-cards from the deck
    let useID = deckID;

    if(useID === null){
      await axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
        ).then(res => useID = res.data.deck_id
        ).catch(error => console.error('Error:', error));
    };

    let res = await axios.get(`https://deckofcardsapi.com/api/deck/${useID}/draw/?count=${n}`);
    return {cards: res.data.cards} as PlayingCardSet;
    
  };

  const mergeHands = (hands: PlayingCardSet[]): PlayingCardSet => {
    return hands.reduce((acc: PlayingCardSet, hand: PlayingCardSet) => {
        return { cards: [...acc.cards, ...hand.cards] };
    }, { cards: [] });
  };

  const cardValue = (code: string, ace_high:boolean=true): number => {
    switch(code){
      case "ACE":
        if(ace_high === true){return 14;} else {return 1;}
      case "KING":
        return 13;
      case "QUEEN":
        return 12;
      case "JACK":
        return 11;
      default:
        return Number(code);
    }
  };

  const hasFlush = (cards: (string | number)[][]): (string | number)[][] => {
    let scored = [] as (string | number)[][];
    
    for (let cardSuit of ["CLUBS", "DIAMONDS", "HEARTS", "SPADES"]){
    
      let suitedCards = cards.filter(([suit, _]) => suit === cardSuit);
      if ( suitedCards.length >= 5){
        return suitedCards.slice(-5);
      } 
    } 
    return scored;
  };

  const hasStraight = (cards: (string | number)[][]): (string | number)[][] => {     
    let scored = [] as (string | number)[][];

    for (let i = 1; i < cards.length; i++){
      let cur_set = cards[i];
      let cur_val = Number(cur_set[1]);

      let last_set = cards[i - 1];
      let last_val = Number(last_set[1]);

      if (cur_val === (last_val + 1) && (scored.length === 0 || last_val === scored.at(-1)?.at(1)) ){
        scored.pop();  
        scored.push(last_set);       
        scored.push(cur_set);
      }
    }
    
    if(scored.length >= 5){
      return scored.slice(-5);
    }

    return [] as (string | number)[][];
  };

  const hasQuad = (cards: (string | number)[][]): (string | number)[][] => {
    let scored = [] as (string | number)[][];
    for (let cardVal = 1; cardVal <=14; cardVal++){
      if ( cards.filter(([_, val]) => val === cardVal).length === 4){
        scored.push(...cards.filter(([_, val]) => val === cardVal))
      }
    }
    return scored;
  };

  const hasTriple = (cards: (string | number)[][]): (string | number)[][] => {
    let scored = [] as (string | number)[][];
    for (let cardVal = 1; cardVal <=14; cardVal++){
      if ( cards.filter(([_, val]) => val === cardVal).length === 3){
        scored.push(...cards.filter(([_, val]) => val === cardVal))
      }
    }
    return scored;
  };
  
  const hasPair = (cards: (string | number)[][]): (string | number)[][] => {
    let scored = [] as (string | number)[][];
    for (let cardVal = 1; cardVal <=14; cardVal++){
      if ( cards.filter(([_, val]) => val === cardVal).length === 2){
        scored.push(...cards.filter(([_, val]) => val === cardVal))
      }
    }
    return scored;
  };

  const getHighCard = (hand: (string | number)[][], allCards: (string | number)[][], withinHand:boolean, rank:number=1): number => {
    if(withinHand){
      return hand.map(([_, v]) => v).at(-rank) as number / 100;      
    }
    return allCards.filter(([s,v]) => hand.includes([s,v]) === withinHand).map(([_, v]) => v).at(-rank) as number / 100;
  };

  const evaluateHand = (hand: [string, string][]) => {
    // Still need to do : straights (aces high & low)
    let cards = hand.map(([suit, val]) => [suit, cardValue(val, true)]).sort((a, b) => Number(a[1]) - Number(b[1]));
    let cardsAceLow = hand.map(([suit, val]) => [suit, cardValue(val, false)]).sort((a, b) => Number(a[1]) - Number(b[1]));
    
    // Royal Flush
    if(hasStraight(hasFlush(cards)).length > 0 && hasStraight(hasFlush(cards)).slice(-1).at(1) as unknown === 14){
      let hand = hasStraight(hasFlush(cards));
      let score = 10 + getHighCard(hand, cards, true)
      return ["Royal Flush", score]; 
    }

    // Striaght Flush
    if(hasStraight(hasFlush(cardsAceLow)).length > 0){
      let hand = hasStraight(hasFlush(cardsAceLow));
      let score = 9 + getHighCard(hand, cardsAceLow, true);
      return ["Straight Flush", score]
    }

    // Four of a kind
    if(hasQuad(cards).length > 0){
      let hand = hasQuad(cards);
      let score = 8 + getHighCard(hand, cards, true) + getHighCard(hand, cards, false);
      return ["Four of a Kind", score];
    } 
    
    // Full House
    if(hasTriple(cards).length === 2 || (hasTriple(cards).length > 0 && hasPair(cards).length > 0)){
      let hand =  [...hasTriple(cards), ...hasPair(cards)];
      let score = 7;
      
      for(let i = 0; i < hand.length; i++){
        score = score + getHighCard(hand, cards, true, i)
      };

      return ["Full House", score];
    }

    // Flush
    if(hasFlush(cards).length > 0){
      let hand = hasFlush(cards);
      let score = 6;
      
      for(let i = 0; i < hand.length; i++){
        score = score + getHighCard(hand, cards, true, i)
      };

      return ["Flush", score];
    }

    // Straight (aces high & low)
    if(hasStraight(cards).length > 0){
      let hand =  hasStraight(cards);
      return ["Straight", 5 + getHighCard(hand, cards, true)];
    }

    if(hasStraight(cardsAceLow).length > 0){
      let hand =  hasStraight(cardsAceLow);
      return ["Straight", 5 + getHighCard(hand, cardsAceLow, true)];
    }

    // Three of a kind
    if(hasTriple(cards).length > 0){
      let hand =  hasTriple(cards);
      return ["Three of a Kind", 4 + getHighCard(hand, cards, true) * 3 + getHighCard(hand, cards, false) + getHighCard(hand, cards, false, 2)];
    }

    // Two Pair
    if(hasPair(cards).length >= 4){
      let hand = hasPair(cards)
      let score = 3 + getHighCard(hand, cards, true) * 3 + getHighCard(hand, cards, true, 2) * 3 + getHighCard(hand, cards, false);
      return ["Two Pair", score];
    } 
    
    // Single Pair
    if(hasPair(cards).length >= 2){
      let hand = hasPair(cards)
      let score = 2 + getHighCard(hand, cards, true) * 3;
      
      for(let i = 0; i < Math.min(cards.length, 5); i++){
        score = score + getHighCard(hand, cards, false, i)
      };

      return ["Pair", score];
    } 
    
    // High Card
    else { 
      if(cards.length >= 5){
        cards = cards.slice(-5)
      }

      let score = 1;
      for(let i = 0; i < cards.length; i++){
        score = score + getHighCard(hand, cards, false, i)
      };

      return ["High Card", score];
    }
  };

  const clickNewGame = async() => {
    // Setup New Game
    setActiveGame(true);
    setWinningPlayer("");
    setBetRound(0);

    setTableCards({cards: []} as PlayingCardSet);
    await setupDeck();
  
    // Get Cards
    let newCards = await getACard(4);
    let player = {cards: [newCards.cards[0], newCards.cards[2], ]} as PlayingCardSet;
    let dealer = {cards: [newCards.cards[1], newCards.cards[3], ]} as PlayingCardSet;

    // Update Hands    
    setPlayerCards(player);
    setDealerCards(dealer);

    // Analyse card codes
    let pCodes: [string, string][] = player.cards.map((v, _) => [v["suit"], v["value"]]);
    let dCodes: [string, string][] = dealer.cards.map((v, _) => [v["suit"], v["value"]]);

    // Update hand & score
    let pHand = evaluateHand(pCodes);
    let dHand = evaluateHand(dCodes);

    setPlayerScore(pHand.at(1) as number);
    setDealerScore(dHand.at(1) as number);

    setPlayerHand(pHand.at(0) as string);
    setDealerHand(dHand.at(0) as string);

  };

  const clickCheck = async() => {
    // Determine n-cards required for table    
    let n = 1;
    let round = betRound + 1

    if(round === 1){
      n = 3;
    } 

    // Get cards
    let hand = await getACard(n);
    
    // Rounds
    if (round < 4){
      // Update table
      setTableCards(mergeHands([tableCards, hand]));
     
      // Update codes
      let pCodes: [string, string][] = mergeHands([playerCards, tableCards, hand]).cards.map((v, _) => [v["suit"], v["value"]]);
      let dCodes: [string, string][] = mergeHands([dealerCards, tableCards, hand]).cards.map((v, _) => [v["suit"], v["value"]]);

      // Update hands & score
      let pHand = evaluateHand(pCodes);
      let dHand = evaluateHand(dCodes);

      setPlayerScore(pHand.at(1) as number);
      setDealerScore(dHand.at(1) as number);

      setPlayerHand(pHand.at(0) as string);
      setDealerHand(dHand.at(0) as string);
    }

    // Final round
    if (round === 4) {
      setActiveGame(false);
      let pScore = Number(playerScore.toFixed(2));
      let dScore = Number(dealerScore.toFixed(2))
      
      if( pScore >= dScore){
        setWinningPlayer("Player Wins");
      } else {
        setWinningPlayer("House Wins");
      }
    }

    // Update round
    setBetRound(round);
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
            <h4 className='game-hand-details'>
              Dealer : {dealerHand} <br/>
              Strength Rating : {dealerScore.toFixed(1)}
            </h4>
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
            <h4 className='game-hand-details'>
              Player : {playerHand} <br/>
              Strength Rating : {playerScore.toFixed(1)}
            </h4>
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
