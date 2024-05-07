// General Card / Deck Configuration
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

export interface PlayingCardSet {
  cards: PlayingCard[];
};

const DisplayHand: React.FC<PlayingCardSet> = ({ cards }) => (
  // Render the card images
  <div className='hand'>
    {cards.map((card, _) => (
      <img src={card.image} alt={card.code} className='hand-card' />
    ))}
  </div>
);

export default DisplayHand;