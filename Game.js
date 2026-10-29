"use strict";

class Game {
    constructor(data) {
        this.team1Score = data.team1Score;
        this.team2Score = data.team2Score;
    }

    winner() {
        return (this.team1Score > this.team2Score)? 1: 2;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Game;
}