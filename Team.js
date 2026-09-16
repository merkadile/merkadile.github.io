class Team {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.acronym = data.acronym;
        this.color = data.color;
        this.players = data.players;
    }

    calculateStatistics(league) {
        this.schedule = [];

        this.wins = 0;
        this.losses = 0;
        this.ties = 0;

        this.gamesWon = 0;
        this.gamesLost = 0;

        this.scoreFor = 0;
        this.scoreAgainst = 0;

        for (const match of league.matches) {
            if (match.week !== "Playoffs" && (
                match.team1ID === this.id || match.team2ID === this.id
            )) {
                this.schedule.push(match);

                if (match.isComplete()) {
                    if (match.winnerID == this.id) this.wins++;
                    else if (match.winnerID == null) this.ties++;
                    else this.losses++;

                    if (match.team1ID == this.id) {
                        this.gamesWon += match.team1GameWins;
                        this.gamesLost += match.team2GameWins;
                        this.scoreFor += match.team1TotalScore;
                        this.scoreAgainst += match.team2TotalScore;
                    }
                    else {
                        this.gamesWon += match.team2GameWins;
                        this.gamesLost += match.team1GameWins;
                        this.scoreFor += match.team2TotalScore;
                        this.scoreAgainst += match.team1TotalScore;
                    }
                }
            }
        }

        this.rankingPoints = this.wins * 2 + this.ties;

        this.matchesPlayed = this.wins + this.losses + this.ties;
        this.wtlPerc = (this.matchesPlayed === 0)? 0: (
            this.rankingPoints / (2 * this.matchesPlayed)
        );

        this.gamesPlayed = this.gamesWon + this.gamesLost;
        this.gameWinPerc = (this.gamesPlayed === 0)? 0: (
            this.gamesWon / this.gamesPlayed
        );

        this.netGames = this.gamesWon - this.gamesLost;
        this.netScore = this.scoreFor - this.scoreAgainst;

        this.avgGamesWonPerMatch = (this.matchesPlayed === 0)? 0: (
            this.gamesWon / this.matchesPlayed
        );
        this.avgGamesLostPerMatch = (this.matchesPlayed === 0)? 0: (
            this.gamesLost / this.matchesPlayed
        );

        this.avgScoreForPerGame = (this.gamesPlayed === 0)? 0: (
            this.scoreFor / this.gamesPlayed
        );
        this.avgScoreAgainstPerGame = (this.gamesPlayed === 0)? 0: (
            this.scoreAgainst / this.gamesPlayed
        );

        this.rank = 1;
        this.rankTie = false;
    }

    updateRank(rank) {
        this.rank = rank;
    }

    updateRankTie(rankTie) {
        this.rankTie = rankTie;
    }
}