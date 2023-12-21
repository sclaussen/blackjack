// Possible RESULTS
enum Result {
    PlayerWon,
    PlayerWonBlackjack
    DealerWon,
    Push,
}

const BET = 5;

// Globals
var dealer;
var dealerHand;
var player;
var currentPlayerHand;
var deck;


window.onload = function() {
    startPlaying();
}


// Ideas:
// - dynamically create buttons so they remain centered
// - add key bindings for hit, stand, ...
// - better winner coloring
// - push coloring
// - pause while dealing dealer cards
// - multiple hands
// - auto shuffle towards end of deck
// - add basic strategy hints
function startPlaying() {
    deck = new Deck();

    document.getElementById('split').addEventListener('click', split);
    document.getElementById('double-down').addEventListener('click', doubleDown);
    document.getElementById('hit').addEventListener('click', hit);
    document.getElementById('stand').addEventListener('click', stand);
    document.getElementById('new-round').addEventListener('click', newRound);

    dealer = new Player('Dealer');
    player = new Player('Player', 500);

    newRound();
}


function newRound() {

    // Remove the UX "New Hand" button
    document.getElementById('new-round').style.visibility = 'hidden';

    deck.shuffle();
    dealerHand = dealer.newRoundHand();
    playerHand = player.newRoundHand(BET);

    playerHand.addCard(deck.deal());
    dealerHand.addCard(deck.deal());
    playerHand.addCard(deck.deal());
    dealerHand.addCard(deck.deal());

    if (dealerHand.isBlackJack() && playerHand.isBlackJack()) {
        dealerHand.flipHoleCard();
        handComplete(Result.Push);
        return;
    }

    if (dealerHand.isBlackJack()) {
        dealerHand.flipHoleCard();
        handComplete(Result.DealerWon, 'Dealer Blackjack');
        return;
    }

    if (playerHand.isBlackJack()) {
        dealerHand.flipHoleCard();
        handComplete(Result.PlayerWonBlackjack, 'Blackjack');
        return;
    }
}


function doubleDown() {
    currentPlayerHand.doubleDownBet();
    playerAddCard();
    playDealersHand();
}


function split() {
    player.newHand(currentPlayerHand);

    let currentPlayerCards = document.getElementById('player-hand-' + playerHand.name + '-cards');
    let lastCard = currentPlayerCards.lastChild;
    currentPlayerCards.removeChild(lastCard);
}


// function playerAddCard() {
//     let card = deck.deal();
//     playerHand.add(card);

//     if (playerHand.sum > 21) {
//         handComplete(Result.DealerWon, 'Bust');
//     }
// }


// function dealerAddCard(hidden = false) {
//     let card = deck.deal();
//     dealerHand.add(card, hidden);

//     // View update
//     let htmlCardImage = document.createElement('img');
//     if (hidden) {
//         htmlCardImage.src = FACE_DOWN;
//     } else {
//         htmlCardImage.src = card.image;
//     }

//     document.getElementById('dealer-hand-cards').append(htmlCardImage);
// }


function stand() {

}


function playDealersHand() {
    document.getElementById('dealer-hand-cards').childNodes[0].src = dealerHand.cards[0].image;
    while (dealerHand.sum < 17 || (dealerHand.sum == 17 && dealerHand.aces > 0)) {
        // sleep(1000).then(() => { console.log("Next card"); });
        dealerAddCard();
        document.getElementById('dealer-hand-sum').innerHTML = getSumString(dealerHand);
    }

    if (dealerHand.sum > 21) {
        handComplete(Result.PlayerWon, 'dealer bust');
        return;
    }

    if (dealerHand.sum == playerHand.sum) {
        handComplete(Result.Push);
        return;
    }

    if (dealerHand.sum > playerHand.sum) {
        handComplete(Result.DealerWon, 'x > y');
    } else {
        handComplete(Result.PlayerWon, 'x > y');
    }
}


