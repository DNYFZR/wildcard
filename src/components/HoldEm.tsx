import React, { useState } from 'react';
import axios from 'axios';

type DeckCardResponse = {
  code: string 
  image: string 
  images: {
    svg: string 
    png: string
  } 
  value: string 
  suit: string
};

interface DeckCardHand {
  cards: DeckCardResponse[];
};

type Hand = "Royal Flush" | "Straight Flush" | "Four of a Kind" | "Full House" | "Flush" | 
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

function parseHand(hand:DeckCardHand):string {
  // Get Codes
  let cardCodes = hand.cards.map((v, _) => v["code"]);
  
  // Generate Encodings
  let cardVals = cardCodes.map((v, _) => cardToValue(v));
  let cardSuits = cardCodes.map((v, _) => suitToValue(v));
  
  // Count Values
  let cardValCounts = countValues(cardVals);

  // Bool Filters - need to add comparison of total score of cards for high card situations
  
  
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

function scoreHand(hand: Hand): number {
  const handResult: Record<Hand, number> = {
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
  
  if(card_val === "A"){
    return 14;
  }

  else if(card_val === "K"){
    return 13;
  }

  else if(card_val === "Q"){
    return 12;
  }

  else if(card_val === "J"){
    return 11;
  }

  else if(card_val === "0"){
    return 10;
  }

  else{
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


const HoldEmDealer: React.FC = () => {
  
  const [deckID, setDeckID] = useState<string|null>("hfj5xij3cuxy");
  const [activeGame, setActiveGame] = useState<boolean>(false);
  const [betRound, setBetRound] = useState<number>(0);

  const [playerCards, setPlayerCards] = useState<DeckCardHand>({cards: []} as DeckCardHand);
  const [dealerCards, setDealerCards] = useState<DeckCardHand>({cards: []} as DeckCardHand);
  const [tableCards, setTableCards] = useState<DeckCardHand>({cards: []} as DeckCardHand);

  const [playerHand, setPlayerHand] = useState<string>("");
  const [dealerHand, setDealerHand] = useState<string>("");
  
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [dealerScore, setDealerScore] = useState<number>(0);

  const [winningPlayer, setWinningPlayer] = useState<string>("");

  const DisplayCardHand: React.FC<DeckCardHand> = ({ cards }) => (
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
    return {cards: res.data.cards} as DeckCardHand;
    
  };

  const mergeHands = (hands: DeckCardHand[]): DeckCardHand => {
    return hands.reduce((acc: DeckCardHand, hand: DeckCardHand) => {
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
    setTableCards({cards: []} as DeckCardHand);
    await setupDeck();
  
    // Get Cards
    let newCards = await getACard(4);
    let player = {cards: [newCards.cards[0], newCards.cards[2], ]} as DeckCardHand;
    let dealer = {cards: [newCards.cards[1], newCards.cards[3], ]} as DeckCardHand;

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
      let pScore = scoreHand(parseHand(mergeHands([playerCards, tableCards])) as Hand);
      let dScore = scoreHand(parseHand(mergeHands([dealerCards, tableCards])) as Hand);
      
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
            <h4>Dealers : {dealerHand}</h4>
          </>
        ) : null}

        <div className='game-winner'>
          {winningPlayer === "House Wins"   ? (
            <>
              <h3>{winningPlayer}</h3>
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
              <h3>{winningPlayer}</h3>
            </>) : null}
        </div>
          
        {playerCards && playerCards.cards.length > 0 ? (
          <> 
            <h4>Player : {playerHand}</h4>
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