import axios from 'axios';

export type PlayingCard = {
  code: string 
  image: string 
  images: {
    svg: string 
    png: string
  } 
  value: string 
  suit: string
};

// NOTE : pokerDeckID & blackjackDeckID are not secrets, 
//        this is a public API anyone can use with no auth requirement & 
//        these are just deck IDs it autogenerates that we are holding here to speed up access to decks

const pokerDeckID = "hfj5xij3cuxy";
const blackjackDeckID = "zogkuxg8362d"; 

export class Dealer {
  deckID: string 
  nDecks: number
  
  constructor(game:string){
    if(game.toLowerCase() === "poker"){
      this.deckID = pokerDeckID;
      this.nDecks = 1
    } 
    
    else if (game.toLowerCase() === "blackjack"){
      this.deckID = blackjackDeckID;
      this.nDecks =  6
    }

    else{
      throw new Error("Please select a game : 'Blackjack' or 'Poker")
    }

  }

  async getDeck(): Promise<string> {
    // Get Deck 
    if(this.deckID == null) {
      await axios.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${this.nDecks}`
        ).then(res => this.deckID = res.data.deck_id);
    }

    // Shuffle Deck
    await axios.get(`https://deckofcardsapi.com/api/deck/${this.deckID}/shuffle/`
      ).then(res => this.deckID = res.data.deck_id);
    
    return this.deckID;
  }

  async dealCards(n:number): Promise<PlayingCard[]> {
    if(this.deckID == null){
      this.getDeck();
    } 
    
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

// let dealer = new Dealer("blackjack");

// dealer.getDeck();
// dealer.mergeHands([await dealer.dealCards(4), await dealer.dealCards(4)]);