function handComplete(result, s) {

    // Payout
    let winnings = '';
    if (result == Result.Push) {
        player.stash += playerHand.bet;
    } else if (result == Result.PlayerWon) {
        let bet = playerHand.bet;
        winnings = playerHand.bet;
        player.stash += (bet + winnings);
    } else if (result == Result.PlayerWonBlackjack) {
        let bet = playerHand.bet;
        winnings = playerHand.bet * 1.5;
        player.stash += (bet + winnings);
    }
    document.getElementById('player-stash').innerHTML = player.stash;
    document.getElementById('player-hand-' + playerHand.name + '-bet').innerHTML = '';


    // Visually indicate whether the hand was a push, loser, or winner
    if (result == Result.Push) {
        document.getElementById('player-hand-0').classList.add('push');
    } else if (result == Result.DealerWon) {
        document.getElementById('player-hand-0').classList.add('loser');
    } else {
        document.getElementById('player-hand-0').classList.add('winner');
    }


    // Provie a results summary
    let summary = '';
    if (result == Result.Push) {
        summary = 'Push!';
        console.log(summary);
    } else if (result == Result.DealerWon) {
        summary = 'Dealer won! (' + s + ') (lost ' + playerHand.bet + ')';
        console.log(summary)
    } else {
        summary = 'Player won! (' + s + ') (winnings: ' + winnings + ')';
        console.log(summary);
    }
    document.getElementById('player-hand-' + playerHand.name + '-results').innerHTML = summary;


    // Hide all player action buttons
    document.getElementById('hit').style.visibility = 'hidden';
    document.getElementById('stand').style.visibility = 'hidden';
    document.getElementById('double-down').style.visibility = 'hidden';
    document.getElementById('split').style.visibility = 'hidden';


    // TODO: Change to new round
    // Expose new round button
    document.getElementById('new-round').style.visibility = 'visible';
}


// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }


class DealerView {
}


class PlayerView {
    newRoundHandView() {
        let playerDivElement = document.getElementById(this.nameLower);
        playerDivElement.innerHTML = '<h2>' + this.name + '</h2>';

        if (this.nameLower !== 'dealer') {
            let playerStashDivElement = document.createElement('div');
            playerStashDivElement.id = 'player-stash';
            playerDivElement.append(playerStashDiv);
        }
    }
}


class HandView {
    constructorView() {
        console.log(this.player.name);
        this.baseElementId = this.player.name.toLowerCase() + '-hand-' + this.name + '-';
    }


    newHandView(hand) {

        let playerDivElement = document.getElementById(this.name.toLowerCase());

        this.baseElementId = this.name.toLowerCase() + '-hand-' + (this.hands.length - 1);
        let playerHandDivElement = document.createElement('div');
        playerHandDivElement.classList.add('hand');
        playerHandDivElement.id = this.baseElementId;

        let sumAndBetH3Element = document.createElement('h3');

        let sumSpanElement = document.createElement('span');
        sumSpanElement.id = this.baseElementId + '-sum';
        sumAndBetH3Element.append(sumSpanElement);

        let betSpanElement = document.createElement('span');
        betSpanElement.id = this.baseElementId + '-bet';
        sumAndBetH3Element.append(betSpanElement);

        // sum.insertAdjacentHTML('beforebegin', 'Hand (');
        // bet.insertAdjacentHTML('beforeend', ')');
        playerHandDivElement.append(sumAndBetH3Element);

        let resultsParaElement = document.createElement('p');
        resultsParaElement.id = this.baseElementId + '-results';
        playerHandDivElement.append(resultsParaElement);

        let cardsDivElement = document.createElement('div');
        cardsDivElement.id = this.baseElementId + '-cards';
        playerHandDivElement.append(cardsDivElement);

        let brElement = document.createElement('br');
        playerHandDivElement.append(brElement);

        playerDivElement.append(playerHandDivElement);

        // let cardImage = document.createElement('img');
        // cardImage.src = hand.cards[0].image;
        // document.getElementById('player-hand-' + hand.name + '-cards').append(cardImage);
        // document.getElementById('player-hand-' + hand.name + '-sum').innerHTML = getSumString(hand);

        if (this.name == 'Player') {
            document.getElementById(this.baseElementId + '-bet').innerHTML = ', $' + hand.bet;
            document.getElementById('player-stash').innerHTML = player.stash;
        }
    }


