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
                this.week === "Playoffs" && this.winner === null
            )
        );
    }

    calculateResults() {
        this.team1GameWins = 0;
        this.team2GameWins = 0;

        this.team1TotalScore = 0;
        this.team2TotalScore = 0;

        for (const game of this.games) {
            if (game.winner() == 1) this.team1GameWins++;
            else this.team2GameWins++;

            this.team1TotalScore += game.team1Score;
            this.team2TotalScore += game.team2Score;
        }

        if (this.week === "Playoffs") {
            if (this.team1GameWins > this.team2GameWins)
                this.winner = 1
            ;
            else if (this.team2GameWins > this.team1GameWins)
                this.winner = 2
            ;
            else
                this.winner = null
            ;
        }
        else {
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
}