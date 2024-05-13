<h1 align="center"> Wildcard 🃏</h1>

Wildcard is a card games application, built with Typescript / React, and hosted on [GitHub Pages](https://dnyfzr.github.io/wildcard/) :

- Users can choose which game to play, and then compete against a dealer. The game engine will then implement the rules of the selected game.

- There is no betting functionality within the games as it stands, so in the poker game players are currently given the optiion to check in each round.

- The app uses the [Deck of Cards API](https://deckofcardsapi.com/) to initialise, shuffle & draw cards for each game, and to source the images rendered in the app.  

<h2 align="center"> Games </h2>

### BlackJack

- Each game starts with a set of **6** freshly shuffled decks

- The scoring algorithm operates as the game progresses.

  - Aces are automatically managed to give the player / dealer the largest score without exceeding 21 where possible.

  - As yet, players cannot split hands when dealt a pair, this will be looked at in an update for the game though.

  - As betting is not part of the game, there is no "double down" feature.

- A game ends when the player is bust or chooses to stick.

  - If blackjack is drawn by the player / dealer, the game is ended with that hand winning.

- The dealer is set a minimum card total of 18, which is triggered once the player decides to stick.

### Texas Hold Em

- This game starts with **1** freshly shuffled deck on the table

- The scoring algorithm will determine the best hand available for the player & dealer given the cards on the table and in hand.

  - The evaluation functionality is still being developed, and while the majority of hands & games will be scored correctly, there are cases where the application will declare the wrong winner.
  
- A game ends when the player checks after the final card has been laid.

  - the app will display a winner banner on the winning side of the table.

---
---