    addCardView(card) {
        let cardImage = document.createElement('img');
        if (this.cards.length == 1 && this.player.name == 'Dealer') {
            cardImage.src = './cards/BACK.png';
        } else {
            cardImage.src = card.image;
        }
        document.getElementById(this.baseElementId + 'cards').append(cardImage);
        document.getElementById(this.baseElementId + 'sum').innerHTML = this.getSumString(this);

        if (this.sum > 21) {
            dealerHand.flipDownCard();
        }

        document.getElementById('split').style.visibility = 'visible';
        document.getElementById('double-down').style.visibility = 'visible';
        document.getElementById('hit').style.visibility = 'visible';
        document.getElementById('stand').style.visibility = 'visible';

        if (!playerHand.canSplit()) {
            document.getElementById('split').style.visibility = 'hidden';
        }

        if (!playerHand.canDoubleDown()) {
            document.getElementById('double-down').style.visibility = 'hidden';
        }
    }

    flipHoleCardView() {
        document.getElementById(baseElementId + 'cards').childNodes[0].src = dealerHand.cards[0].image;
        document.getElementById(baseElementId + 'sum').innerHTML = this.getSumString(dealerHand);
    }


    getSumString(hand) {
        if (this.cards.length == 2 && hand.sum == 21) {
            return 'Blackjack';
        }

        let sum = hand.sum;
        if (this.holeCard && this.cards.length == 2) {
            sum = hand.cards[1].value + 10;
        }

        if (hand.aces > 0) {
            return 'soft ' + sum;
        }

        return sum;
    }
}


class PlayerDealer {

    // name: Player or Dealer
    // nameLower: player or dealer
    // hands: array of 1 for dealer, N for players to support splits
    // stash: unique to a player
    constructor(name, stash) {
        this.name = name;
        this.nameLower = this.name.toLowerCase();
        this.hands = [];
        this.stash = stash;
    }


    // Bets are associated with hands to allow each to have a unique
    // bet amount to support double down, independent win/losses, etc.
    // Placing a bet starts the first hand, other hands are started as
    // a function of splitting a hand.
    placeBet(bet) {
        return newHand(bet);
    }


    newHand() {
        let hand = new Hand(this, this.hands.length, this.bet);
        this.hands.push(hand);
        return hand;
    }


    splitHand(currentPlayerHand) {
        let card = currentPlayerHand.removeSplitCard();
        let hand = this.newHand(this, this.hands.length, this.bet);
        hand.addCardView(card);
        if (card.rank == 'Ace') {
            hand.aceSplit = true;
        }
        return hand;
    }
}


class Hand {
    // player: reference back to the player to manipulate stash, get name, etc
    // name: each hand has a numeric name 0..N (it's player.hand array position)
    // bet: amount of bet
    // cards: array of cards in the hand
    // aces: the number of soft aces: eg hand with Jack, 9, Ace, Ace has aces=0
    // sum: sum of the hand, if soft, ace counts as 11
    // isDoubleDown: true if the hand was doubled
    // holeCard: dealer only, set to true once first card is dealt, false when hole card flipped
    // aceSplit: true if aces were split (which limits follow on hits to a single card)
    constructor(player, name, bet) {
        this.player = player
        this.name = name;
        this.bet = bet;
        this.cards = [];
        this.aces = 0;
        this.sum = 0;
        this.isDoubleDown = false;
        this.holeCard = false;
        this.aceSplit = false;

        player.stash -= bet;
    }


    addCard(card) {
        this.cards.push(card);
        this.sum += card.value;

        if (card.rank == 'Ace') {
            this.aces++;
        }

        if (this.isBust() && this.isSoft()) {
            this.sum -= 10;
            this.aces -= 1;
        }

        if (this.player.name == 'Dealer' && this.cards.length == 1) {
            this.holeCard = true;
        }
    }


    doubleDownBet() {
        player.stash -= bet;
        this.bet *= 2;
        this.isDoubleDown = true;
    }


    removeSplitCard() {
        let card = this.cards.pop();
        this.sum -= card.value;
        if (card.rank == 'Ace') {
            this.aces = 1;
        }
        return card;
    }


    flipHoleCard() {
        this.holeCard = false;
    }


    canDoubleDown() {
        return this.cards.length == 2;
    }


    canSplit() {
        return this.cards.length == 2 && (this.cards[0].rank === this.cards[1].rank);
    }


    isPair(n) {
        if (this.cards.length !== 2 || (this.cards[0].rank != this.cards[1].rank)) {
            return false;
        }

        if (n == 11 && this.sum == 12) {
            return true;
        }

        return (n * 2) == this.sum;
    }


    isSoft() {
        return this.aces > 0;
    }


    isBlackJack() {
        return this.cards.length == 2 && this.sum == 21;
    }


    isBust() {
        return this.sum > 21;
    }


}


