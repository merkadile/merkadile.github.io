class Match {
    constructor(data) {
        this.id = data.id;
        this.team1ID = data.team1ID;
        this.team2ID = data.team2ID;
        this.week = data.week;

        this.games = [];
        for (const gameData of data.games)
            this.games.push(new Game(gameData))
        ;

        this.calculateResults();
    }

    isComplete() {
        return (
            (this.games.length > 0) && !(
                this.week === "Playoffs" && this.winnerID === null
            )
        );
    }

    calculateResults() {
        this.team1GameWins = 0;
        this.team2GameWins = 0;

        this.team1NetScore = 0;
        this.team2NetScore = 0;

        for (const game of this.games) {
            if (game.winner() == 1) this.team1GameWins++;
            else this.team2GameWins++;

            this.team1NetScore += game.team1Score - game.team2Score;
            this.team2NetScore += game.team2Score - game.team1Score;
        }

        if (this.team1GameWins > this.team2GameWins)
            this.winnerID = this.team1ID
        ;
        else if (this.team2GameWins > this.team1GameWins)
            this.winnerID = this.team2ID
        ;
        else
            this.winnerID = null
        ;
    }
}