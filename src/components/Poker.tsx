import React, { useState } from 'react';
import axios from 'axios';

import DisplayHand, { PlayingCardSet } from './Cards';

type PokerHand = "Royal Flush" | "Straight Flush" | "Four of a Kind" | "Full House" | "Flush" | 
                  "Straight" | "Three of a Kind" | "Two Pair" | "Pair" | "High Card";

const TexasHoldEm: React.FC = () => {  
  const [deckID, setDeckID] = useState<string|null>(null);
  const [activeGame, setActiveGame] = useState<boolean>(false);
  const [betRound, setBetRound] = useState<number>(0);

  const [playerCards, setPlayerCards] = useState<PlayingCardSet>({cards: []} as PlayingCardSet);
  const [dealerCards, setDealerCards] = useState<PlayingCardSet>({cards: []} as PlayingCardSet);
  const [tableCards, setTableCards] = useState<PlayingCardSet>({cards: []} as PlayingCardSet);

  const [playerCodes, setPlayerCodes] = useState<[string, string][]>([]);
  const [dealerCodes, setDealerCodes] = useState<[string, string][]>([]);

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
    if(deckID === null) {
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

  const cardValue = (code: string, ace_high:boolean=true): number => {
    if (ace_high === true){
      switch(code){
        case "ACE":
          return 14;
        case "KING":
          return 13;
        case "QUEEN":
          return 12;
        case "JACK":
          return 11;
        default:
          return Number(code);
      }
    } else {
      switch(code){
        case "ACE":
          return 1;
        case "KING":
          return 13;
        case "QUEEN":
          return 12;
        case "JACK":
          return 11;
        default:
          return Number(code);
      }
    }
    
  };

  const hasFlush = (cards: (string | number)[][]): (string | number)[][] => {
    let scored = [] as (string | number)[][];
    for (let cardSuit in ["CLUBS", "DIAMONDS", "HEARTS", "SPADES"]){
      if ( cards.filter(([suit, _]) => suit === cardSuit).length >= 5){
        return scored.filter(([suit, _]) => suit === cardSuit)
      }
    }    
    return scored;
  };

  const hasStraight = (cards: (string | number)[][]): (string | number)[][] => {  
    let scored = [] as (string | number)[][];
    
    for (let i = 1; i < cards.length; i++){
      let cur_val = cards[i];
      let last_val = cards[i - 1];
    
      if (cur_val[1] as number - 1 === last_val[1] && cur_val[1] as number === scored.at(-1)?.at(1) as number + 1){
        if(i === 1){ // add starting value in first iter 
          scored.push(last_val)
        }
        scored.push(cur_val);
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

  const evaluateHand = (hand: [string, string][]) => {
    // New scoring method...
    let cards = hand.map(([suit, val]) => [suit, cardValue(val, true)]).sort((a, b) => Number(a[1]) - Number(b[1]))
    
    // Still need to do : straights (aces high & low) & high card comparisons (all relevant hands)

    // Royal Flush
    if(hasStraight(hasFlush(cards)).length > 0 && hasStraight(hasFlush(cards)).slice(-1).at(1) as unknown === 14){
      // return hasStraight(hasFlush(cards));
      return ["Royal Flush", 10.14];
    }

    // Striaght Flush
    if(hasStraight(hasFlush(cards)).length > 0){
      let hand = hasStraight(hasFlush(cards));
      let highCard = cards.filter(([s,v]) => hand.includes([s,v])).map(([_, v]) => v).at(-1) as number / 100
      return ["Straight Flush", 9 + highCard];
    }

    // Four of a kind
    if(hasQuad(cards).length > 0){
      let hand = hasQuad(cards);
      let highCard = cards.filter(([s,v]) => hand.includes([s,v]) === false).map(([_, v]) => v).at(-1) as number / 100
      return ["Four of a Kind", 8 + highCard];
    } 
    
    // Full House
    if(hasTriple(cards).length > 0 && hasPair(cards).length > 0){
      let hand =  [...hasTriple(cards), ...hasPair(cards)];
      let highCard = cards.filter(([s,v]) => hand.includes([s,v]) === false).map(([_, v]) => v).at(-1) as number / 100
      return ["Full House", 7 + highCard];
    }

    // Flush
    if(hasFlush(cards).length > 0){
      let hand = hasFlush(cards);
      let highCard = cards.filter(([s,v]) => hand.includes([s,v])).map(([_, v]) => v).at(-1) as number / 100
      return ["Flush", 6 + highCard];
    }

    // Straight
    if(hasStraight(cards).length > 0){
      let hand =  hasStraight(cards);
      let highCard = cards.filter(([s,v]) => hand.includes([s,v])).map(([_, v]) => v).at(-1) as number / 100
      return ["Straight", 5 + highCard];
    }

    // Three of a kind
    if(hasTriple(cards).length > 0){
      let hand =  hasTriple(cards);
      let highCard = cards.filter(([s,v]) => hand.includes([s,v]) === false).map(([_, v]) => v).at(-1) as number / 100
      return ["Three of a Kind", 4 + highCard];
    }

    // Two Pair
    if(hasPair(cards).length >= 4){
      let hand = hasPair(cards)
      let highCard = cards.filter(([s,v]) => hand.includes([s,v]) === false).map(([_, v]) => v).at(-1) as number / 100
      return ["Two Pair", 3 + highCard];
    } 
    
    // Single Pair
    if(hasPair(cards).length >= 2){
      let hand = hasPair(cards)
      let highCard = cards.filter(([s,v]) => hand.includes([s,v]) === false).map(([_, v]) => v).at(-1) as number / 100
      return ["Pair", Number((2 + highCard).toFixed(2))];
    } 
    
    // High Card
    else { 
      // if(cards.length > 5){
      //   return cards.slice(-5)
      // } else{
      //   return cards
      // }
      return ["High Card", Number((1 + (cards.map(([_, v]) => v).at(-1) as number / 100 )).toFixed(2))];
    }
  };

  const clickNewGame = async() => {
    // Setup New Game
    setActiveGame(true);
    setWinningPlayer("");
    setBetRound(0);
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

    // Analyse card codes
    let pCodes: [string, string][] = player.cards.map((v, _) => [v["suit"], v["value"]]);
    let dCodes: [string, string][] = dealer.cards.map((v, _) => [v["suit"], v["value"]]);
    setPlayerCodes(pCodes);
    setDealerCodes(dCodes);

    // Update hand & score
    let pHand = evaluateHand(pCodes);
    let dHand = evaluateHand(dCodes);

    setPlayerScore(pHand.at(1) as number);
    setDealerScore(dHand.at(1) as number);

    setPlayerHand(pHand.at(0) as string);
    setDealerHand(dHand.at(0) as string);

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
      setPlayerCodes(pCodes);
      setDealerCodes(dCodes);

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
      
      if( pScore > dScore){
        setWinningPlayer("Player Wins");
      } else if(pScore === dScore) {
        setWinningPlayer("Player Wins");
      } else {
        setWinningPlayer("House Wins");
      }
    } else {
      setBetRound(betRound + 1);
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