// Cards
enum RANKS = [ 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King' ];
const SUITS = [ 'Clubs', 'Diamonds', 'Hearts', 'Spades' ];


class Deck {


    constructor(numberOfDecks = 1) {
        this.numberOfDecks = numberOfDecks;
        this.addCardsInRankSuitOrder();
    }


    addCardsInRankSuitOrder() {
        this.cards = []
        for (let rank of RANKS) {
            for (let suit of SUITS) {
                for (let i = 0; i < this.numberOfDecks; i++) {
                    this.cards.push(new Card(rank, suit));
                }
            }
        }
    }


    shuffle() {
        this.addCardsInRankSuitOrder();

        const { cards } = this;
        let m = cards.length;
        let i;

        while (m) {
            i = this.getRandomInt(m--);
            [ cards[m], cards[i] ] = [ cards[i], cards[m] ];
        }

        // This puts the cut card 70% to 80% of the way through the deck
        this.cutCard = Math.floor(cards.length * 0.7) + this.getRandomInt(cards.length * 0.1);

        return this;
    }


    deal() {
        return this.cards.pop();
    }


    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}


class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
        if (rank == 'Ace') {
            this.value = 11;
        } else if (rank == 'Jack' || rank == 'Queen' || rank == 'King') {
            this.value = 10;
        } else {
            this.value = parseInt(rank);
        }
        if (rank == '10') {
            this.nickname = '10-' + suit[0];
        } else {
            this.nickname = rank[0] + '-' + suit[0];
        }
        this.image = './cards/' + this.nickname + '.png';
    }
}


// Rules
// {
//     hitSoft17:true,             // Does dealer hit soft 17
//     surrender:"late",           // Surrender offered - none, late, or early
//     double:"any",               // Double rules - none, 10or11, 9or10or11, any
//     doubleRange:[0,21],         // Range of values you can double,
//                                 // if set supercedes double (v1.1 or higher)
//     doubleAfterSplit:true,      // Can double after split
//     resplitAces:false,          // Can you resplit aces
//     offerInsurance:true,        // Is insurance offered
//     numberOfDecks:6,            // Number of decks in play
//     maxSplitHands:4,            // Max number of hands you can have due to splits
//     count: {                    // Structure defining the count (v1.3 or higher)
//         system: null,           // The count system - only "HiLo" is supported
//         trueCount: null };      // The TrueCount (count / number of decks left)
//     strategyComplexity:"simple" // easy (v1.2 or higher), simple, advanced,
//                                 // exactComposition, bjc-supereasy (v1.4 or higher),
//                                 // bjc-simple (v1.4 or higher), or bjc-great
//                                 // (v1.4 or higer) - see below for details
// }


enum Action {
    Hit,
    Stand,
    Double,
    Split
}

