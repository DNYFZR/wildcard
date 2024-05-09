// Poker Base Class Configuration 
import { Dealer } from './Dealer';
import { PlayingCard, PlayingCardSet } from '../Cards';

export function parseHand(hand:PlayingCardSet):string {
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

export type PokerHand = "Royal Flush" | "Straight Flush" | "Four of a Kind" | "Full House" | "Flush" | 
                  "Straight" | "Three of a Kind" | "Two Pair" | "Pair" | "High Card";

const PokerHandValue: Record<PokerHand, number> = {
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

const CardsPerRound: Record<number, number> = {
  1: 3,
  2: 1,
  3: 1,
};

export class Poker {
  gameDealer: Dealer;
  tableCards: PlayingCard[];
  roundNo: number;
  activeGame: boolean;
  
  playerCards: PlayingCard[];
  playerCardCodes!: string[];

  dealerCards: PlayingCard[];
  dealerCardCodes!: string[];

  constructor(deckID:string) {
    this.gameDealer = new Dealer("poker", deckID, 1);
    this.roundNo = 1;
    this.activeGame = false;
    this.tableCards = [];
    this.playerCards = [];
    this.dealerCards = [];
  }

  gameWinner() {
    return "🥳🥳🥳 WINNER 🥳🥳🥳";
  }

  async startGame() {
    // Initiate Game
    this.activeGame = true;
    await this.gameDealer.getDeck();

    // Deal Initial Hands 
    let newCards = await this.gameDealer.dealCards(4);
    this.playerCards = [newCards[0], newCards[2], ] as PlayingCard[];
    this.dealerCards = [newCards[1], newCards[3], ] as PlayingCard[];

    this.playerCardCodes = this.playerCards.map((v, _) => v["code"]);
    this.dealerCardCodes = this.dealerCards.map((v, _) => v["code"]);

  }

  async playRound(){
    // Update Table Based on Round No.
    let newCards =  await this.gameDealer.dealCards(CardsPerRound[this.roundNo]);
    this.tableCards = this.gameDealer.mergeHands([this.tableCards, newCards]);

    // Increment Round
    this.roundNo += 1;

    return this.tableCards;
  }

  evaluatePokerHand(hand: PlayingCard[]) {
    // Update Card Code Arrays
    hand = this.gameDealer.mergeHands([hand, this.tableCards]);

    let cardCodes = ["JS", "2S", "0D", "4S", "5S", "QH", "3S",] as string[];// hand.map((v, _) => v["code"]);
    
    // Index Card Code Arrays  
    let cardMap = this.mapFromArray(cardCodes);
    
    // Generate Card Value Maps
    let valueMap = this.sortMapValues(this.parseMap(cardMap, this.scoreCard));
    
    // Generate Suit Value Maps
    let suitMap = this.parseMap(cardMap, this.scoreSuit);

    // Generate card & suit value tuple map
    const tupMap = new Map<number, number[]>();
    
    cardMap.forEach((value, key, map) => {
        tupMap.set(key, [this.scoreCard(value), this.scoreSuit(value)]);
    });

    // This Is The Way !!!
    const tupMapSorted =  new Map([...tupMap.entries()].sort((a, b) => a[1][0] - b[1][0]));
    
    let tupVals = Array.from(tupMapSorted.values()) as [number, number][];
    const valSequences = tupVals.map((v, i) => i === 0 || (i > 0 && v[0] - tupVals[i - 1][0] === 1));
    const suitSequences = tupVals.map((v, i) => i === 0 || (i > 0 && v[1] === tupVals[i - 1][1])); 

    let tupValsCards: number[] = tupVals.map((v, _) => v[0]);
    
    const highCard = tupVals.filter((tup) => tupValsCards.filter((i) => i === tup[0]).length === 1).sort((a, b) => b[0] - a[0])[0];
    const hasOnePair = tupVals.filter((tup) => tupValsCards.filter((i) => i === tup[0]).length === 2);
    const hasTwoPair = tupVals.filter((tup) =>  tupValsCards.filter((i) => i === tup[0]).length === 2);
    const hasTriplet = tupVals.filter((tup) =>  tupValsCards.filter((i) => i === tup[0]).length === 3);
    const hasQuadlet = tupVals.filter((tup) =>  tupValsCards.filter((i) => i === tup[0]).length === 4);
    
    const hasFullHouse = [...tupVals.filter((tup) =>  tupValsCards.filter((i) => i === tup[0]).length === 3).sort((a, b) => b[0] - a[0]).slice(0, 3), 
                          ...tupVals.filter((tup) => tupValsCards.filter((i) => i === tup[0]).length === 2).sort((a, b) => b[0] - a[0]).slice(0, 2),
    ];

    // Add filter
    let straightBoolMask:boolean[] = tupValsCards.map((v, i) => i === 0 || v - tupValsCards[i-1] === 1);
    straightBoolMask = straightBoolMask.map((v, i) => (i === 0 && v === true) || (v === true && (straightBoolMask[i - 1] === true || straightBoolMask[i + 1] === true)))
    let sequentialCards = tupVals.map((v, i) => [straightBoolMask[i], v]).filter(([bool,val]) => bool).map(([bool, val]) => val);
    const hasStraight = sequentialCards.filter((i) => i)

    const handResult = Object.entries({
      "Four of a Kind": hasQuadlet, 
      "Full House": hasFullHouse, 
      "Straight": hasStraight, 
      "Three of a Kind": hasTriplet, 
      "Two Pair": hasTwoPair, 
      "Pair": hasOnePair, 
      "High Card": highCard,
    }).filter((item) => item[1].length > 0)[0][0]


    return {cardCodes, hasStraight};
  }

  scorePokerHand(hand: PokerHand): number {
    return PokerHandValue[hand];
  }

  scoreSuit = (code: string): number => {
    // Convert a card code to a suit value
    let suitVal = code[1];
    
    switch(suitVal){
      case "S":
        return 4;
      
      case "C":
        return 3;
      
      case "H":
        return 2;

      default:
        return 1;
    };
  }

  scoreCard (code: string, acesHigh:boolean = true): number {
    // Convert a card code to a value
    let cardVal = code[0];
    
    switch(cardVal){
      case "A":
        if (acesHigh === true){
          return 14;
        }

        else {
          return 1;
        }
      
      case "K":
        return 13;
    
      case "Q":
        return 12;
      
      case "J":
        return 11;
      
      case "0":
        return 10;

      default:
        return Number(cardVal);
    }
  }

  mapFromArray(arr: string[]) {
    // Add indexing to an array and generate a copy of the map with the parseFunction applied to it 
    const arrayMap = new Map<number, string>();
    
    arr.forEach((value, index) => {
        arrayMap.set(index, value);
    });
    return arrayMap;
  }

  parseMap(originalMap: Map<number, string>, parseFunction: (card: string) => number) {
    // Add indexing to an array and generate a copy of the map with the parseFunction applied to it 
    const parsedMap = new Map<number, number>();
    
    originalMap.forEach((value, key, map) => {
        parsedMap.set(key, parseFunction(value));
    });

    return parsedMap;
  }

  sortMapValues(map: Map<number,number>) {
    // Sort a map by its values (numeric)
    return new Map([...map.entries()].sort((a, b) => a[1] - b[1]));
  }
}


// // Poker Class Implementation 
// let nDecks = 1;
// let deckID = "";
// let deckCheck = await axios.get(`https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`
//   ).catch(function(){return "Invalid deckID";}
// );

// if(deckCheck === "Invalid deckID") {
//   await axios.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${nDecks}`
//     ).then(res => deckID = res.data.deck_id);
// }


// let pkr = new Poker(deckID);
// await pkr.startGame();
// await pkr.playRound();
// await pkr.playRound();
// await pkr.playRound();