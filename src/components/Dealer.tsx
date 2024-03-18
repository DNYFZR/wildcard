import React, { useState } from 'react';
import axios from 'axios';

type CardResponse = {
  code: string 
  image: string, 
  images: {
    svg: string 
    png: string
  } 
  value: string 
  suit: string
}

interface DeckCardHand {
  cards: CardResponse[];
};

const DisplayCardHand: React.FC<DeckCardHand> = ({ cards }) => (
  // Render the card images
  <div className='hand'>
    {cards.map((card, _) => (
      <img src={card.image} alt={card.code} className='hand-card' />
    ))}
  </div>
);

const TheCroupier: React.FC = () => {
  
  const [nDecks, setNDecks] = useState<number>(10);
  const [deckID, setDeckID] = useState<string|null>(null);
  const [activeGame, setActiveGame] = useState<boolean>(false);

  const [playerCards, setPlayerCards] = useState<DeckCardHand>({cards: []});
  const [dealerCards, setDealerCards] = useState<DeckCardHand>({cards: []});

  const [playerCardCount, setPlayerCardCount] = useState<number>(0);
  const [dealerCardCount, setDealerCardCount] = useState<number>(0);
  
  const setupDeck = async() => {
    // Get Deck
    const newDeckEndpoint: string = `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${nDecks}`;
  
    if(deckID == null) {
      await axios.get(newDeckEndpoint).then(res => setDeckID(res.data.deck_id)).catch(error => console.error('Error:', error));
    }

    // Shuffle
    const shuffleDeckEndpoint: string = `https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`;
    await axios.get(shuffleDeckEndpoint).then(res => setDeckID(res.data.deck_id)).catch(error => console.error('Error:', error));
    
    // Set game state to active
    setActiveGame(true);
  };

  const getACard = async(n:number) => {
    if(deckID == null){
      await setupDeck();
    }
    
    // Draw n-cards from the deck
    const drawFromDeckEndpoint: string = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${n}`;
    let res = await axios.get(drawFromDeckEndpoint);
    
    return {cards: res.data.cards} as DeckCardHand;
    
  }

  const mergeHands = (hand1: DeckCardHand, hand2: DeckCardHand): DeckCardHand => {
    return { cards: [...hand1.cards, ...hand2.cards] };
  };

  const calculateScore = (hand: DeckCardHand): number => {
    let cardScores: number[] = [];
    let aceCount:number = 0;
    
    // Get Card Tags
    let cardKeys =  hand.cards.map((v, _) => v["code"][0])
    
    // Map Card Scores
    cardKeys.forEach(item => {
      if (item === "A"){
        cardScores.push(11);
        aceCount += 1;
      } 
      
      else if (item == "0" || item === "J" || item === "Q" || item === "K"){
        cardScores.push(10);
      }
      
      else {
        cardScores.push(Number(item));
      }
    });
    
    // Calculate Total
    let score = cardScores.reduce((accumulator, currentValue) => {
      return accumulator + currentValue
    },0);

    // if bust & had aces -> reduce score as close to 21 as possible
    if((score > 21 && aceCount > 0)){
      while (score > 21 && aceCount > 0){
        score -= 10;
        aceCount -= 1;
      };
    }

    // If still bust -> end the game
    if(score > 21){
      setActiveGame(false);
    }
    
    return score;
  };

  const clickNewGame = async() => {
    // Setup New Game
    await setupDeck();
    setPlayerCards({cards: []});
    setDealerCards({cards: []});
    
    // Get Cards
    let newCards = await getACard(4);
    let player = {cards: [newCards.cards[0], newCards.cards[2], ]};
    let dealer = {cards: [newCards.cards[1], newCards.cards[3], ]};

    // Update Hands
    setPlayerCards(player);
    setDealerCards(dealer);

    // Update Scores
    setPlayerCardCount(calculateScore(player));
    setDealerCardCount(calculateScore(dealer));

    // Blackjack Deal Check
    if(calculateScore(player) == 21 || calculateScore(dealer) == 21){
      setActiveGame(false);
    }
  };

  const clickHit = async() => {
    // Get a card
    let hand = await getACard(1);

    // Update player hand & score
    if(playerCards){
      hand = mergeHands(playerCards, hand);
    } 
    
    setPlayerCards(hand);
    setPlayerCardCount(calculateScore(hand));
  };

  const clickStick = async() => {
    // End active game
    setActiveGame(false);

    // Play out dealer hand to >= 17
    const dealerMin:number = 17;
    let score = calculateScore(dealerCards);

    while(score < 17){
      let newHand = await getACard(1);

      if(dealerCards){
        newHand = mergeHands(dealerCards, newHand);
      }
      
      score = calculateScore(newHand);
      
      setDealerCards(newHand);
      setDealerCardCount(score);
    }
  };


  return (
    <div className='game-table'>
      <div className='game-controls'>
        <button onClick={clickNewGame}>New Game</button>
      </div>
      <div className='game-controls'>
        {activeGame ? (
          <button onClick={clickHit}>Hit Me</button>
        ) : null}

        {activeGame ? (
          <button onClick={clickStick}>Stick</button>
        ) : null}
      </div>

      <div className='game-cards'>
        {dealerCards && dealerCards.cards.length > 0 ? (
          <>
            <DisplayCardHand cards={dealerCards.cards} />
            <h4>Dealer : {JSON.stringify(dealerCardCount)}</h4>
          </>
        ) : null}
        
        {playerCards && playerCards.cards.length > 0 ? (
          <> 
            <DisplayCardHand cards={playerCards.cards} />
            <h4>Player : {JSON.stringify(playerCardCount)}</h4>
          </>
        ) : null}
      </div>  
    </div>
  );
};

export default TheCroupier;