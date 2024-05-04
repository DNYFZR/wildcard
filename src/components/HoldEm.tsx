import React, { useState } from 'react';
import axios from 'axios';

import { Poker } from './Poker';

// function testSomething() {
//   let game = new Poker();
//   let p:string[] = [];
//   game.startGame().then(res => p = res.map((v,_) => v['code']));

//   return p; // game.evaluatePokerHand(game.playerCards) as Map<number, number>;
  
// }


type PlayingCard = {
  code: string 
  image: string 
  images: {
    svg: string 
    png: string
  } 
  value: string 
  suit: string
};

interface PlayingCardSet {
  cards: PlayingCard[];
};

type PokerHand = "Royal Flush" | "Straight Flush" | "Four of a Kind" | "Full House" | "Flush" | 
            "Straight" | "Three of a Kind" | "Two Pair" | "Pair" | "High Card";


const countValues = (arr:string[] | number[]) => {
  let countObj: Record<string, number> = {};

  arr.forEach(item => {
    if(countObj[item]){
      countObj[item] += 1;
    } 

    else {
      countObj[item] = 1;
    }
  });

  return countObj;
};

function IsSequential(arr: number[], n: number = 5): boolean {
  let count = 1;
  
  for (let i = 1; i < arr.length; i++) {
      if (arr[i] - arr[i - 1] === 1) {
          count++;
          if (count === n) {
              return true;
          }
      } else {
          count = 1;
      }
  }
  return false;
};

function parseHand(hand:PlayingCardSet):string {
  // Generate card code map
  let cardMap = hand.cards.reduce((obj: Record<number, string>, v, i) => {
    obj[i] = v["code"];
    return obj;
  }, {});

  // Generate encodings
  let cardValues = hand.cards.reduce((obj: Record<number, number>, v, i) => {
    obj[i] = cardToValue(v["code"]);
    return obj;
  }, {}); 

  let cardSuited = hand.cards.reduce((obj: Record<number, number>, v, i) => {
    obj[i] = suitToValue(v["code"]);
    return obj;
  }, {}); 
  
  // Get Codes
  let cardCodes = hand.cards.map((v, _) => v["code"]);
  
  // Generate Encodings
  let cardVals = cardCodes.map((v, _) => cardToValue(v));
  let cardSuits = cardCodes.map((v, _) => suitToValue(v));
  
  // Count Values
  let cardValCounts = countValues(cardVals);

  // Bool Filters   
  const isFlush = Object.values(countValues(cardSuits)).some((item) => item >= 5);
  const isStraight = IsSequential(cardVals.sort((a, b) => a - b));

  const isRoyalFlush = isFlush && isStraight && Object.values(cardValCounts).some((item) => item === 14) && 
                        Object.values(cardValCounts).some((item) => item === 10);
  const isStraightFlush = isFlush && isStraight;

  const isFullHouse = Object.values(cardValCounts).some((item) => item === 3) && 
                      Object.values(cardValCounts).some((item) => item === 2);
  const isFourKind = Object.values(cardValCounts).some((item) => item === 4);
  const isThreeKind = Object.values(cardValCounts).some((item) => item === 3);
  const isTwoPair = !isFourKind && !isFullHouse && Object.values(cardValCounts).filter((item) => item === 2).length >= 2;
  const isPair = Object.values(cardValCounts).filter((item) => item === 2).length === 1;
  const isHighCard = Object.values(cardValCounts).filter((item) => item === 1).length === cardVals.length;
  
  // Handle high cards / matched hands


  // collect results
  const handResult = {
    "Royal Flush": isRoyalFlush,
    "Straight Flush": isStraightFlush,
    "Four of a Kind": isFourKind, 
    "Full House": isFullHouse,
    "Flush": isFlush, 
    "Straight": isStraight,
    "Three of a Kind": isThreeKind,
    "Two Pair" : isTwoPair,
    "Pair": isPair,
    "High Card" : isHighCard,
  };
  return Object.entries(handResult).filter((item) => item[1] === true)[0][0];
};

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

const cardToValue = (code: string): number => {
  let card_val = code[0];
  
  switch(card_val){
    case "A":
      return 14;
    case "K":
      return 13;
    case "Q":
      return 12;
    case "J":
      return 11;
    case "0":
      return 10;
    default:
      return Number(card_val);
  }
};

const suitToValue = (code: string): number => {
  let suitVal = code[1];
  
  if(suitVal === "S"){
    return 4;
  }

  else if(suitVal === "C"){
    return 3;
  }

  else if(suitVal === "H"){
    return 2;
  }

  else {
    return 1;
  }
};

// New
function processArray(arr: string[], cardToValue: (card: string) => number) {
  const originalMap = new Map<number, string>();
  const parsedMap = new Map<number, number>();
  
  arr.forEach((value, index) => {
      originalMap.set(index, value);
      parsedMap.set(index, cardToValue(value));
  });

  const sortedMap = new Map([...parsedMap.entries()].sort((a, b) => a[1] - b[1]));
  return { originalMap, parsedMap };
};

function sortMapValues(map: Map<number,number>) {
  return new Map([...map.entries()].sort((a, b) => a[1] as number - b[1] as number));
};

let pkr = new Poker();
await pkr.startGame();
await pkr.playRound();
await pkr.playRound();
await pkr.playRound();

const HoldEmDealer: React.FC = () => {  
  const [deckID, setDeckID] = useState<string|null>("hfj5xij3cuxy");
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
  const { originalMap, parsedMap } = processArray(playerCards.cards.map((v, _) => v["code"]), cardToValue);

  const celebration = "🥳🥳🥳 WINNER 🥳🥳🥳";

  const DisplayCardHand: React.FC<PlayingCardSet> = ({ cards }) => (
    // Render the card images
    <div className='hand'>
      {cards.map((card, _) => (
        <img src={card.image} alt={card.code} className='hand-card' />
      ))}
    </div>
  );

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
      </div>

      <div>
        {dealerCards && dealerCards.cards.length > 0 ? (
          <>
            <DisplayCardHand cards={dealerCards.cards} />
            <h4>House : {dealerHand}</h4>
          </>
        ) : null}

        <div className='game-winner'>
          {winningPlayer === "House Wins"   ? (
            <>
              <h4>{celebration}</h4>
            </>) : null}
        </div>

        {tableCards && tableCards.cards.length > 0 ? (
          <>
            <DisplayCardHand cards={tableCards.cards} />
          </>
        ) : null}

        <div className='game-winner'>
          {winningPlayer === "Player Wins"   ? (
            <>
              <h4>{celebration}</h4>
            </>) : null}
        </div>
          
        {playerCards && playerCards.cards.length > 0 ? (
          <> 
            <h4>
              Player : {playerHand}
              
            </h4>
            <DisplayCardHand cards={playerCards.cards} />
            
          </>
        ) : null}

        <div>
          {activeGame ? (
            <button className = 'App-button' onClick={clickCheck}>Check</button>
          ) : null}
        </div>
        
      </div>

    </div>
  );
};

export default HoldEmDealer;
