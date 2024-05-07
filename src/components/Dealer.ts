import axios from 'axios';
import { PlayingCard } from './Cards';

export class Dealer {
  deckID: string
  nDecks: number
  
  constructor(game:string, deckID:string, nDecks:number){
    if ( !["blackjack", "poker",].includes(game.toLowerCase()) ){
      throw new Error("Please select a game : 'Blackjack' or 'Poker")
    }
    this.deckID = deckID;
    this.nDecks = nDecks
  }

  async getDeck() {
    // Get Deck 
    let deckCheck = await axios.get(`https://deckofcardsapi.com/api/deck/${this.deckID}/shuffle/`).catch(
      function(){return "Invalid deckID";}
    );

    if(deckCheck === "Invalid deckID") {
      await axios.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${this.nDecks}`
        ).then(res => this.deckID = res.data.deck_id);
    }

    // Shuffle Deck
    await axios.get(`https://deckofcardsapi.com/api/deck/${this.deckID}/shuffle/`
      );
  }

  async dealCards(n:number): Promise<PlayingCard[]> {
    // Draw n-cards from the deck
    let res = await axios.get(`https://deckofcardsapi.com/api/deck/${this.deckID}/draw/?count=${n}`);
    return res.data.cards;
  };

  mergeHands (hands:PlayingCard[][]): PlayingCard[] {
    return hands.reduce((acc: PlayingCard[], hand: PlayingCard[]) => {
        return [...acc, ...hand];
    }, []);
};

}