function getBasicStrategyActionRecommendation(hand, dealer) {

    //=========================================================================
    // Splittable hand
    //
    //          2  3  4  5  6  7  8  9 10  A
    //  A,  A  SP SP SP SP SP SP SP SP SP SP
    // 10, 10   S  S  S  S  S  S  S  S  S  S
    //  9,  9  SP SP SP SP SP  S SP SP SP SP
    //  8,  8  SP SP SP SP SP SP SP SP SP SP
    //  7,  7  SP SP SP SP SP  H  H  H  H  H
    //  6,  6  SP SP SP SP  H  H  H  H  H  H
    //  5,  5   D  D  D  D  D  D  D  D  H  H
    //  4,  4   H  H  H SP SP  H  H  H  H  H
    //  3,  3  SP SP SP SP SP SP  H  H  H  H
    //  2,  2  SP SP SP SP SP SP  H  H  H  H
    if (hand.canSplit()) {

        // 2, 2
        if (hand.isPair(2)) {
            if (dealer.sum <= 17) {
                return Action.Split;
            }
            return Action.Hit;
        }

        // 3, 3
        if (hand.isPair(3)) {
            if (dealer.sum <= 17) {
                return Action.Split;
            }
            return Action.Hit;
        }

        // 4, 4
        if (hand.isPair(4)) {
            if (dealer.sum == 15 || dealer.sum == 16) {
                return Action.Split;
            }
            return Action.Hit;
        }

        // 5, 5
        if (hand.isPair(5)) {
            if (dealer.sum <= 19) {
                return Action.Double;
            }
            return Action.Hit;
        }

        // 6, 6
        if (hand.isPair(6)) {
            if (dealer.sum <= 16) {
                return Action.Split;
            }
            return Action.Hit;
        }

        // 7, 7
        if (hand.isPair(7)) {
            if (dealer.sum <= 17) {
                return Action.Split;
            }
            return Action.Hit;
        }

        // 8, 8
        if (hand.isPair(8)) {
            return Action.Split;
        }

        // 9, 9
        if (hand.isPair(9)) {
            if (dealer.sum == 17 || dealer.sum == 20 || dealer.sum == 21) {
                return Action.Stand;
            }
            return Action.Split;
        }

        // 10/10, J/J, Q/Q, K/K
        if (hand.isPair(10)) {
            return Action.Stand;
        }

        // A, A
        if (hand.isPair(11)) {
            return Action.Split;
        }
    }



    //=========================================================================
    // Soft hand
    //
    //          2  3  4  5  6  7  8  9 10  A
    //  A,  8+  S  S  S  S  S  S  S  S  S  S
    //  A,  7   S  D  D  D  D  S  S  H  H  H
    //  A,  6   S  D  D  D  D  H  H  H  H  H
    //  A,  5   H  H  D  D  D  H  H  H  H  H
    //  A,  4   H  H  D  D  D  H  H  H  H  H
    //  A,  3   H  H  H  D  D  H  H  H  H  H
    //  A,  2   H  H  H  D  D  H  H  H  H  H
    if (hand.isSoft()) {

        if (hand.sum == 13 || hand.sum == 14) {
            if (hand.canDoubleDown() && (dealer.sum >= 5 && dealer.sum <= 6)) {
                return Action.Double;
            }
            return Action.Hit;
        }

        if (hand.sum == 15 || hand.sum == 16) {
            if (hand.canDoubleDown() && (dealer.sum >= 4 && dealer.sum <= 6)) {
                return Action.Double;
            }
            return Action.Hit;
        }

        if (hand.sum == 17) {
            if (hand.canDoubleDown() && (dealer.sum >= 3 && dealer.sum <= 6)) {
                return Action.Double;
            }

            if (dealer.sum == 12) {
                return Action.Stand;
            }

            return Action.Hit;
        }

        if (hand.sum == 18) {
            if (hand.canDoubleDown() && (dealer.sum >= 3 && dealer.sum <= 6)) {
                return Action.Double;
            }

            if (dealer.sum == 12 || dealer.sum == 17 || dealer.sum == 18) {
                return Action.Stand;
            }

            return Action.Hit;
        }

        return Action.Stand;
    }



    //=========================================================================
    // Hard hand
    //
    //        2  3  4  5  6  7  8  9 10  A
    //   17+  S  S  S  S  S  S  S  S  S  S
    //   16   S  S  S  S  S  H  H  H  H  H
    //   15   S  S  S  S  S  H  H  H  H  H
    //   14   S  S  S  S  S  H  H  H  H  H
    //   13   S  S  S  S  S  H  H  H  H  H
    //   12   H  H  S  S  S  H  H  H  H  H
    //   11   D  D  D  D  D  D  D  D  D  H
    //   10   D  D  D  D  D  D  D  D  H  H
    //    9   H  D  D  D  D  H  H  H  H  H
    //  5-8   H  H  H  D  D  H  H  H  H  H
    switch (hand.sum) {
    case 5:
    case 6:
    case 7:
    case 8:
        return Action.Hit;

    case 9:
        // Hard Double: 9 vs <= 6
        if (hand.canDoubleDown() && (dealer.sum >= 13 && dealer.sum <= 16)) {
            return Action.Double;
        }
        return Action.Hit;

    case 10:
        // Hard Double: 10 vs <= 9
        if (hand.canDoubleDown() && dealer.sum <= 19) {
            return Action.Double;
        }
        return Action.Hit;

    case 11:
        // Hard Double: Ace vs <= 10
        if (hand.canDoubleDown() && dealer.sum <= 20) {
            return Action.Double;
        }
        return Action.Hit;

    case 12:
        if (dealer.sum >= 4 && dealer.sum <= 6) {
            return Action.Stand;
        }
        return Action.Hit;

    case 13:
    case 14:
    case 15:
    case 16:
        if (dealer.sum <= 6) {
            return Action.Stand;
        }
        return Action.Hit;
    }

    return Action.Stand;
}
