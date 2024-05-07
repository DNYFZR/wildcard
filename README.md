<h2 align="center"> Mini Games </h2>

### BlackJack

- Players can start a game with **6** freshly shuffled decks on the table

- The app will track the score and end the game when the player is bust or chooses to stick (the app doesn't currently offer virtual betting)

- The dealer is set a minimum card total of 18, which is triggered once the player decides to stick.

### Texas Hold Em

- Players can start a game with **1** freshly shuffled deck on the table

- The app will determine the best hand available to the player & dealer given the cards on the table (see note below)
  
- When the final card has been laid, and the player checks, the game will end, and the app will display a winner banner on the winning side of the table (see note below)

**NOTE :** The hand evaluation functionality is still being developed, so there are some gaps. If the cards available to you form a flush, and separately a straight, it will think you have a straight flush, so you'll probably win that round, same goes for the dealer.

<h2 align="center"> Developer Notes </h2>

This minigames app is developed using Typescript & React, and is deployed via [Github Pages](https://dnyfzr.github.io/wildcard/)

The app uses the [Deck of Cards API](https://deckofcardsapi.com/) to initialise, shuffle and draw card for each game.  

Future development (things I've thought about anyway) :

- Ace low straight identification (poker)
- Matched hand card scoring (poker)
  - e.g. AAA88 vs QQQKK -> [14,14,14,8,8] vs [12,12,12,13,13] ->
    14 vs 12 & 8 vs 13 -> first hand has higher triplet etc.
- Hand splitting on pair deals (blackjack)
- Double down hit (blackjack)
- Virtual betting in games
- Multi-game tracking
- Virtual players (poker)

Other Games ?

- [Crazy 8's](https://en.wikipedia.org/wiki/Crazy_Eights)

---
---
